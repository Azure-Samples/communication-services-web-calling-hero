import { connect } from 'react-redux';
import { State } from '../core/reducers';
import ParticipantStack from '../components/ParticipantStack';

const mapStateToProps = (state: State) => ({
  userId: state.sdk.userId,
  displayName: state.calls.callAgent?.displayName,
  call: state.calls.call,
  callState: state.calls.callState,
  remoteParticipants: state.calls.remoteParticipants,
  screenShareStreams: state.streams.screenShareStreams
});

const connector: any = connect(mapStateToProps);
export default connector(ParticipantStack);
