using System.Threading.Tasks;
using Finanzauto.Domain.Entities;

namespace Finanzauto.Domain.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByEmailAsync(string email);
    }
}