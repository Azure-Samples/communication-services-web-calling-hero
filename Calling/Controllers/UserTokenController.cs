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
        [Route("/token")]
        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            try
            {
                Response <CommunicationUserIdentifierAndToken> response = await _client.CreateUserAndTokenAsync(scopes: new[] { CommunicationTokenScope.VoIP });

                var responseValue = response.Value;

                var jsonFormattedUser = new
                {
                    communicationUserId = responseValue.User.Id
                };

                var clientResponse = new
                {
                    user = jsonFormattedUser,
                    token = responseValue.AccessToken.Token,
                    expiresOn = responseValue.AccessToken.ExpiresOn
                };
                
                return this.Ok(clientResponse);
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine($"Error occured while Generating Token: {ex}");
                return this.Ok(this.Json(ex));
            }
        }

        /// <summary>
        /// Gets a token to be used to initalize the call client
        /// </summary>
        /// <returns></returns>
        [Route("/refreshToken/{identity}")]
        [HttpGet]
        public async Task<IActionResult> GetAsync(string identity)
        {
            try
            {
                CommunicationUserIdentifier identifier = new CommunicationUserIdentifier(identity);
                Response<AccessToken> response = await _client.GetTokenAsync(identifier, scopes: new[] { CommunicationTokenScope.VoIP });

                var responseValue = response.Value;
                var clientResponse = new
                {
                    token = responseValue.Token,
                    expiresOn = responseValue.ExpiresOn
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
