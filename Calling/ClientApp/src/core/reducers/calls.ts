import { Call, CallEndReason, RemoteParticipant, CallAgent } from '@azure/communication-calling';
import { SelectionState } from 'core/RemoteStreamSelector';
import { Reducer } from 'redux';
import {
  CALL_ADDED,
  CALL_REMOVED,
  SET_CALL_STATE,
  SET_DOMINANT_PARTICIPANTS,
  SET_PARTICIPANTS,
  CallTypes,
  SET_CALL_AGENT,
  SET_RECORDING_ACTIVE,
  SET_TRANSCRIBING_ACTIVE,
  START_RECORDING,
  STOP_RECORDING,
  SET_SERVER_CALL_ID,
  DIALOGBOX_VISIBLE,
  RECORDING_ERROR
} from '../actions/calls';

export interface CallsState {
  callAgent?: CallAgent;
  call?: Call;
  callState: string;
  incomingCallEndReason: CallEndReason | undefined;
  callEndReason: CallEndReason | undefined;
  remoteParticipants: RemoteParticipant[];
  attempts: number;
  isBeingRecorded: boolean | undefined;
  isBeingTranscribed: boolean | undefined;
  dominantParticipants: SelectionState[];
  serverCallId: string;
  recordingStatus: 'STARTED' | 'STOPPED';
  recordingError: string;
  dialogBoxVisible: boolean;
}

const initialState: CallsState = {
  callAgent: undefined,
  call: undefined,
  callState: 'None',
  incomingCallEndReason: undefined,
  callEndReason: undefined,
  remoteParticipants: [],
  attempts: 0,
  isBeingRecorded: undefined,
  isBeingTranscribed: undefined,
  dominantParticipants: [],
  serverCallId: '',
  recordingStatus: 'STOPPED',
  dialogBoxVisible: false,
  recordingError: ''
};

export const callsReducer: Reducer<CallsState, CallTypes> = (state = initialState, action: CallTypes): CallsState => {
  switch (action.type) {
    case SET_CALL_AGENT:
      return { ...state, callAgent: action.callAgent };
    case CALL_ADDED:
      return { ...state, call: action.call };
    case CALL_REMOVED:
      return {
        ...state,
        call: undefined,
        remoteParticipants: [],
        incomingCallEndReason: action.incomingCallEndReason,
        callEndReason: action.callEndReason,
        serverCallId: '',
        recordingStatus: 'STOPPED'
      };
    case SET_CALL_STATE:
      return { ...state, callState: action.callState };
    case SET_DOMINANT_PARTICIPANTS:
      return { ...state, dominantParticipants: action.dominantParticipants };
    case SET_PARTICIPANTS:
      return { ...state, remoteParticipants: action.remoteParticipants };
    case SET_RECORDING_ACTIVE:
      return { ...state, isBeingRecorded: action.active };
    case SET_TRANSCRIBING_ACTIVE:
      return { ...state, isBeingTranscribed: action.active };
    case START_RECORDING:
      return { ...state, recordingStatus: action.status };
    case STOP_RECORDING:
      return { ...state, recordingStatus: action.status };
    case SET_SERVER_CALL_ID:
      return { ...state, serverCallId: action.serverCallId };
    case DIALOGBOX_VISIBLE:
      return { ...state, dialogBoxVisible: action.dialogBoxVisible };
    case RECORDING_ERROR:
      return { ...state, recordingError: action.recordingError, dialogBoxVisible: true };
    default:
      return state;
  }
};
