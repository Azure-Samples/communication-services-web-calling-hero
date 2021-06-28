import { connect } from 'react-redux';
import { CallRecording, CallRecordingProps } from '../components/CallRecording';
import { State } from '../core/reducers';
import { startRecord, stopRecord } from '../core/sideEffects';

const mapStateToProps = (state: State) => ({
  conversationId: state.calls.serverCallId,
  recordingStatus: state.calls.recordingStatus
});

const mapDispatchToProps = (dispatch: any, props: CallRecordingProps) => ({
  startRecording: () => dispatch(startRecord()),
  stopRecording: () => dispatch(stopRecord())
});

const connector: any = connect(mapStateToProps, mapDispatchToProps);
export default connector(CallRecording);
