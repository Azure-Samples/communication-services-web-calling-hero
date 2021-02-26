﻿// © Microsoft Corporation. All rights reserved.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Azure;
using Azure.Communication;
using Azure.Communication.Identity;
using Azure.Communication.Identity.Models;
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
                Response<CommunicationUserIdentifier> userResponse = await _client.CreateUserAsync();
                CommunicationUserIdentifier user = userResponse.Value;
                Response<AccessToken> tokenResponse =
                    await _client.IssueTokenAsync(user, scopes: new[] { CommunicationTokenScope.VoIP });
                string token = tokenResponse.Value.Token;
                DateTimeOffset expiresOn = tokenResponse.Value.ExpiresOn;
                return this.Ok(tokenResponse);
            } 
            catch (RequestFailedException ex)
            {
                Console.WriteLine($"Error occured while Generating Token: {ex}");
                return this.Ok(this.Json(ex));
            }
        }
    }
}
