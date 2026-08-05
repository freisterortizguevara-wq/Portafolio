using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Finanzauto.Domain.Entities;

namespace Finanzauto.Domain.Interfaces
{
    public interface ICategoryRepository : IRepository<Category>
    {
        Task<Category?> GetByNameAsync(string name);
        Task<IEnumerable<Category>> GetCategoriesWithProductsAsync();
        Task<bool> HasProductsAsync(int categoryId);
    }
}