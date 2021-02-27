import { connect } from 'react-redux';
import ConfigurationScreen, { ConfigurationScreenProps } from '../components/Configuration';
import { resetCalls, setGroup } from '../core/actions/calls';
import { setDisplayName } from '../core/actions/sdk';
import { setVideoDeviceInfo, setAudioDeviceInfo } from '../core/actions/devices';
import { initCallClient, updateDevices } from '../core/sideEffects';
import { setMic } from '../core/actions/controls';
import { State } from '../core/reducers';
import { AudioDeviceInfo, VideoDeviceInfo, LocalVideoStream, CallAgent } from '@azure/communication-calling';
import { setLocalVideoStream } from '../core/actions/streams';

const mapStateToProps = (state: State, props: ConfigurationScreenProps) => ({
  deviceManager: state.devices.deviceManager,
  callAgent: state.calls.callAgent,
  group: state.calls.group,
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

const mapDispatchToProps = (dispatch: any) => ({
  setLocalVideoStream: (localVideoStream: LocalVideoStream) => dispatch(setLocalVideoStream(localVideoStream)),
  setMic: (mic: boolean) => dispatch(setMic(mic)),
  setAudioDeviceInfo: (deviceInfo: AudioDeviceInfo) => dispatch(setAudioDeviceInfo(deviceInfo)),
  setVideoDeviceInfo: (deviceInfo: VideoDeviceInfo) => dispatch(setVideoDeviceInfo(deviceInfo)),
  initCallClient: (displayName: string, unsupportedStateHandler: () => void) =>
    dispatch(initCallClient(displayName, unsupportedStateHandler)),
  setDisplayName: (displayName: string) => dispatch(setDisplayName(displayName)),
  setGroup: (groupId: string) => dispatch(setGroup(groupId)),
  updateDevices: () => dispatch(updateDevices()),
  resetCallAgent: async (callAgent: CallAgent) => {
    (callAgent as any)['_eventEmitter'].removeAllListeners();
    await callAgent.dispose();
    dispatch(resetCalls());
  }
});

const connector: any = connect(mapStateToProps, mapDispatchToProps);
export default connector(ConfigurationScreen);
