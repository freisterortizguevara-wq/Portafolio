using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Finanzauto.Infrastructure.Data;
using Finanzauto.Infrastructure.Repositories;
using Finanzauto.Domain.Interfaces;
using Finanzauto.Application.Interfaces;
using Finanzauto.Application.Services;
using Finanzauto.Application.Mappings;

var builder = WebApplication.CreateBuilder(args);

// ============================================
// 1. CONFIGURAR BASE DE DATOS
// ============================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// ============================================
// 2. REGISTRAR REPOSITORIOS Y SERVICIOS
// ============================================
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// ============================================
// 3. CONFIGURAR AUTOMAPPER
// ============================================
builder.Services.AddAutoMapper(typeof(MappingProfile));

// ============================================
// 4. CONFIGURAR AUTENTICACIÓN JWT
// ============================================
var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "mi_clave_super_segura_para_jwt_1234567890");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "Finanzauto.API",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "Finanzauto.Frontend",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// ============================================
// 5. AGREGAR CACHÉ EN MEMORIA
// ============================================
builder.Services.AddMemoryCache();

// ============================================
// 6. AGREGAR CONTROLADORES
// ============================================
builder.Services.AddControllers();

// ============================================
// 7. AGREGAR CORS
// ============================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// ============================================
// 8. CONSTRUIR LA APLICACIÓN
// ============================================
var app = builder.Build();

// ============================================
// 9. CONFIGURAR EL PIPELINE HTTP
// ============================================
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ============================================
// 10. INICIAR LA APLICACIÓN
// ============================================
app.Run();