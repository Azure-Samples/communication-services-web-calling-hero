import {
  AudioDeviceInfo,
  Call,
  CallClientOptions,
  CommunicationError,
  GroupCallLocator,
  JoinCallOptions,
  DeviceManager,
  DeviceAccess,
  RemoteParticipant,
  VideoDeviceInfo,
  CallAgent,
  CallClient,
  HangUpOptions
} from '@azure/communication-calling';
import {
  AzureCommunicationTokenCredential,
  CallingApplicationIdentifier,
  CommunicationUserIdentifier
} from '@azure/communication-common';
import { CommunicationUserToken } from '@azure/communication-identity';
import { Dispatch } from 'redux';
import { utils } from '../Utils/Utils';
import { callAdded, callRemoved, setCallState, setParticipants, setCallAgent, callRetried } from './actions/calls';
import { setMic, setShareScreen, resetControls } from './actions/controls';
import {
  setAudioDeviceInfo,
  setAudioDeviceList,
  setCameraPermission,
  setMicrophonePermission,
  setVideoDeviceInfo,
  setVideoDeviceList,
  setDeviceManager
} from './actions/devices';
import { setToken, setUserId } from './actions/sdk';
import { addScreenShareStream, resetStreams, removeScreenShareStream } from './actions/streams';
import { State } from './reducers';

export const setMicrophone = (mic: boolean) => {
  return async (dispatch: Dispatch, getState: () => State): Promise<void> => {
    const state = getState();

    if (state === undefined || state.calls.call === undefined) {
      console.error('state or state.controls.mic is null');
      return;
    }

    try {
      if (!state.controls.mic) {
        await state.calls.call.unmute();
      } else {
        await state.calls.call.mute();
      }

      dispatch(setMic(mic));
    } catch (e) {
      console.error(e);
    }
  };
};

export const setShareUnshareScreen = (shareScreen: boolean) => {
  return async (dispatch: Dispatch, getState: () => State): Promise<void> => {
    const state = getState();

    if (state === undefined || state.calls.call === undefined) {
      console.error('state or state.controls.shareScreen is null');
      return;
    }

    try {
      if (!state.controls.shareScreen) {
        await state.calls.call.startScreenSharing();
      } else {
        await state.calls.call.stopScreenSharing();
      }

      dispatch(setShareScreen(shareScreen));
    } catch (e) {
      console.error(e);
    }
  };
};

const subscribeToParticipant = (
  participant: RemoteParticipant,
  call: Call,
  dispatch: Dispatch
): void => {
  const userId = utils.getId(participant.identifier);
  participant.on('stateChanged', () => {
    console.log('participant stateChanged', userId, participant.state);
    dispatch(setParticipants([...call.remoteParticipants.values()]));
  });

  participant.on('isSpeakingChanged', () => {
    dispatch(setParticipants([...call.remoteParticipants.values()]));
  });

  participant.on('videoStreamsUpdated', (e): void => {
    e.added.forEach((addedStream) => {
      if (addedStream.mediaStreamType === 'ScreenSharing') {
        addedStream.on('isAvailableChanged', () => {
          if (addedStream.isAvailable) {
            dispatch(addScreenShareStream(addedStream, participant));
          } else {
            dispatch(removeScreenShareStream(addedStream, participant));
          }
        });
  
        if (addedStream.isAvailable) { dispatch(addScreenShareStream(addedStream, participant)); }
      }
    });
    dispatch(setParticipants([...call.remoteParticipants.values()]));
  });
};

const updateAudioDevices = async (deviceManager: DeviceManager, dispatch: Dispatch, getState: () => State): Promise<void> => {
  const microphoneList: AudioDeviceInfo[] = await deviceManager.getMicrophones();
  dispatch(setAudioDeviceList(microphoneList));

  const state = getState();
  if (state.devices.audioDeviceInfo === undefined && microphoneList.length > 0) {
    dispatch(setAudioDeviceInfo(microphoneList[0]));
    deviceManager.selectMicrophone(microphoneList[0]);
  } else if (
    state.devices.audioDeviceInfo &&
    !utils.isSelectedAudioDeviceInList(state.devices.audioDeviceInfo, microphoneList)
  ) {
    deviceManager.selectMicrophone(state.devices.audioDeviceInfo);
  }
};

const updateVideoDevices = async (deviceManager: DeviceManager, dispatch: Dispatch, getState: () => State): Promise<void> => {
  const cameraList: VideoDeviceInfo[] = await deviceManager.getCameras();
  dispatch(setVideoDeviceList(cameraList));

  const state = getState();
  if (state.devices.videoDeviceInfo === undefined) {
    dispatch(setVideoDeviceInfo(cameraList[0]));
  } else if (
    state.devices.videoDeviceInfo &&
    !utils.isSelectedVideoDeviceInList(state.devices.videoDeviceInfo, cameraList)
  ) {
    dispatch(setVideoDeviceInfo(state.devices.videoDeviceInfo));
  }
};

