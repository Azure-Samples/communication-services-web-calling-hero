import { connect } from 'react-redux';
import GroupCall, { GroupCallProps } from '../components/GroupCall';
import { joinGroup, setMicrophone } from '../core/sideEffects';
import { setLocalVideoStream } from '../core/actions/streams';
import { setVideoDeviceInfo, setAudioDeviceInfo, resetDevices } from '../core/actions/devices';
import {
  AudioDeviceInfo,
  VideoDeviceInfo,
  LocalVideoStream,
  DeviceManager,
  CallAgent
} from '@azure/communication-calling';
import { State } from '../core/reducers';
import { callRetried, resetCalls } from 'core/actions/calls';
import { resetSdk } from 'core/actions/sdk';

const mapStateToProps = (state: State, props: GroupCallProps) => ({
  userId: state.sdk.userId,
  callAgent: state.calls.callAgent,
  deviceManager: state.devices.deviceManager,
  group: state.calls.group,
  screenWidth: props.screenWidth,
  call: state.calls.call,
  shareScreen: state.controls.shareScreen,
  mic: state.controls.mic,
  groupCallEndReason: state.calls.groupCallEndReason,
  isGroup: () => state.calls.call && state.calls.call.direction !== 'Incoming' && !!state.calls.group,
  joinGroup: () => {
    state.calls.callAgent &&
      joinGroup(
        state.calls.callAgent,
        {
          groupId: state.calls.group
        },
        {
          audioOptions: { muted: !state.controls.mic }
        }
      );
  },
  remoteParticipants: state.calls.remoteParticipants,
  streams: state.streams.streams,
  callState: state.calls.callState,
  localVideo: state.controls.localVideo,
  localVideoStream: state.streams.localVideoStream,
  screenShareStreams: state.streams.screenShareStreams,
  videoDeviceInfo: state.devices.videoDeviceInfo,
  audioDeviceInfo: state.devices.audioDeviceInfo,
  videoDeviceList: state.devices.videoDeviceList,
  audioDeviceList: state.devices.audioDeviceList,
  cameraPermission: state.devices.cameraPermission,
  microphonePermission: state.devices.microphonePermission,
  attempts: state.calls.attempts
});

const mapDispatchToProps = (dispatch: any) => ({
  mute: () => dispatch(setMicrophone(false)),
  setAudioDeviceInfo: (deviceInfo: AudioDeviceInfo) => {
    dispatch(setAudioDeviceInfo(deviceInfo));
  },
  setVideoDeviceInfo: (deviceInfo: VideoDeviceInfo) => {
    dispatch(setVideoDeviceInfo(deviceInfo));
  },
  setLocalVideoStream: (localVideoStream: LocalVideoStream) => dispatch(setLocalVideoStream(localVideoStream)),
  setAttempts: (attempts: number) => dispatch(callRetried(attempts)),
  reset: (deviceManager: DeviceManager, callAgent: CallAgent) => {
    (deviceManager as any)['_eventEmitter'].removeAllListeners();
    (callAgent as any)['_eventEmitter'].removeAllListeners();
    callAgent.dispose();

    dispatch(resetCalls());
    dispatch(resetDevices());
    dispatch(resetSdk());
  }
});

const connector: any = connect(mapStateToProps, mapDispatchToProps);
export default connector(GroupCall);
