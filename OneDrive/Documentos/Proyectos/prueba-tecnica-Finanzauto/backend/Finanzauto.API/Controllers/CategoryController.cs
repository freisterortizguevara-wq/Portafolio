using Microsoft.AspNetCore.Mvc;
using Finanzauto.Application.DTOs;
using Finanzauto.Application.Interfaces;

namespace Finanzauto.API.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        // ============================================
        // GET: api/categories
        // Listar todas las categorías
        // ============================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        // ============================================
        // GET: api/categories/5
        // Obtener una categoría por id
        // ============================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryService.GetCategoryByIdAsync(id);
            return Ok(category);
        }

        // ============================================
        // GET: api/categories/5/products
        // Productos de una categoría
        // ============================================
        [HttpGet("{id}/products")]
        public async Task<IActionResult> GetProducts(int id)
        {
            var products = await _categoryService.GetProductsByCategoryAsync(id);
            return Ok(products);
        }

        // ============================================
        // POST: api/categories
        // Crear una categoría
        // ============================================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto createDto)
        {
            var category = await _categoryService.CreateCategoryAsync(createDto);
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        // ============================================
        // PUT: api/categories/5
        // Actualizar una categoría
        // ============================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto updateDto)
        {
            var category = await _categoryService.UpdateCategoryAsync(id, updateDto);
            return Ok(category);
        }

        // ============================================
        // DELETE: api/categories/5
        // Eliminar (soft delete) una categoría
        // ============================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _categoryService.DeleteCategoryAsync(id);
            return NoContent();
        }
    }
}