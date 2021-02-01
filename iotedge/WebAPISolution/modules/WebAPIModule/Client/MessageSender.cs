using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.Devices.Client;
using Microsoft.Azure.Devices.Client.Transport.Mqtt;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace WebAPIModule
{
    public class MessageSender : IMessageSender
    {
        private readonly ILogger<MessageSender> _logger;

        public MessageSender(ILogger<MessageSender> logger)
        {
            _logger = logger;
        }

        public async Task SendMessageAsync(string message)
        {
            ModuleClient moduleClient = null;
            try
            {
                moduleClient = await Init();
                await SendEventAsync(moduleClient, message);
            }
            catch (System.Exception ex)
            {
                _logger.LogError($"Error while sending message.", ex);
            }
            finally
            {
                if (moduleClient != null)
                {
                    // Close connection with the Edge runtime
                    await moduleClient.CloseAsync();
                    moduleClient.Dispose();
                }
            }
        }
        private async Task<ModuleClient> Init()
        {
            MqttTransportSettings mqttSetting = new MqttTransportSettings(TransportType.Mqtt_Tcp_Only);
            ITransportSettings[] settings = { mqttSetting };

            // Open a connection to the Edge runtime
            ModuleClient ioTHubModuleClient = await ModuleClient.CreateFromEnvironmentAsync(settings);
            await ioTHubModuleClient.OpenAsync();
            return ioTHubModuleClient;
        }
        private async Task SendEventAsync(ModuleClient moduleClient, string message)
        {
            string dataBuffer = JsonConvert.SerializeObject(message);
            var eventMessage = new Message(Encoding.UTF8.GetBytes(dataBuffer));
            eventMessage.ContentType = "application/json";
            eventMessage.ContentEncoding = "utf-8";
             _logger.LogInformation($"Message sent: {message}");
            await moduleClient.SendEventAsync("output", eventMessage);
        }
    }
}