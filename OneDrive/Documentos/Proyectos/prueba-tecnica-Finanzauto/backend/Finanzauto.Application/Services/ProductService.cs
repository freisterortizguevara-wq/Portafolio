using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Finanzauto.Application.DTOs;
using Finanzauto.Application.Interfaces;
using Finanzauto.Domain.Entities;
using Finanzauto.Domain.Exceptions;
using Finanzauto.Domain.Interfaces;

namespace Finanzauto.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private readonly ILogger<ProductService> _logger;
        private const string CACHE_KEY_PRODUCTS = "products_all";
        private const string CACHE_KEY_PRODUCT_PREFIX = "product_";
        private readonly TimeSpan CACHE_DURATION = TimeSpan.FromMinutes(5);
        private const int BATCH_SIZE = 5000;

        public ProductService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IMemoryCache cache,
            ILogger<ProductService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cache = cache;
            _logger = logger;
        }

        public async Task<PagedResult<ProductDto>> GetProductsAsync(ProductFilterDto filter)
        {
            try
            {
                var predicate = BuildFilterPredicate(filter);
                var orderBy = BuildOrderBy(filter.SortBy, filter.SortDescending);

                var products = await _unitOfWork.Products.GetPagedAsync(
                    filter.PageNumber,
                    filter.PageSize,
                    predicate,
                    orderBy);

                var totalCount = await _unitOfWork.Products.CountAsync(predicate);
                var productDtos = _mapper.Map<IEnumerable<ProductDto>>(products);

                return new PagedResult<ProductDto>
                {
                    Items = productDtos,
                    TotalCount = totalCount,
                    PageNumber = filter.PageNumber,
                    PageSize = filter.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener productos");
                throw;
            }
        }

        public async Task<ProductDto> GetProductByIdAsync(int id)
        {
            string cacheKey = $"{CACHE_KEY_PRODUCT_PREFIX}{id}";
            if (_cache.TryGetValue(cacheKey, out ProductDto? cachedProduct))
            {
                if (cachedProduct != null)
                    return cachedProduct;
            }

            var product = await _unitOfWork.Products.GetProductWithCategoryAsync(id);

            if (product == null)
                throw new NotFoundException($"Producto con ID {id} no encontrado");

            var productDto = _mapper.Map<ProductDto>(product);
            _cache.Set(cacheKey, productDto, CACHE_DURATION);

            return productDto;
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto createDto)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(createDto.CategoryId);
            if (category == null)
                throw new NotFoundException($"Categoría con ID {createDto.CategoryId} no encontrada");

            if (!string.IsNullOrEmpty(createDto.Sku))
            {
                var existing = await _unitOfWork.Products.FindAsync(p => p.Sku == createDto.Sku);
                if (existing.Any())
                    throw new ValidationException($"Ya existe un producto con el SKU '{createDto.Sku}'");
            }

            var product = _mapper.Map<Product>(createDto);
            product.IsAvailable = product.Stock > 0;
            product.CreatedAt = DateTime.UtcNow;
            product.IsActive = true;

            await _unitOfWork.Products.AddAsync(product);
            await _unitOfWork.SaveChangesAsync();

            _cache.Remove(CACHE_KEY_PRODUCTS);

            return _mapper.Map<ProductDto>(product);
        }

        public async Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto updateDto)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(id);
            if (product == null)
                throw new NotFoundException($"Producto con ID {id} no encontrado");

            if (updateDto.CategoryId.HasValue)
            {
                var category = await _unitOfWork.Categories.GetByIdAsync(updateDto.CategoryId.Value);
                if (category == null)
                    throw new NotFoundException($"Categoría con ID {updateDto.CategoryId.Value} no encontrada");
            }

            if (!string.IsNullOrEmpty(updateDto.Sku))
            {
                var existing = await _unitOfWork.Products.FindAsync(
                    p => p.Sku == updateDto.Sku && p.Id != id);
                if (existing.Any())
                    throw new ValidationException($"Ya existe un producto con el SKU '{updateDto.Sku}'");
            }

            _mapper.Map(updateDto, product);

            if (updateDto.Stock.HasValue)
                product.IsAvailable = updateDto.Stock.Value > 0;

            product.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Products.UpdateAsync(product);
            await _unitOfWork.SaveChangesAsync();

            _cache.Remove($"{CACHE_KEY_PRODUCT_PREFIX}{id}");
            _cache.Remove(CACHE_KEY_PRODUCTS);

            return _mapper.Map<ProductDto>(product);
        }

        public async Task DeleteProductAsync(int id)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(id);
            if (product == null)
                throw new NotFoundException($"Producto con ID {id} no encontrado");

            product.IsActive = false;
            product.IsAvailable = false;
            product.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Products.UpdateAsync(product);
            await _unitOfWork.SaveChangesAsync();

            _cache.Remove($"{CACHE_KEY_PRODUCT_PREFIX}{id}");
            _cache.Remove(CACHE_KEY_PRODUCTS);
        }

        public async Task<BulkCreateResultDto> BulkCreateProductsAsync(BulkProductCreateDto bulkDto)
        {
            var result = new BulkCreateResultDto();
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            _logger.LogInformation($"Iniciando carga masiva de {bulkDto.Quantity} productos...");

            try
            {
                var categories = await _unitOfWork.Categories.GetAllAsync();
                var categoryList = categories.ToList();

                if (!categoryList.Any())
                    throw new ValidationException("No hay categorías disponibles");

                if (bulkDto.CategoryId.HasValue)
                {
                    var category = categoryList.FirstOrDefault(c => c.Id == bulkDto.CategoryId.Value);
                    if (category == null)
                        throw new NotFoundException($"Categoría con ID {bulkDto.CategoryId.Value} no encontrada");
                }

                var products = new List<Product>(bulkDto.Quantity);
                var random = new Random();

                for (int i = 0; i < bulkDto.Quantity; i++)
                {
                    var categoryId = bulkDto.CategoryId ?? categoryList[random.Next(categoryList.Count)].Id;
                    var product = GenerateRandomProduct(categoryId, random, i);
                    products.Add(product);
                }

                _logger.LogInformation($"Generados {products.Count} productos");

                int totalInserted = 0;
                int totalBatches = (int)Math.Ceiling((double)products.Count / BATCH_SIZE);

                for (int i = 0; i < totalBatches; i++)
                {
                    var batch = products.Skip(i * BATCH_SIZE).Take(BATCH_SIZE);
                    await _unitOfWork.Products.AddRangeAsync(batch);
                    await _unitOfWork.SaveChangesAsync();
                    totalInserted += batch.Count();

                    if (i % 10 == 0 || i == totalBatches - 1)
                    {
                        _logger.LogInformation($"Progreso: {totalInserted}/{products.Count} productos ({(totalInserted * 100 / products.Count)}%)");
                    }
                }

                stopwatch.Stop();
                _cache.Remove(CACHE_KEY_PRODUCTS);

                result.Success = true;
                result.TotalCount = products.Count;
                result.ProcessedCount = totalInserted;
                result.Message = $"{totalInserted} productos creados en {stopwatch.ElapsedMilliseconds}ms";

                return result;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(ex, $"Error en carga masiva: {ex.Message}");

                result.Success = false;
                result.Message = $"Error: {ex.Message}";
                return result;
            }
        }

        public async Task<bool> UpdateStockAsync(int productId, int quantity)
        {
            var result = await _unitOfWork.Products.UpdateStockAsync(productId, quantity);
            if (result)
            {
                _cache.Remove($"{CACHE_KEY_PRODUCT_PREFIX}{productId}");
                _cache.Remove(CACHE_KEY_PRODUCTS);
            }
            return result;
        }

        public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm)
        {
            var products = await _unitOfWork.Products.SearchAsync(searchTerm);
            return _mapper.Map<IEnumerable<ProductDto>>(products);
        }

        private static Expression<Func<Product, bool>>? BuildFilterPredicate(ProductFilterDto filter)
        {
            if (filter == null) return null;

            return p =>
                p.IsActive &&
                (!filter.IsAvailable.HasValue || p.IsAvailable == filter.IsAvailable.Value) &&
                (!filter.InStock.HasValue || (filter.InStock.Value ? p.Stock > 0 : p.Stock <= 0)) &&
                (!filter.CategoryId.HasValue || p.CategoryId == filter.CategoryId.Value) &&
                (!filter.MinPrice.HasValue || p.Price >= filter.MinPrice.Value) &&
                (!filter.MaxPrice.HasValue || p.Price <= filter.MaxPrice.Value) &&
                (string.IsNullOrEmpty(filter.SearchTerm) ||
                    p.Name.ToLower().Contains(filter.SearchTerm.ToLower()) ||
                    (p.Description != null && p.Description.ToLower().Contains(filter.SearchTerm.ToLower())) ||
                    (p.Sku != null && p.Sku.ToLower().Contains(filter.SearchTerm.ToLower())));
        }

        private static Func<IQueryable<Product>, IOrderedQueryable<Product>>? BuildOrderBy(string? sortBy, bool sortDescending)
        {
            if (string.IsNullOrEmpty(sortBy))
                return null;

            return sortBy.ToLower() switch
            {
                "name" => query => sortDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
                "price" => query => sortDescending ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
                "stock" => query => sortDescending ? query.OrderByDescending(p => p.Stock) : query.OrderBy(p => p.Stock),
                "createdat" => query => sortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
                _ => null
            };
        }

        private static Product GenerateRandomProduct(int categoryId, Random random, int index)
        {
            var adjectives = new[] { "Premium", "Ultra", "Mega", "Super", "Pro", "Plus", "Essential", "Advanced", "Smart", "Power", "Enterprise", "Business", "Cloud", "Data", "Fast", "Secure", "Reliable", "Agile" };
            var nouns = new[] { "Server", "Cloud", "Storage", "Backup", "Security", "Analytics", "Compute", "Network", "Database", "AI", "Edge", "Core", "Platform", "Solution", "Gateway", "Firewall" };
            var brands = new[] { "TechPro", "DataCore", "CloudNet", "SecureSys", "Innova", "VisionIT", "Apex", "Nexus", "Quantum", "Astra", "Zenith", "Pioneer" };

            var name = $"{adjectives[random.Next(adjectives.Length)]} {nouns[random.Next(nouns.Length)]} {brands[random.Next(brands.Length)]} {index + 1}";
            var price = Math.Round((decimal)(random.NextDouble() * 9000 + 100), 2);
            var stock = random.Next(0, 500);
            var sku = $"SKU-{DateTime.UtcNow.Ticks}-{index}-{random.Next(1000, 9999)}";

            return new Product
            {
                Name = name,
                Description = $"Producto de alta calidad en la categoría {nouns[random.Next(nouns.Length)]}",
                Price = price,
                Stock = stock,
                CategoryId = categoryId,
                Sku = sku,
                IsAvailable = stock > 0,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Attributes = new Dictionary<string, object>
                {
                    ["brand"] = brands[random.Next(brands.Length)],
                    ["weight"] = random.Next(1, 50),
                    ["color"] = new[] { "Rojo", "Azul", "Verde", "Negro", "Blanco", "Gris", "Plateado", "Dorado" }[random.Next(8)],
                    ["warranty"] = random.Next(1, 5) + " años"
                }
            };
        }
    }
}