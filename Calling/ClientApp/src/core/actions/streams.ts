import { RemoteParticipant, RemoteVideoStream } from '@azure/communication-calling';

const ADD_SCREENSHARE_STREAM = 'ADD_SCREENSHARE_STREAM';
const REMOVE_SCREENSHARE_STREAM = 'REMOVE_SCREENSHARE_STREAM';

interface AddScreenShareStreamAction {
  type: typeof ADD_SCREENSHARE_STREAM;
  stream: RemoteVideoStream;
  user: RemoteParticipant;
}

interface RemoveScreenShareStreamAction {
  type: typeof REMOVE_SCREENSHARE_STREAM;
  stream: RemoteVideoStream;
  user: RemoteParticipant;
}

export const addScreenShareStream = (
  stream: RemoteVideoStream,
  user: RemoteParticipant
): AddScreenShareStreamAction => {
  return {
    type: ADD_SCREENSHARE_STREAM,
    stream,
    user
  };
};

export const removeScreenShareStream = (
  stream: RemoteVideoStream,
  user: RemoteParticipant
): RemoveScreenShareStreamAction => {
  return {
    type: REMOVE_SCREENSHARE_STREAM,
    stream,
    user
  };
};

export { ADD_SCREENSHARE_STREAM, REMOVE_SCREENSHARE_STREAM };

export type StreamTypes = AddScreenShareStreamAction | RemoveScreenShareStreamAction;
