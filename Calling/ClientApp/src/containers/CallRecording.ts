import { connect } from 'react-redux';
import { CallRecording } from '../components/CallRecording';
import { State } from '../core/reducers';
import { startRecord, stopRecord } from '../core/sideEffects';

const mapStateToProps = (state: State) => ({
  conversationId: state.calls.serverCallId,
  recordingStatus: state.calls.recordingStatus
});

const mapDispatchToProps = (dispatch: any) => ({
  startRecording: (): void => dispatch(startRecord()),
  stopRecording: (): void => dispatch(stopRecord())
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(CallRecording);
