import { connect } from 'react-redux';
import ConfigurationScreen, { ConfigurationScreenProps } from '../components/Configuration';
import { setVideoDeviceInfo, setAudioDeviceInfo } from '../core/actions/devices';
import { initCallAgent, initCallClient, updateDevices } from '../core/sideEffects';
import { setMic } from '../core/actions/controls';
import { State } from '../core/reducers';
import { AudioDeviceInfo, VideoDeviceInfo, LocalVideoStream } from '@azure/communication-calling';
import { setLocalVideoStream } from '../core/actions/streams';

const mapStateToProps = (state: State, props: ConfigurationScreenProps) => ({
  deviceManager: state.devices.deviceManager,
  callAgent: state.calls.callAgent,
  mic: state.controls.mic,
  screenWidth: props.screenWidth,
  localVideoStream: state.streams.localVideoStream,
  audioDeviceInfo: state.devices.audioDeviceInfo,
  videoDeviceInfo: state.devices.videoDeviceInfo,
  videoDeviceList: state.devices.videoDeviceList,
  audioDeviceList: state.devices.audioDeviceList,
  cameraPermission: state.devices.cameraPermission,
  microphonePermission: state.devices.microphonePermission
});

const mapDispatchToProps = (dispatch: any, props: ConfigurationScreenProps) => ({
  setLocalVideoStream: (localVideoStream: LocalVideoStream) => dispatch(setLocalVideoStream(localVideoStream)),
  setMic: (mic: boolean) => dispatch(setMic(mic)),
  setAudioDeviceInfo: (deviceInfo: AudioDeviceInfo) => dispatch(setAudioDeviceInfo(deviceInfo)),
  setVideoDeviceInfo: (deviceInfo: VideoDeviceInfo) => dispatch(setVideoDeviceInfo(deviceInfo)),
  setupCallClient: (unsupportedStateHandler: () => void) =>
    dispatch(initCallClient( unsupportedStateHandler)),
  setupCallAgent: (displayName: string) =>
    dispatch(initCallAgent(displayName, props.callEndedHandler)),
  updateDevices: () => dispatch(updateDevices()),
});

const connector: any = connect(mapStateToProps, mapDispatchToProps);
export default connector(ConfigurationScreen);
