using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

namespace Calling
{
    public class DownloadRecording
    {
        /// <summary>
        /// Method to download recording media
        /// </summary>
        /// <param name="recordingchunks">List of recording chunks</param>
        /// <param name="accessKey">Access key of the ACS communication resource</param>
        /// <param name="downloadUri">Download URI</param>
        /// <param name="apiVersion">ACS SDK api version</param>
        public async Task<HttpResponseMessage> Download(List<RecordingChunk> recordingchunks, string accessKey, string downloadUri, string apiVersion)
        {
            var client = new HttpClient();

            // Set Http Method
            var method = HttpMethod.Get;
            StringContent content = null;

            // Build request
            var request = new HttpRequestMessage
            {
                Method = method, // Http GET method
                RequestUri = new Uri(downloadUri + recordingchunks[0].documentId + "?" + apiVersion), // Download recording Url
                Content = content // content if required for POST methods
            };

            string serializedPayload = string.Empty;
            var contentHashed = HmacAuthenticationUtils.CreateContentHash(serializedPayload);

            // Add HAMC headers.
            HmacAuthenticationUtils.AddHmacHeaders(request, contentHashed, accessKey);

            // Make a request to the Azure Communication Services APIs mentioned above
            var response = await client.SendAsync(request).ConfigureAwait(false);
            return response;
        }
    }
}
