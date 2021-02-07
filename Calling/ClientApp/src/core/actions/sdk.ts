const SET_USERID = 'SET_USERID';
const SET_DISPLAY_NAME = 'SET_DISPLAY_NAME';
const RESET_SDK = 'RESET_SDK';

interface SetUserIdAction {
  type: typeof SET_USERID;
  userId: string;
}

interface SetDisplayNameAction {
  type: typeof SET_DISPLAY_NAME;
  displayName: string;
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

export { SET_USERID, SET_DISPLAY_NAME, RESET_SDK };

export type SdkTypes =
  | SetUserIdAction
  | SetDisplayNameAction
  | ResetSDKAction;
