using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Calling
{
    public class HmacAuthenticationUtils
    {
        /// <summary>
        /// Method to add headers to hash the content
        /// </summary>
        /// <param name="requestMessage"></param>
        /// <param name="contentHash"></param>
        /// <param name="accessKey"></param>
        public static void AddHmacHeaders(HttpRequestMessage requestMessage, string contentHash, string accessKey)
        {
            var utcNowString = DateTimeOffset.UtcNow.ToString("r", CultureInfo.InvariantCulture);
            var uri = requestMessage.RequestUri;
            var host = uri.Authority;
            var pathAndQuery = uri.PathAndQuery;

            var stringToSign = $"{requestMessage.Method}\n{pathAndQuery}\n{utcNowString};{host};{contentHash}";
            var hmac = new HMACSHA256(Convert.FromBase64String(accessKey));
            var hash = hmac.ComputeHash(Encoding.ASCII.GetBytes(stringToSign));
            var signature = Convert.ToBase64String(hash);
            var authorization = $"HMAC-SHA256 SignedHeaders=date;host;x-ms-content-sha256&Signature={signature}";

            requestMessage.Headers.Add("x-ms-content-sha256", contentHash);
            requestMessage.Headers.Add("Date", utcNowString);
            requestMessage.Headers.Add("Authorization", authorization);
        }
        /// <summary>
        /// Method to Hash the content of the request
        /// </summary>
        /// <param name="content"></param>
        /// <returns></returns>
        public static string CreateContentHash(string content)
        {
            var alg = SHA256.Create();

            using (var memoryStream = new MemoryStream())
            using (var contentHashStream = new CryptoStream(memoryStream, alg, CryptoStreamMode.Write))
            {
                using (var swEncrypt = new StreamWriter(contentHashStream))
                {
                    if (content != null)
                    {
                        swEncrypt.Write(content);
                    }
                }
            }

            return Convert.ToBase64String(alg.Hash);
        }
    }
}
