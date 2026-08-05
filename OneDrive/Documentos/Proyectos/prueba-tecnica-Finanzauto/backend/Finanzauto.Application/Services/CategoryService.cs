using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Finanzauto.Application.DTOs;
using Finanzauto.Application.Interfaces;
using Finanzauto.Domain.Entities;
using Finanzauto.Domain.Exceptions;
using Finanzauto.Domain.Interfaces;

namespace Finanzauto.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CategoryService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
        {
            var categories = await _unitOfWork.Categories.GetCategoriesWithProductsAsync();
            return _mapper.Map<IEnumerable<CategoryDto>>(categories);
        }

        public async Task<CategoryDto> GetCategoryByIdAsync(int id)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null || !category.IsActive)
                throw new NotFoundException($"Categoría con ID {id} no encontrada");

            var categoryDto = _mapper.Map<CategoryDto>(category);
            var productCount = await _unitOfWork.Products.CountAsync(p => p.CategoryId == id && p.IsActive);
            categoryDto.ProductCount = productCount;

            return categoryDto;
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createDto)
        {
            var existing = await _unitOfWork.Categories.GetByNameAsync(createDto.Name);
            if (existing != null)
                throw new ValidationException($"Ya existe una categoría con el nombre '{createDto.Name}'");

            var category = _mapper.Map<Category>(createDto);
            category.CreatedAt = DateTime.UtcNow;
            category.IsActive = true;

            await _unitOfWork.Categories.AddAsync(category);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto> UpdateCategoryAsync(int id, UpdateCategoryDto updateDto)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null || !category.IsActive)
                throw new NotFoundException($"Categoría con ID {id} no encontrada");

            if (!string.IsNullOrEmpty(updateDto.Name))
            {
                var existing = await _unitOfWork.Categories.GetByNameAsync(updateDto.Name);
                if (existing != null && existing.Id != id)
                    throw new ValidationException($"Ya existe una categoría con el nombre '{updateDto.Name}'");
            }

            _mapper.Map(updateDto, category);
            category.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Categories.UpdateAsync(category);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task DeleteCategoryAsync(int id)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null || !category.IsActive)
                throw new NotFoundException($"Categoría con ID {id} no encontrada");

            var hasProducts = await _unitOfWork.Categories.HasProductsAsync(id);
            if (hasProducts)
                throw new ValidationException("No se puede eliminar la categoría porque tiene productos asociados");

            category.IsActive = false;
            category.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Categories.UpdateAsync(category);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(categoryId);
            if (category == null || !category.IsActive)
                throw new NotFoundException($"Categoría con ID {categoryId} no encontrada");

            var products = await _unitOfWork.Products.GetByCategoryAsync(categoryId);
            return _mapper.Map<IEnumerable<ProductDto>>(products);
        }
    }
}