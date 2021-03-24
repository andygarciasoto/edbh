using System.Threading.Tasks;
namespace WebAPIModule
{
    public interface IMessageSender
    {
        Task SendMessageAsync(string message);
    }
}