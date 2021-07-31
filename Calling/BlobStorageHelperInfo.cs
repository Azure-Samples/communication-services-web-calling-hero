namespace Calling
{
    public class BlobStorageHelperInfo
    {
        public string Message { set; get; }
        public bool Status { set; get; }
        public string Uri { set; get; }
    }

    public struct RecordingInfo
    {
        public RecordingInfo(string id, string uri)
        {
            recordingId = id;
            recordingUri = uri;
        }
        public string recordingId { get; set; }
        public string recordingUri { get; set; }
    }
}
