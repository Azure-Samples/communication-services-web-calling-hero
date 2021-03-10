import { Reducer } from 'redux';
import { SET_USERID, SdkTypes, SET_DISPLAY_NAME, SET_TOKEN } from '../actions/sdk';

export interface SdkState {
  userId?: string;
  displayName: string;
  token: string;
}

const initialState: SdkState = {
  displayName: '',
  token: ''
};

export const sdkReducer: Reducer<SdkState, SdkTypes> = (state = initialState, action: SdkTypes): SdkState => {
  switch (action.type) {
    case SET_USERID:
      return { ...state, userId: action.userId };
    case SET_DISPLAY_NAME:
      return { ...state, displayName: action.displayName };
    case SET_TOKEN:
      return { ...state, token: action.token };
    default:
      return state;
  }
};
