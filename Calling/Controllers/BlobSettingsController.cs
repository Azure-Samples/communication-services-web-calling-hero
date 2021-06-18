// © Microsoft Corporation. All rights reserved.

using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Calling
{
    public class BlobSettingsController : Controller
    {
        private readonly string _blobSasUri;
        private readonly string _blobContainerName;

        public BlobSettingsController(IConfiguration configuration)
        {
            _blobSasUri = configuration["LogBlobSasUri"];
            _blobContainerName = configuration["LogBlobContainerName"];
        }

        /// <summary>
        /// Gets Blob settings for log service
        /// </summary>
        /// <returns></returns>
        [Route("/blobSettings")]
        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            var clientResponse = new
            {
                sasUri = _blobSasUri,
                containerName = _blobContainerName,
            };

            return this.Ok(clientResponse);
        }
    }
}
