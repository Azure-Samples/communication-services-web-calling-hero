using Azure.Communication.CallingServer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.EventGrid;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Calling.Controllers
{
    [Route("/recording")]
    public class CallRecordingController : Controller
    {
        private readonly string accessKey;
        private readonly string apiVersion;
        private readonly string blobStorageConnectionString;
        private readonly string callbackUri;
        private readonly string containerName;
        private readonly CallingServerClient callingServerClient;
        private readonly string downloadUri;
        private const string CallRecodingActiveErrorCode = "8553";
        private const string CallRecodingActiveError = "Recording is already in progress, one recording can be active at one time.";
        public ILogger<CallRecordingController> Logger { get; }
        static Dictionary<string, string> recordingData = new Dictionary<string, string>();

        public CallRecordingController(IConfiguration configuration, ILogger<CallRecordingController> logger)
        {
            accessKey = configuration["AccessKey"];
            apiVersion = configuration["ApiVersion"];
            blobStorageConnectionString = configuration["BlobStorageConnectionString"];
            callbackUri = configuration["CallbackUri"];
            containerName = configuration["ContainerName"];
            callingServerClient = new CallingServerClient(configuration["ResourceConnectionString"]);
            downloadUri = configuration["DownloadUri"];
            Logger = logger;
        }

        /// <summary>
        /// Method to start call recording
        /// </summary>
        /// <param name="serverCallId">Conversation id of the call</param>
        [HttpGet]
        [Route("startRecording")]
        public async Task<IActionResult> StartRecordingAsync(string serverCallId)
        {
            try
            {
                if (!string.IsNullOrEmpty(serverCallId))
                {
                    var uri = new Uri(callbackUri);
                    var startRecordingResponse = await callingServerClient.InitializeServerCall(serverCallId).StartRecordingAsync(uri).ConfigureAwait(false);
                    var recordingId = startRecordingResponse.Value.RecordingId;
                    if (!recordingData.ContainsKey(serverCallId))
                    {
                        recordingData.Add(serverCallId, string.Empty);
                    }
                    recordingData[serverCallId] = recordingId;

                    return Json(recordingId);
                }
                else
                {
                    return BadRequest(new { Message = "serverCallId is invalid" });
                }
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains(CallRecodingActiveErrorCode))
                {
                    return BadRequest(new { Message = CallRecodingActiveError });
                }
                return Json(new { Exception = ex });
            }
        }

        /// <summary>
        /// Method to pause call recording
        /// </summary>
        /// <param name="serverCallId">Conversation id of the call</param>
        /// <param name="recordingId">Recording id of the call</param>
        [HttpGet]
        [Route("pauseRecording")]
        public async Task<IActionResult> PauseRecordingAsync(string serverCallId, string recordingId)
        {
            try
            {
                if (!string.IsNullOrEmpty(serverCallId))
                {
                    if (string.IsNullOrEmpty(recordingId))
                    {
                        recordingId = recordingData[serverCallId];
                    }
                    else
                    {
                        if (!recordingData.ContainsKey(serverCallId))
                        {
                            recordingData[serverCallId] = recordingId;
                        }
                    }
                    await callingServerClient.InitializeServerCall(serverCallId).PauseRecordingAsync(recordingId);

                    return Ok();
                }
                else
                {
                    return BadRequest(new { Message = "serverCallId is invalid" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { Exception = ex });
            }
        }

        /// <summary>
        /// Method to resume call recording
        /// </summary>
        /// <param name="serverCallId">Conversation id of the call</param>
        /// <param name="recordingId">Recording id of the call</param>
        [HttpGet]
        [Route("resumeRecording")]
        public async Task<IActionResult> ResumeRecordingAsync(string serverCallId, string recordingId)
        {
            try
            {
                if (!string.IsNullOrEmpty(serverCallId))
                {
                    if (string.IsNullOrEmpty(recordingId))
                    {
                        recordingId = recordingData[serverCallId];
                    }
                    else
                    {
                        if (!recordingData.ContainsKey(serverCallId))
                        {
                            recordingData[serverCallId] = recordingId;
                        }
                    }
                    await callingServerClient.InitializeServerCall(serverCallId).ResumeRecordingAsync(recordingId);
                    return Ok();
                }
                else
                {
                    return BadRequest(new { Message = "serverCallId is invalid" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { Exception = ex });
            }
        }

        /// <summary>
        /// Method to stop call recording
        /// </summary>
        /// <param name="serverCallId">Conversation id of the call</param>
        /// <param name="recordingId">Recording id of the call</param>
        /// <returns></returns>
        [HttpGet]
        [Route("stopRecording")]
        public async Task<IActionResult> StopRecordingAsync(string serverCallId, string recordingId)
        {
            try
            {
                if (!string.IsNullOrEmpty(serverCallId))
                {
                    if (string.IsNullOrEmpty(recordingId))
                    {
                        recordingId = recordingData[serverCallId];
                    }
                    else
                    {
                        if (!recordingData.ContainsKey(serverCallId))
                        {
                            recordingData[serverCallId] = recordingId;
                        }
                    }

                    await callingServerClient.InitializeServerCall(serverCallId).StopRecordingAsync(recordingId).ConfigureAwait(false);
                    if (recordingData.ContainsKey(serverCallId))
                    {
                        recordingData.Remove(serverCallId);
                    }
                    return Ok();
                }
                else
                {
                    return BadRequest(new { Message = "serverCallId is invalid" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { Exception = ex });
            }
        }

        /// <summary>
        /// Web hook to receive the recording file update status event
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("getRecordingFile")]
        public async Task<ActionResult> GetRecordingFile([FromBody] object request)
        {
            try
            {
                //Deserializing the request 
                var eventGridEvent = JsonConvert.DeserializeObject<EventGridEvent[]>(request.ToString()).FirstOrDefault();

                if (string.Equals(eventGridEvent.EventType, EventTypes.EventGridSubscriptionValidationEvent, StringComparison.OrdinalIgnoreCase))
                {
                    var data = eventGridEvent.Data as JObject;
                    var eventData = data.ToObject<SubscriptionValidationEventData>();

                    var responseData = new SubscriptionValidationResponse
                    {
                        ValidationResponse = eventData.ValidationCode
                    };

                    if (responseData.ValidationResponse != null)
                    {
                        return Ok(responseData);
                    }
                }

                if (string.Equals(eventGridEvent.EventType, "Microsoft.Communication.RecordingFileStatusUpdated", StringComparison.OrdinalIgnoreCase))
                {
                    Logger.LogInformation($"Event type is -- > {eventGridEvent.EventType}");

                    Data data = EventSerializer.DeserializeObject<Data>(eventGridEvent.Data.ToString());
                    DownloadRecording downloadRecording = new DownloadRecording();

                    Logger.LogInformation("Start downloading recorded media -- >");
                    var response = await downloadRecording.Download(data.recordingStorageInfo.recordingChunks, accessKey, downloadUri, apiVersion);

                    Logger.LogInformation("Download media api response code -- > " + response.StatusCode.ToString());

                    string filePath = ".\\" + data.recordingStorageInfo.recordingChunks[0].documentId + ".mp4";

                    Logger.LogInformation("Save downloaded media -- >");
                    using (Stream streamToReadFrom = await response.Content.ReadAsStreamAsync())
                    {
                        using (Stream streamToWriteTo = System.IO.File.Open(filePath, FileMode.Create))
                        {
                            await streamToReadFrom.CopyToAsync(streamToWriteTo);
                            await streamToWriteTo.FlushAsync();
                        }

                        response.Content = null;
                    }

                    Logger.LogInformation($"Starting to upload recording to BlobStorage into container -- > {containerName}");

                    var blobStorageHelperInfo = await BlobStorageHelper.UploadFileAsync(blobStorageConnectionString, containerName, filePath, filePath);

                    if (blobStorageHelperInfo.Status)
                    {
                        Logger.LogInformation(blobStorageHelperInfo.Message);
                    }
                    else
                    {
                        Logger.LogError($"File was not uploaded,{blobStorageHelperInfo.Message}");
                    }
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return Json(new { Exception = ex });
            }
        }
    }
}