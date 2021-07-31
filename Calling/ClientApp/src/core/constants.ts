export class Constants {
  static INCOMING = 'Incoming';
  static RINGING = 'Ringing';
  static CONNECTING = 'Connecting';
  static CONNECTED = 'Connected';
  static LOBBY = 'InLobby';
  static DEFAULT_IMG_WIDTH = 200;
  static CROP_MEDIA = 'Crop';
  static CONFIGURATION_LOCAL_VIDEO_PREVIEW_ID = 'ConfigurationLocalVideoPreview';
  static LOCAL_VIDEO_PREVIEW_ID = 'LocalVideoPreview';
  static MINI_HEADER_WINDOW_WIDTH = 680;
  // For safari browsers we want to set the default to 1 remote participant that can show their video based on quality constraints
  static DOMINANT_PARTICIPANTS_COUNT_SAFARI = 1;
  // For non-safari browsers we want to set the default to 4 remote participant that can show their video based on quality constraints
  static DOMINANT_PARTICIPANTS_COUNT = 4;
  static CALL_RECORDING_DOWNLOAD_ERROR =
    'Recording is not available for download at this moment. Please try again later.';
}
