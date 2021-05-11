import { Reducer } from 'redux';
import { ParticipantStream } from './index';
import { ADD_SCREENSHARE_STREAM, StreamTypes, REMOVE_SCREENSHARE_STREAM } from '../actions/streams';
import { DeviceTypes } from '../actions/devices';

export interface StreamsState {
  screenShareStreams: ParticipantStream[];
  localVideoRendererIsBusy: boolean;
}

const initialState: StreamsState = {
  localVideoRendererIsBusy: false,
  screenShareStreams: []
};

export const streamsReducer: Reducer<StreamsState, StreamTypes | DeviceTypes> = (
  state = initialState,
  action: StreamTypes | DeviceTypes
): StreamsState => {
  switch (action.type) {
    case ADD_SCREENSHARE_STREAM:
      const newScreenShareStream: ParticipantStream = { stream: action.stream, user: action.user };
      return { ...state, screenShareStreams: [...state.screenShareStreams, newScreenShareStream] };
    case REMOVE_SCREENSHARE_STREAM:
      const screenShareStreams = state.screenShareStreams.filter(
        (stream) => stream.stream !== action.stream && stream.user !== action.user
      );
      return { ...state, screenShareStreams };
    default:
      return state;
  }
};