const subscribeToDeviceManager = async (deviceManager: DeviceManager, dispatch: Dispatch, getState: () => State): Promise<void> => {
  // listen for any new events
  deviceManager.on('videoDevicesUpdated', async () => {
    updateVideoDevices(deviceManager, dispatch, getState);
  });

  deviceManager.on('audioDevicesUpdated', async () => {
    updateAudioDevices(deviceManager, dispatch, getState);
  });

  deviceManager.askDevicePermission({ audio: true,  video: true}).then((e: DeviceAccess) => {
    if (e.audio !== undefined) {
      if (e.audio) {
        dispatch(setMicrophonePermission('Granted'));

        updateAudioDevices(deviceManager, dispatch, getState);
      } else {
        dispatch(setMicrophonePermission('Denied'));
      }
    }

    if (e.video !== undefined) {
      if (e.video) {
        dispatch(setCameraPermission('Granted'));
        updateVideoDevices(deviceManager, dispatch, getState);
      } else {
        dispatch(setCameraPermission('Denied'));
      }
    }
  });
};

export const updateDevices = () => {
  return async (dispatch: Dispatch, getState: () => State): Promise<void> => {
    const state = getState();
    const deviceManager = state.devices.deviceManager;

    if (deviceManager == null) {
      console.error('no device manager available');
      return;
    }

    const cameraList: VideoDeviceInfo[] = await deviceManager.getCameras();

    dispatch(setVideoDeviceList(cameraList));

    const microphoneList: AudioDeviceInfo[] = await deviceManager.getMicrophones();

    dispatch(setAudioDeviceList(microphoneList));
  };
};

export const initCallClient = (name: string, unsupportedStateHandler: () => void) => {
  return async (dispatch: Dispatch, getState: () => State): Promise<void> => {
    const state: State = getState();
    try {
      let token = state.sdk.token;

      const options: CallClientOptions = {};

      // in the case we haven't gotten a token yet
      // we can infer if we don't have a token we dont have a userid
      // please note this sample doesn't include refresh token capabilities
      if (token === '') {
        const tokenResponse: CommunicationUserToken = await utils.getTokenForUser();
        const userToken = tokenResponse.token;
        dispatch(setUserId(tokenResponse.user.communicationUserId));
        dispatch(setToken(userToken));
        token = userToken;
      }

      let callClient;

      // check if chrome on ios OR firefox browser
      if (utils.isOnIphoneAndNotSafari() || utils.isUnsupportedBrowser()) {
        unsupportedStateHandler();
        return;
      }

      try {
        callClient = new CallClient(options);
      } catch (e) {
        unsupportedStateHandler();
        return;
      }

      if (!callClient) {
        return;
      }

      const tokenCredential = new AzureCommunicationTokenCredential(token);
      const callAgent: CallAgent = await callClient.createCallAgent(tokenCredential, { displayName: name });

      if (callAgent === undefined) {
        return;
      }

      const deviceManager: DeviceManager = await callClient.getDeviceManager();

      dispatch(setDeviceManager(deviceManager));
      dispatch(setCallAgent(callAgent));

      subscribeToDeviceManager(deviceManager, dispatch, getState);

      callAgent.on('callsUpdated', (e: { added: Call[]; removed: Call[] }): void => {
        e.added.forEach((addedCall) => {
          const state = getState();
          if (state.calls.call && addedCall.direction === 'Incoming') {
            addedCall.hangUp();
            return;
          }

          dispatch(callAdded(addedCall));

          addedCall.on('stateChanged', (): void => {
            dispatch(setCallState(addedCall.state));
          });

          dispatch(setCallState(addedCall.state));

          addedCall.on('isScreenSharingOnChanged', (): void => {
            dispatch(setShareScreen(addedCall.isScreenSharingOn));
          });

          dispatch(setShareScreen(addedCall.isScreenSharingOn))
          
          // if remote participants have changed, subscribe to the added remote participants
          addedCall.on('remoteParticipantsUpdated', (ev): void => {
            // for each of the added remote participants, subscribe to events and then just update as well in case the update has already happened
              ev.added.forEach((addedRemoteParticipant) => {
              subscribeToParticipant(addedRemoteParticipant, addedCall, dispatch);
              dispatch(setParticipants([...state.calls.remoteParticipants, addedRemoteParticipant]))
            });

          

            ev.removed.forEach((removedRemoteParticipant) => {
              dispatch(setParticipants([...state.calls.remoteParticipants.filter(remoteParticipant => { return remoteParticipant !== removedRemoteParticipant }) ]))
            });
          });

          dispatch(setParticipants([...state.calls.remoteParticipants]));
        });
        e.removed.forEach((removedCall) => {
          const state = getState();

          dispatch(callRetried(state.calls.attempts + 1));

          if (state.calls.call && state.calls.call === removedCall) {
            dispatch(callRemoved(removedCall, state.calls.group));
            dispatch(resetControls());
            dispatch(resetStreams());
          }
        });
      });
    } catch (e) {
      console.error(e);
    }
  };
};

// what does the forEveryone parameter really mean?
export const endCall = async (call: Call, options: HangUpOptions): Promise<void> => {
  await call.hangUp(options).catch((e: CommunicationError) => console.error(e));
};

export const joinGroup = async (callAgent: CallAgent, context: GroupCallLocator, callOptions: JoinCallOptions): Promise<void> => {
  try {
    await callAgent.join(context, callOptions);
  } catch (e) {
    console.log('Failed to join a call', e);
    return;
  }
};

export const addParticipant = async (call: Call, user: CommunicationUserIdentifier | CallingApplicationIdentifier): Promise<void> => {
  await call.addParticipant(user);
};

export const removeParticipant = async (
  call: Call,
  user: CommunicationUserIdentifier | CallingApplicationIdentifier
): Promise<void> => {
  await call.removeParticipant(user).catch((e: CommunicationError) => console.error(e));
};
