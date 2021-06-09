import { CallEndReason, Call, RemoteParticipant, CallAgent } from '@azure/communication-calling';
import { SelectionState } from '../RemoteStreamSelector';

const SET_CALL_AGENT = 'SET_CALL_AGENT';
const SET_GROUP = 'SET_GROUP';
const CALL_ADDED = 'CALL_ADDED';
const CALL_REMOVED = 'CALL_REMOVED';
const SET_CALL_STATE = 'SET_CALL_STATE';
const SET_PARTICIPANTS = 'SET_PARTICIPANTS';
const SET_DOMINANT_PARTICIPANTS = 'SET_DOMINANT_PARTICIPANTS';
const START_RECORDING = 'START_RECORDING';
//Use this code if you have to implement pause/resume recording
/*const PAUSE_RECORDING = 'PAUSE_RECORDING';
  const RESUME_RECORDING = 'RESUME_RECORDING';*/
const STOP_RECORDING = 'STOP_RECORDING';
const SET_SERVER_CALL_ID = 'SET_SERVER_CALL_ID';
const RESET_RECORDING_STATUS = 'RESET_RECORDING_STATUS';
const BANNER_VISIBLE = 'BANNER_VISIBLE';
const DIALOGBOX_VISIBLE = 'DIALOGBOX_VISIBLE';
const RECORDING_ERROR = 'RECORDING_ERROR';

interface SetCallAgentAction {
    type: typeof SET_CALL_AGENT;
    callAgent: CallAgent;
}

interface SetGroupAction {
    type: typeof SET_GROUP;
    group: string;
}

interface CallAddedAction {
    type: typeof CALL_ADDED;
    call: Call;
}

interface CallRemovedAction {
    type: typeof CALL_REMOVED;
    call: Call | undefined;
    incomingCallEndReason: CallEndReason | undefined;
    groupCallEndReason: CallEndReason | undefined;
}

interface SetCallStateAction {
    type: typeof SET_CALL_STATE;
    callState: string;
}

interface SetParticipantsAction {
    type: typeof SET_PARTICIPANTS;
    remoteParticipants: RemoteParticipant[];
}

interface SetDominantParticipantsAction {
    type: typeof SET_DOMINANT_PARTICIPANTS;
    dominantParticipants: SelectionState[];
}

interface StartRecordingAction {
    type: typeof START_RECORDING;
    recordingId: string;
    status: string;
}

//Use this code if you have to implement pause/resume recording
/*interface PauseRecordingAction {
    type: typeof PAUSE_RECORDING;
    status: string;
}

interface ResumeRecordingAction {
    type: typeof RESUME_RECORDING;
    status: string;
}*/

interface StopRecordingAction {
    type: typeof STOP_RECORDING;
    status: string;
}

interface SetServerCallIdAction {
    type: typeof SET_SERVER_CALL_ID,
    serverCallId: string
}

interface ResetRecordingStatusAction {
    type: typeof RESET_RECORDING_STATUS,
}

interface BannerVisibleAction {
    type: typeof BANNER_VISIBLE,
    bannerVisible: boolean
}

interface DialogBoxVisibleAction {
    type: typeof DIALOGBOX_VISIBLE,
    dialogBoxVisible: boolean
}

interface RecordingErrorAction {
    type: typeof RECORDING_ERROR,
    recordingError: string
}

export const setCallAgent = (callAgent: CallAgent): SetCallAgentAction => {
    return {
        type: SET_CALL_AGENT,
        callAgent
    };
};

export const setGroup = (groupId: string): SetGroupAction => {
    return {
        type: SET_GROUP,
        group: groupId
    };
};

export const callAdded = (addedCall: Call): CallAddedAction => {
    return {
        type: CALL_ADDED,
        call: addedCall
    };
};

export const callRemoved = (removedCall: Call, group: string): CallRemovedAction => {
    return {
        type: CALL_REMOVED,
        call: undefined,
        incomingCallEndReason: removedCall.direction === 'Incoming' ? removedCall.callEndReason : undefined,
        groupCallEndReason: removedCall.direction !== 'Incoming' && !!group ? removedCall.callEndReason : undefined
    };
};

export const setCallState = (callState: string): SetCallStateAction => {
    return {
        type: SET_CALL_STATE,
        callState
    };
};

export const setParticipants = (participants: RemoteParticipant[]): SetParticipantsAction => {
    return {
        type: SET_PARTICIPANTS,
        remoteParticipants: participants
    };
};

export const setDominantParticipants = (selected: SelectionState[]): SetDominantParticipantsAction => {
    return {
        type: SET_DOMINANT_PARTICIPANTS,
        dominantParticipants: selected
    };
};

export const startRecording = (recordingId: string, status: string): StartRecordingAction => {
    return {
        type: 'START_RECORDING',
        recordingId,
        status
    };
};

//Use this code if you have to implement pause/resume recording
/*export const pauseRecording = (status: string): PauseRecordingAction => {
    return {
        type: 'PAUSE_RECORDING',
        status
    };
};

export const resumeRecording = (status: string): ResumeRecordingAction => {
    return {
        type: 'RESUME_RECORDING',
        status
    };
};*/

export const stopRecording = (status: string): StopRecordingAction => {
    return {
        type: 'STOP_RECORDING',
        status
    };
};

export const setServerCallId = (serverCallId: string): SetServerCallIdAction => {
    return {
        type: 'SET_SERVER_CALL_ID',
        serverCallId
    };
};

export const resetRecordingStatus = (): ResetRecordingStatusAction => {
    return {
        type: 'RESET_RECORDING_STATUS',
    };
};

export const bannerVisible = (bannerVisible: boolean): BannerVisibleAction => {
    return {
        type: 'BANNER_VISIBLE',
        bannerVisible
    };
};

export const dialogBoxVisible = (dialogBoxVisible: boolean): DialogBoxVisibleAction => {
    return {
        type: 'DIALOGBOX_VISIBLE',
        dialogBoxVisible
    };
};

export const recordingError = (recordingError: string): RecordingErrorAction => {
    return {
        type: 'RECORDING_ERROR',
        recordingError
    };
};

export {
    SET_CALL_AGENT,
    SET_GROUP,
    CALL_ADDED,
    CALL_REMOVED,
    SET_CALL_STATE,
    SET_DOMINANT_PARTICIPANTS,
    SET_PARTICIPANTS,
    START_RECORDING,
    //Use this code if you have to implement pause/resume recording
    /*PAUSE_RECORDING,
      RESUME_RECORDING,*/
    STOP_RECORDING,
    SET_SERVER_CALL_ID,
    RESET_RECORDING_STATUS,
    BANNER_VISIBLE,
    RECORDING_ERROR,
    DIALOGBOX_VISIBLE,
};

export type CallTypes =
    | SetCallAgentAction
    | SetParticipantsAction
    | SetDominantParticipantsAction
    | SetCallStateAction
    | SetGroupAction
    | CallAddedAction
    | CallRemovedAction
    | StartRecordingAction
    //Use this code if you have to implement pause/resume recording
    /*| PauseRecordingAction
      | ResumeRecordingAction*/
    | StopRecordingAction
    | SetServerCallIdAction
    | ResetRecordingStatusAction
    | BannerVisibleAction
    | RecordingErrorAction
    | DialogBoxVisibleAction;