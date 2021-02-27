const SET_USERID = 'SET_USERID';
const SET_DISPLAY_NAME = 'SET_DISPLAY_NAME';
const SET_TOKEN = 'SET_TOKEN';
const RESET_SDK = 'RESET_SDK';

interface SetUserIdAction {
  type: typeof SET_USERID;
  userId: string;
}

interface SetDisplayNameAction {
  type: typeof SET_DISPLAY_NAME;
  displayName: string;
}

interface SetTokenAction {
  type: typeof SET_TOKEN;
  token: string;
}

interface ResetSDKAction {
  type: typeof RESET_SDK;
}

export const setUserId = (userId: string): SetUserIdAction => {
  return {
    type: SET_USERID,
    userId
  };
};

export const setDisplayName = (displayName: string): SetDisplayNameAction => {
  return {
    type: SET_DISPLAY_NAME,
    displayName
  };
};

export const setToken = (token: string): SetTokenAction => {
  return {
    type: SET_TOKEN,
    token
  };
};

export const resetSdk = (): ResetSDKAction => {
  return {
    type: RESET_SDK
  };
};

export { SET_USERID, SET_DISPLAY_NAME, RESET_SDK, SET_TOKEN };

export type SdkTypes = SetUserIdAction | SetDisplayNameAction | ResetSDKAction | SetTokenAction;
