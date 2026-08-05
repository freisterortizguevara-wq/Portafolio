using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Finanzauto.Domain.Entities;

namespace Finanzauto.Domain.Interfaces
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId);
        Task<IEnumerable<Product>> SearchAsync(string searchTerm);
        Task<IEnumerable<Product>> GetAvailableAsync();
        Task<bool> UpdateStockAsync(int productId, int quantity);
        Task<Product?> GetProductWithCategoryAsync(int productId);
    }
}