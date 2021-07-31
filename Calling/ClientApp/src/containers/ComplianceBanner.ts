import { connect } from 'react-redux';
import { ComplianceBanner, ComplianceBannerProps } from '../components/ComplianceBanner';
import { recordingLink } from '../core/actions/calls';
import { State } from '../core/reducers';
import { getRecordLink } from '../core/sideEffects';

const mapStateToProps = (state: State) => ({
  conversationId: state.calls.serverCallId,
  recordingLink: state.calls.recordingLink
});

const mapDispatchToProps = (dispatch: any, props: ComplianceBannerProps) => ({
    getRecordingLink: (): Promise<string> => dispatch(getRecordLink()),
    setRecordingLink: () => dispatch(recordingLink(''))
});

const connector: any = connect(mapStateToProps, mapDispatchToProps);
export default connector(ComplianceBanner);
