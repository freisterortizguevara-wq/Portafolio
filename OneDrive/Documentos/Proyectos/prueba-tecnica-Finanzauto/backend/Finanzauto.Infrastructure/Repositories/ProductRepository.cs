using Microsoft.EntityFrameworkCore;
using Finanzauto.Domain.Entities;
using Finanzauto.Domain.Interfaces;
using Finanzauto.Infrastructure.Data;
using System.Linq.Expressions;

namespace Finanzauto.Infrastructure.Repositories
{
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        public ProductRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId)
        {
            return await _dbSet
                .Where(p => p.CategoryId == categoryId && p.IsActive)
                .Include(p => p.Category)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await _dbSet.Include(p => p.Category).ToListAsync();

            var term = searchTerm.ToLower();
            return await _dbSet
                .Where(p => p.IsActive &&
                    (p.Name.ToLower().Contains(term) ||
                     (p.Description != null && p.Description.ToLower().Contains(term)) ||
                     (p.Sku != null && p.Sku.ToLower().Contains(term))))
                .Include(p => p.Category)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetAvailableAsync()
        {
            return await _dbSet
                .Where(p => p.IsActive && p.IsAvailable && p.Stock > 0)
                .Include(p => p.Category)
                .ToListAsync();
        }

        public async Task<bool> UpdateStockAsync(int productId, int quantity)
        {
            var product = await GetByIdAsync(productId);
            if (product == null) return false;

            product.Stock = quantity;
            product.IsAvailable = quantity > 0;
            product.UpdatedAt = DateTime.UtcNow;
            await UpdateAsync(product);
            return true;
        }

        public async Task<Product?> GetProductWithCategoryAsync(int productId)
        {
            return await _dbSet
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == productId && p.IsActive);
        }

        public override async Task<IEnumerable<Product>> GetPagedAsync(int pageNumber, int pageSize,
            Expression<Func<Product, bool>>? predicate = null,
            Func<IQueryable<Product>, IOrderedQueryable<Product>>? orderBy = null)
        {
            IQueryable<Product> query = _dbSet.Include(p => p.Category);

            if (predicate != null)
                query = query.Where(predicate);

            if (orderBy != null)
                query = orderBy(query);
            else
                query = query.OrderByDescending(p => p.CreatedAt);

            return await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}