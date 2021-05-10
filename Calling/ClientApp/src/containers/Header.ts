import { connect } from 'react-redux';
import Header, { HeaderProps } from '../components/Header';
import { setMicrophone, setShareUnshareScreen, endCall } from '../core/sideEffects';
import { utils } from '../Utils/Utils';
import { Constants } from '../core/constants';
import { State } from '../core/reducers';

const mapStateToProps = (state: State, props: HeaderProps) => ({
  actionable:
    state.calls.callState === Constants.INCOMING ||
    state.calls.callState === Constants.RINGING ||
    state.calls.callState === Constants.CONNECTING ||
    state.calls.callState === Constants.CONNECTED,
  mic: state.controls.mic,
  call: state.calls.call,
  shareScreen: state.controls.shareScreen,
  endCall: (): void => {
    state.calls.call && endCall(state.calls.call, { forEveryone: false });
    props.endCallHandler();
  },
  videoDeviceInfo: state.devices.videoDeviceInfo,
  screenWidth: props.screenWidth,
  screenShareStreams: state.streams.screenShareStreams,
  localVideoRendererIsBusy: state.streams.localVideoRendererIsBusy,
  cameraPermission: state.devices.cameraPermission,
  microphonePermission: state.devices.microphonePermission
});

const mapDispatchToProps = (dispatch: any) => ({
  setMic: (mic: boolean): void => dispatch(setMicrophone(mic)),
  setScreenShare: (screenShare: boolean): void => dispatch(setShareUnshareScreen(screenShare)),
  // Only support Desktop -- Chrome | Edge (Chromium) | Safari
  isLocalScreenShareSupportedInBrowser: (): boolean => {
    return (
      !utils.isMobileSession() &&
      (/chrome/i.test(navigator.userAgent.toLowerCase()) || /safari/i.test(navigator.userAgent.toLowerCase()))
    );
  }
});

const connector: any = connect(mapStateToProps, mapDispatchToProps);
export default connector(Header);
