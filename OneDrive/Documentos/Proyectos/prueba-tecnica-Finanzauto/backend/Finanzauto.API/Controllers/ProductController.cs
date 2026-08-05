using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Finanzauto.Application.DTOs;
using Finanzauto.Application.Interfaces;

namespace Finanzauto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(IProductService productService, ILogger<ProductsController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        // ============================================================
        // POST: api/products/bulk
        // Carga masiva de productos (hasta 100,000)
        // ============================================================
        [HttpPost("bulk")]
        public async Task<IActionResult> BulkCreateProducts([FromBody] BulkProductCreateDto bulkDto)
        {
            if (bulkDto.Quantity > 100000)
            {
                return BadRequest(new { 
                    message = "La cantidad máxima permitida es 100,000 productos",
                    maxAllowed = 100000
                });
            }

            if (bulkDto.Quantity < 1)
            {
                return BadRequest(new { 
                    message = "La cantidad mínima es 1 producto"
                });
            }

            _logger.LogInformation($"Iniciando carga masiva de {bulkDto.Quantity} productos");

            var result = await _productService.BulkCreateProductsAsync(bulkDto);

            if (result.Success)
            {
                return Ok(new
                {
                    success = true,
                    message = result.Message,
                    totalCount = result.TotalCount,
                    processedCount = result.ProcessedCount,
                    timestamp = DateTime.UtcNow
                });
            }

            return StatusCode(500, new
            {
                success = false,
                message = result.Message
            });
        }

        // ============================================================
        // GET: api/products/stats (SIMPLIFICADO)
        // Estadísticas de productos
        // ============================================================
        [HttpGet("stats")]
        [AllowAnonymous]
        public async Task<IActionResult> GetStats()
        {
            // Obtener solo el total de productos
            var products = await _productService.GetProductsAsync(new ProductFilterDto 
            { 
                PageNumber = 1, 
                PageSize = 1 
            });
            
            return Ok(new
            {
                totalProducts = products.TotalCount,
                lastUpdated = DateTime.UtcNow
            });
        }

        // ============================================================
        // GET: api/products
        // Listar productos con paginación
        // ============================================================
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetProducts(
            [FromQuery] string? search,
            [FromQuery] int? categoryId,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] bool? isAvailable,
            [FromQuery] bool? inStock,
            [FromQuery] string? sortBy,
            [FromQuery] bool sortDesc = false,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var filter = new ProductFilterDto
            {
                SearchTerm = search,
                CategoryId = categoryId,
                MinPrice = minPrice,
                MaxPrice = maxPrice,
                IsAvailable = isAvailable,
                InStock = inStock,
                SortBy = sortBy,
                SortDescending = sortDesc,
                PageNumber = page,
                PageSize = pageSize > 100 ? 100 : pageSize
            };

            var result = await _productService.GetProductsAsync(filter);
            return Ok(result);
        }

        // ============================================================
        // GET: api/products/{id}
        // Obtener producto por ID
        // ============================================================
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            return Ok(product);
        }

        // ============================================================
        // POST: api/products
        // Crear producto individual
        // ============================================================
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto createDto)
        {
            var product = await _productService.CreateProductAsync(createDto);
            return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, product);
        }

        // ============================================================
        // PUT: api/products/{id}
        // Actualizar producto
        // ============================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto updateDto)
        {
            var product = await _productService.UpdateProductAsync(id, updateDto);
            return Ok(product);
        }

        // ============================================================
        // DELETE: api/products/{id}
        // Eliminar producto
        // ============================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            await _productService.DeleteProductAsync(id);
            return NoContent();
        }

        // ============================================================
        // PATCH: api/products/{id}/stock
        // Actualizar stock
        // ============================================================
        [HttpPatch("{id}/stock")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] int quantity)
        {
            var result = await _productService.UpdateStockAsync(id, quantity);
            return Ok(new { 
                success = result, 
                message = result ? "Stock actualizado" : "Error al actualizar stock" 
            });
        }
    }
}