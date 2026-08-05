using Microsoft.AspNetCore.Mvc;
using Finanzauto.Application.DTOs;
using Finanzauto.Application.Interfaces;

namespace Finanzauto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // ============================================
        // POST: api/auth/login
        // Iniciar sesión
        // ============================================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var result = await _authService.LoginAsync(loginDto);
            return Ok(result);
        }

        // ============================================
        // POST: api/auth/register
        // Registrar un nuevo usuario
        // ============================================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var result = await _authService.RegisterAsync(registerDto);
            return Created(string.Empty, result);
        }

        // ============================================
        // POST: api/auth/refresh
        // Refrescar el token
        // ============================================
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
        {
            var result = await _authService.RefreshTokenAsync(refreshTokenDto);
            return Ok(result);
        }

        // ============================================
        // POST: api/auth/logout
        // Cerrar sesión
        // ============================================
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId > 0)
            {
                await _authService.LogoutAsync(userId);
            }
            return Ok(new { message = "Sesión cerrada exitosamente" });
        }
    }
}