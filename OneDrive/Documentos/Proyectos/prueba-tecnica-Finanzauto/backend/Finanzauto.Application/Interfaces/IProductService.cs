using Finanzauto.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Finanzauto.Application.Interfaces
{
    public interface IProductService
    {
        Task<PagedResult<ProductDto>> GetProductsAsync(ProductFilterDto filter);
        Task<ProductDto> GetProductByIdAsync(int id);
        Task<ProductDto> CreateProductAsync(CreateProductDto createDto);
        Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto updateDto);
        Task DeleteProductAsync(int id);
        Task<BulkCreateResultDto> BulkCreateProductsAsync(BulkProductCreateDto bulkDto);
        Task<bool> UpdateStockAsync(int productId, int quantity);
        Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm);
    }
}