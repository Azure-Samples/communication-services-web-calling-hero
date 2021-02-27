// © Microsoft Corporation. All rights reserved.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Azure;
using Azure.Communication;
using Azure.Communication.Identity;
using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Calling
{
    [Route("/userToken")]
    public class UserTokenController : Controller
    {
        private readonly CommunicationIdentityClient _client;

        public UserTokenController(IConfiguration configuration)
        {
            _client = new CommunicationIdentityClient(configuration["ResourceConnectionString"]);
        }

        /// <summary>
        /// Gets a token to be used to initalize the call client
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            try
            {
                Response<(CommunicationUserIdentifier, AccessToken)> response = await _client.CreateUserWithTokenAsync(scopes: new[] { CommunicationTokenScope.VoIP });
                
                var clientResponse = new
                {
                    user = response.Value.Item1,
                    token = response.Value.Item2.Token,
                    expiresOn = response.Value.Item2.ExpiresOn
                };
                
                return this.Ok(clientResponse);
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine($"Error occured while Generating Token: {ex}");
                return this.Ok(this.Json(ex));
            }
        }
    }
}
