import { Call, CallEndReason, RemoteParticipant, CallAgent } from '@azure/communication-calling';
import { SelectionState } from 'core/RemoteStreamSelector';
import { Reducer } from 'redux';
import {
    CALL_ADDED,
    CALL_REMOVED,
    SET_CALL_STATE,
    SET_GROUP,
    SET_DOMINANT_PARTICIPANTS,
    SET_PARTICIPANTS,
    CallTypes,
    SET_CALL_AGENT,
    START_RECORDING,
    //Use this code if you have to implement pause/resume recording
    /*PAUSE_RECORDING,
      RESUME_RECORDING,*/
    STOP_RECORDING,
    SET_SERVER_CALL_ID,
    RESET_RECORDING_STATUS,
    BANNER_VISIBLE,
    DIALOGBOX_VISIBLE,
    RECORDING_ERROR,
} from '../actions/calls';

export interface CallsState {
    callAgent?: CallAgent;
    group: string;
    call?: Call;
    callState: string;
    incomingCallEndReason: CallEndReason | undefined;
    groupCallEndReason: CallEndReason | undefined;
    remoteParticipants: RemoteParticipant[];
    attempts: number;
    dominantParticipants: SelectionState[];
    serverCallId: string;
    recordingId: string;
    recordingStatus: string;
    bannerVisible: boolean;
    recordingError: string;
    dialogBoxVisible: boolean;
}

const initialState: CallsState = {
    callAgent: undefined,
    call: undefined,
    callState: 'None',
    incomingCallEndReason: undefined,
    groupCallEndReason: undefined,
    remoteParticipants: [],
    dominantParticipants: [],
    group: '',
    attempts: 0,
    serverCallId: '',
    recordingId: '',
    recordingStatus: '',
    bannerVisible: false,
    dialogBoxVisible: false,
    recordingError: '',
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
                groupCallEndReason: action.groupCallEndReason,
                serverCallId: '',
                recordingId: '',
                recordingStatus: ''
            };
        case SET_CALL_STATE:
            return { ...state, callState: action.callState };
        case SET_DOMINANT_PARTICIPANTS:
            return { ...state, dominantParticipants: action.dominantParticipants };
        case SET_PARTICIPANTS:
            return { ...state, remoteParticipants: action.remoteParticipants };
        case SET_GROUP:
            return { ...state, group: action.group };
        case START_RECORDING:
            return { ...state, recordingId: action.recordingId, recordingStatus: action.status, bannerVisible: true };
        //Use this code if you have to implement pause/resume recording
        /*case PAUSE_RECORDING:
            return { ...state, recordingStatus: action.status };
        case RESUME_RECORDING:
            return { ...state, recordingStatus: action.status };*/
        case STOP_RECORDING:
            return { ...state, recordingStatus: action.status, recordingId: '', bannerVisible: true };
        case SET_SERVER_CALL_ID:
            return { ...state, serverCallId: action.serverCallId };
        case RESET_RECORDING_STATUS:
            return { ...state, recordingStatus: '', recordingId: '' };
        case BANNER_VISIBLE:
            return { ...state, bannerVisible: action.bannerVisible };
        case DIALOGBOX_VISIBLE:
            return { ...state, dialogBoxVisible: action.dialogBoxVisible };
        case RECORDING_ERROR:
            return { ...state, recordingError: action.recordingError, dialogBoxVisible: true, recordingId: '' };
        default:
            return state;
    }
};
