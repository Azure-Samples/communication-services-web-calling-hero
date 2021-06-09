import { connect } from 'react-redux';
import CallRecording, { CallRecordingProps } from '../components/CallRecording';
import { State } from '../core/reducers';
//Use this code if you have to implement pause/resume recording
//import { startRecord, pauseRecord, resumeRecord, stopRecord } from '../core/sideEffects';
import { startRecord, stopRecord } from '../core/sideEffects';

const mapStateToProps = (state: State, props: CallRecordingProps) => ({
    recordingId: state.calls.recordingId,
    conversationId: state.calls.serverCallId,
    recordingStatus: state.calls.recordingStatus
});

const mapDispatchToProps = (dispatch: any) => ({
    startRecording: () => dispatch(startRecord()),
    //Use this code if you have to implement pause/resume recording
    /*pauseRecording: () => dispatch(pauseRecord()),
      resumeRecording: () => dispatch(resumeRecord()),*/
    stopRecording: () => dispatch(stopRecord()),
});

const connector: any = connect(mapStateToProps, mapDispatchToProps);
export default connector(CallRecording);