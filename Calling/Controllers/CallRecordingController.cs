using Azure.Communication.CallingServer;
using Microsoft.AspNetCore.Mvc;
using Azure.Messaging.EventGrid;
using Azure.Messaging.EventGrid.SystemEvents;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using Newtonsoft.Json;

namespace Calling.Controllers
{
    [Route("/recording")]
    public class CallRecordingController : Controller
    {
        private readonly string recordingBlobStorageConnectionString;
        private readonly string callbackUri;
        private readonly string recordingContainerName;
        private readonly CallingServerClient callingServerClient;
        private const string CallRecodingActiveErrorCode = "8553";
        private const string CallRecodingActiveError = "Recording is already in progress, one recording can be active at one time.";
        public ILogger<CallRecordingController> Logger { get; }
        static Dictionary<string, RecInfo> recordingData = new Dictionary<string, RecInfo>();
        private readonly string isRecordingEnabled;
        public static string recFileFormat;

        public CallRecordingController(IConfiguration configuration, ILogger<CallRecordingController> logger)
        {
            recordingBlobStorageConnectionString = configuration["RecordingBlobStorageConnectionString"];
            callbackUri = configuration["CallbackUri"];
            recordingContainerName = configuration["RecordingContainerName"];
            callingServerClient = new CallingServerClient(configuration["ResourceConnectionString"]);
            isRecordingEnabled = configuration["IsRecordingEnabled"];
            Logger = logger;
        }

        [Route("/recordingSettings")]
        [HttpGet]
        public IActionResult GetRecording()
        {
            var clientResponse = new
            {
                isRecordingEnabled = this.isRecordingEnabled,
            };

            return this.Ok(clientResponse);
        }

        /// <summary>
        /// Method to start call recording
        /// </summary>
        /// <param name="serverCallId">Conversation id of the call</param>
        [HttpGet]
        [Route("startRecording")]
        public async Task<IActionResult> StartRecordingAsync(string serverCallId, string recordingContent = "", string recordingChannel = "", string recordingFormat = "")
        {
            try
            {
                if (!string.IsNullOrEmpty(serverCallId))
                {
                    RecordingContent recContentVal;
                    RecordingChannel recChannelVal;
                    RecordingFormat recFormatVal;

                    //Passing RecordingContent initiates recording in specific format. audio/audiovideo
                    //RecordingChannel is used to pass the channel type. mixed/unmixed
                    //RecordingFormat is used to pass the format of the recording. mp4/mp3/wav

                    var startRecordingResponse = await callingServerClient
                        .InitializeServerCall(serverCallId)
                        .StartRecordingAsync(
                            new Uri(callbackUri),
                            Mapper.RecordingContentMap.TryGetValue(recordingContent.ToLower(), out recContentVal) ? recContentVal : RecordingContent.AudioVideo,
                            Mapper.RecordingChannelMap.TryGetValue(recordingChannel.ToLower(), out recChannelVal) ? recChannelVal : RecordingChannel.Mixed,
                            Mapper.RecordingFormatMap.TryGetValue(recordingFormat.ToLower(), out recFormatVal) ? recFormatVal : RecordingFormat.Mp4
                        ).ConfigureAwait(false);

                    Logger.LogInformation($"StartRecordingAsync response -- >  {startRecordingResponse.GetRawResponse()}, Recording Id: {startRecordingResponse.Value.RecordingId}");

                    if (recordingData.ContainsKey(serverCallId))
                    {
                        recordingData.Remove(serverCallId);
                    }

                    var recordingId = startRecordingResponse.Value.RecordingId;
                    recordingData.Add(serverCallId, new RecInfo(recordingId, string.Empty));

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
                        recordingId = recordingData[serverCallId].recordingId;
                    }
                    else
                    {
                        if (!recordingData.ContainsKey(serverCallId))
                        {
                            recordingData[serverCallId] = new RecInfo(recordingId, string.Empty);
                        }
                    }
                    var pauseRecording = await callingServerClient.InitializeServerCall(serverCallId).PauseRecordingAsync(recordingId);
                    Logger.LogInformation($"PauseRecordingAsync response -- > {pauseRecording}");

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
                        recordingId = recordingData[serverCallId].recordingId;
                    }
                    else
                    {
                        if (!recordingData.ContainsKey(serverCallId))
                        {
                            recordingData[serverCallId] = new RecInfo(recordingId, string.Empty);
                        }
                    }
                    var resumeRecording = await callingServerClient.InitializeServerCall(serverCallId).ResumeRecordingAsync(recordingId);
                    Logger.LogInformation($"ResumeRecordingAsync response -- > {resumeRecording}");

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
                        recordingId = recordingData[serverCallId].recordingId;
                    }
                    else
                    {
                        if (!recordingData.ContainsKey(serverCallId))
                        {
                            recordingData[serverCallId] = new RecInfo(recordingId, string.Empty);
                        }
                    }

