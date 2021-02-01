using System;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace WebAPIModule.Controllers
{
    [ApiController]
    [Route("")]
    [Route("[controller]")]
    public class ModuleController : ControllerBase
    {
        private readonly ILogger<ModuleController> _logger;
        private readonly IMessageSender _messageSender;

        public ModuleController(ILogger<ModuleController> logger, IMessageSender messageSender)
        {
            _messageSender = messageSender ?? throw new ArgumentNullException(nameof(messageSender));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet]
        public String Get()
        {            
            return "Module up & running";
        }

        [HttpPost]
        public async Task<string> PostAsync()
        {
            await ExecuteAsync();
            return "Success";
        }

        private async Task ExecuteAsync()
        {
           _logger.LogInformation("Handling web service Post request");

            JObject requestBody;
            try
            {
                requestBody = await DeserializeRequestBody(Request.Body);
                await _messageSender.SendMessageAsync(requestBody.ToString());
            }
            catch (Exception)
            {
                Response.StatusCode = 400;
                return;
            }
        }
        private async Task<JObject> DeserializeRequestBody(Stream body)
        {
            var memoryStream = new MemoryStream();
            await body.CopyToAsync(memoryStream);
            memoryStream.Position = 0;
            var serializer = new JsonSerializer();
            var streamReader = new StreamReader(memoryStream);
            var textReader = new JsonTextReader(streamReader);
            try
            {
                return serializer.Deserialize<JObject>(textReader);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Invalid request body.", ex);
                memoryStream.Position = 0;
                using (var bodyReader = new StreamReader(memoryStream))
                {
                    var msg = $"Invalid request body:\n\n{await bodyReader.ReadToEndAsync()}";
                    _logger.LogWarning(msg);
                }
                throw;
            }
            finally
            {
                textReader.Close();
                streamReader.Close();
                memoryStream.Close();
            }
        }
    }
}
