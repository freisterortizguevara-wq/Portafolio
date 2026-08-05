using Microsoft.EntityFrameworkCore;
using Finanzauto.Domain.Entities;

namespace Finanzauto.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // ===== TABLAS =====
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<User> Users { get; set; }

        // ===== CONFIGURACIONES =====
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // =========================================
            // CONFIGURACIÓN DE PRODUCT
            // =========================================
            modelBuilder.Entity<Product>(entity =>
            {
                // Índices
                entity.HasIndex(p => p.Name);
                entity.HasIndex(p => p.Sku).IsUnique();
                entity.HasIndex(p => p.CategoryId);

                // Precisión del precio
                entity.Property(p => p.Price)
                    .HasPrecision(18, 2);

                // Atributos JSON
                entity.Property(p => p.Attributes)
    .HasColumnType("jsonb")
    .HasConversion(
        v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
        v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, object>()
    );
            });

            // =========================================
            // CONFIGURACIÓN DE CATEGORY
            // =========================================
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasIndex(c => c.Name).IsUnique();

                entity.Property(c => c.Name)
                    .HasMaxLength(100)
                    .IsRequired();
            });

            // =========================================
            // CONFIGURACIÓN DE USER
            // =========================================
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Username).IsUnique();
                entity.HasIndex(u => u.Email).IsUnique();

                entity.Property(u => u.Username)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(u => u.Email)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(u => u.PasswordHash)
                    .IsRequired();
            });
        }
    }
}