                    var stopRecording = await callingServerClient.InitializeServerCall(serverCallId).StopRecordingAsync(recordingId).ConfigureAwait(false);
                    Logger.LogInformation($"StopRecordingAsync response -- > {stopRecording}");

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
        /// Method to get recording Link
        /// </summary>
        /// <param name="serverCallId">Conversation id of the call</param>
        /// <param name="recordingId">Recording id of the call</param>
        /// <returns></returns>
        [HttpGet]
        [Route("getRecordingLink")]
        public IActionResult GetRecordingLink(string serverCallId)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(serverCallId) && recordingData.ContainsKey(serverCallId))
                {
                    string downloadRecordingURL = recordingData[serverCallId].recordingUri;

                    if(!string.IsNullOrWhiteSpace(downloadRecordingURL))
                    {
                        Logger.LogInformation($"Recording download link -- > {downloadRecordingURL}");

                        var response = new
                        {
                            uri = downloadRecordingURL,
                        };

                        return Ok(response);
                    }
                    else
                    {
                        return NotFound(new { Message = "Recording SAS link is unavailable for download at this moment. Please try again later." });
                    }
                }
                else
                {
                    return BadRequest(new { Message = "Invalid server call id." });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        /// <summary>
        /// Method to get recording state
        /// </summary>
        /// <param name="serverCallId">Conversation id of the call</param>
        /// <param name="recordingId">Recording id of the call</param>
        /// <returns>
        /// CallRecordingProperties
        ///     RecordingState is {active}, in case of active recording
        ///     RecordingState is {inactive}, in case if recording is paused
        /// GetRecordingStateAsync returns 404:Recording not found, in if recording was stopped or recording id is invalid.
        /// </returns>
        [HttpGet]
        [Route("getRecordingState")]
        public async Task<IActionResult> GetRecordingState(string serverCallId, string recordingId)
        {
            try
            {
                if (!string.IsNullOrEmpty(serverCallId))
                {
                    if (string.IsNullOrEmpty(recordingId))
                    {
                        recordingId = recordingData[serverCallId].recordingId;
                    }
                    else
                    {
                        if (!recordingData.ContainsKey(serverCallId))
                        {
                            recordingData[serverCallId] = new RecInfo(recordingId, string.Empty);
                        }
                    }

                    var recordingState = await callingServerClient.InitializeServerCall(serverCallId).GetRecordingStateAsync(recordingId).ConfigureAwait(false);

                    Logger.LogInformation($"GetRecordingStateAsync response -- > {recordingState}");

                    return Json(recordingState.Value.RecordingState);
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
                var httpContent = new BinaryData(request.ToString()).ToStream();
                EventGridEvent cloudEvent = EventGridEvent.ParseMany(BinaryData.FromStream(httpContent)).FirstOrDefault();

                if (cloudEvent.EventType == SystemEventNames.EventGridSubscriptionValidation)
                {
                    var eventData = cloudEvent.Data.ToObjectFromJson<SubscriptionValidationEventData>();

                    Logger.LogInformation("Microsoft.EventGrid.SubscriptionValidationEvent response  -- >" + cloudEvent.Data);

                    var responseData = new SubscriptionValidationResponse
                    {
                        ValidationResponse = eventData.ValidationCode
                    };

                    if (responseData.ValidationResponse != null)
                    {
                        return Ok(responseData);
                    }
                }

                if (cloudEvent.EventType == SystemEventNames.AcsRecordingFileStatusUpdated)
                {
                    Logger.LogInformation($"Event type is -- > {cloudEvent.EventType}");
                    Logger.LogInformation("Microsoft.Communication.RecordingFileStatusUpdated response  -- >" + cloudEvent.Data);
                    Logger.LogInformation("Microsoft.Communication.RecordingFileStatusUpdated subject  -- >" + cloudEvent.Subject);

                    string recordingId = string.Empty;

                    if(!string.IsNullOrWhiteSpace(cloudEvent.Subject))
                    {
                        var recIdMatch = Regex.Match(cloudEvent.Subject, @"(recordingId/[^/]*)");

                        if (recIdMatch.Success && recIdMatch.Groups.Count > 1)
                        {
                            recordingId = recIdMatch.Groups[1].Value.Split('/')[1]; //Accessing 1st index won't fail because of regex match
                            Logger.LogInformation("Extracted recording Id -- >" + recordingId);
                        }
                    }

                    var eventData = cloudEvent.Data.ToObjectFromJson<AcsRecordingFileStatusUpdatedEventData>();

                    Logger.LogInformation("Start processing metadata -- >");

                    await ProcessFile(eventData.RecordingStorageInfo.RecordingChunks[0].MetadataLocation,
                        eventData.RecordingStorageInfo.RecordingChunks[0].DocumentId,
                        FileFormat.Json,
                        FileDownloadType.Metadata);

                    Logger.LogInformation("Start processing recorded media -- >");

                    await ProcessFile(eventData.RecordingStorageInfo.RecordingChunks[0].ContentLocation,
                        eventData.RecordingStorageInfo.RecordingChunks[0].DocumentId,
                        string.IsNullOrWhiteSpace(recFileFormat) ? FileFormat.Mp4 : recFileFormat,
                        FileDownloadType.Recording,
                        recordingId);
                }
            }
            catch (Exception ex)
            {
                Logger.LogInformation($"Exception Message -- > {ex.Message}");
                Logger.LogInformation($"Exception Stack Trace -- > {ex.StackTrace}");
            }

            return Ok();
        }

        private async Task<bool> ProcessFile(string downloadLocation, string documentId, string fileFormat, string downloadType, string recordingId = null)
        {
            var recordingDownloadUri = new Uri(downloadLocation);
            var response = await callingServerClient.DownloadStreamingAsync(recordingDownloadUri);

            Logger.LogInformation($"Download {downloadType} response  -- >" + response.GetRawResponse());
            Logger.LogInformation($"Save downloaded {downloadType} -- >");

            string filePath = string.Format("{0}.{1}", documentId, fileFormat);
            using (Stream streamToReadFrom = response.Value)
            {
                using (Stream streamToWriteTo = System.IO.File.Open(filePath, FileMode.Create))
                {
                    await streamToReadFrom.CopyToAsync(streamToWriteTo);
                    await streamToWriteTo.FlushAsync();
                }
            }

            if (string.Equals(downloadType, FileDownloadType.Metadata, StringComparison.InvariantCultureIgnoreCase) && System.IO.File.Exists(filePath))
            {
                Root deserializedFilePath = JsonConvert.DeserializeObject<Root>(System.IO.File.ReadAllText(filePath));
                recFileFormat = deserializedFilePath.recordingInfo.format;

                Logger.LogInformation($"Recording File Format is -- > {recFileFormat}");
            }

            Logger.LogInformation($"Starting to upload {downloadType} to BlobStorage into container -- > {recordingContainerName}");

            var blobStorageHelperInfo = await BlobStorageHelper.UploadFileAsync(recordingBlobStorageConnectionString, recordingContainerName, filePath, filePath);
            if (blobStorageHelperInfo.Status)
            {
                if (!string.IsNullOrEmpty(recordingId))
                {
                    foreach (KeyValuePair<string, RecInfo> data in recordingData)
                    {
                        if (string.Equals(data.Value.recordingId, recordingId))
                        {
                            Logger.LogInformation("Download uri for recording file -- > {0}", blobStorageHelperInfo.Uri);
                            recordingData[data.Key] = new RecInfo(recordingId, blobStorageHelperInfo.Uri);
                            break;
                        }
                    }
                }

                Logger.LogInformation(blobStorageHelperInfo.Message);
                Logger.LogInformation($"Deleting temporary {downloadType} file being created");

                System.IO.File.Delete(filePath);
            }
            else
            {
                Logger.LogError($"{downloadType} file was not uploaded,{blobStorageHelperInfo.Message}");
            }

            return true;
        }
    }
}