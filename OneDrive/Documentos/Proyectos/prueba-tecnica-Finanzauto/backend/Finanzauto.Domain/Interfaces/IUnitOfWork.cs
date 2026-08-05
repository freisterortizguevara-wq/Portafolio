using System;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzauto.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IProductRepository Products { get; }
        ICategoryRepository Categories { get; }
        IUserRepository Users { get; }  // ← AGREGAR ESTA LÍNEA
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        Task<bool> SaveAllAsync(CancellationToken cancellationToken = default);
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}