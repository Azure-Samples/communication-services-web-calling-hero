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
  HangUpOptions,
  CallEndReason
} from '@azure/communication-calling';
import {
  AzureCommunicationTokenCredential,
  CallingApplicationKind,
  CommunicationUserKind
} from '@azure/communication-common';
import { CommunicationUserToken } from '@azure/communication-identity';
import { Dispatch } from 'redux';
import { utils } from '../Utils/Utils';
import { callAdded, callRemoved, setCallState, setParticipants, setCallAgent } from './actions/calls';
import { setMic, setShareScreen } from './actions/controls';
import {
  setAudioDeviceInfo,
  setAudioDeviceList,
  setCameraPermission,
  setMicrophonePermission,
  setVideoDeviceInfo,
  setVideoDeviceList,
  setDeviceManager
} from './actions/devices';
import { setUserId } from './actions/sdk';
import { addScreenShareStream, removeScreenShareStream } from './actions/streams';
import { State } from './reducers';
import { createClientLogger, setLogLevel } from '@azure/logger';

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
  participant.on('stateChanged', () => {
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

const createCallOptions = (): CallClientOptions => {
  const logger = createClientLogger('Azure Communication Services - Calling Hero Sample');

  setLogLevel('verbose');
  logger.verbose.log = (...args) => { console.log(...args); };
  logger.info.log = (...args) => { console.info(...args) ; };
  logger.warning.log = (...args) => { console.warn(...args); };
  logger.error.log = (...args) => { console.error(...args); };

  return {
    logger: logger
  }
}

export const initCallAgent = (name: string, callEndedHandler: (reason: CallEndReason) => void) => {
  return async (dispatch: Dispatch, getState: () => State): Promise<void> => {
    const options: CallClientOptions = createCallOptions();
    let callClient = new CallClient(options);

    const tokenResponse: CommunicationUserToken = await utils.getTokenForUser();
    const userToken = tokenResponse.token;
    // necessary as the C# and JS types are different
    const user = tokenResponse.user as any;
    const userId = user.id;
    dispatch(setUserId(userId));
    
    const tokenCredential = new AzureCommunicationTokenCredential({
      tokenRefresher: ():Promise<string> => {
        return utils.getRefreshedTokenForUser(userId)
      },
      refreshProactively: true,
      token: userToken
    });
    const callAgent: CallAgent = await callClient.createCallAgent(tokenCredential, { displayName: name });

    if (callAgent === undefined) {
      return;
    }

    dispatch(setCallAgent(callAgent));

    const deviceManager: DeviceManager = await callClient.getDeviceManager();

    dispatch(setDeviceManager(deviceManager));
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
        if (state.calls.call && state.calls.call === removedCall) {
          dispatch(callRemoved(removedCall, state.calls.group));
          if (removedCall.callEndReason && removedCall.callEndReason.code !== 0) {
            removedCall.callEndReason && callEndedHandler(removedCall.callEndReason);
          }
        }
      });
    });
  }
}

export const initCallClient = (unsupportedStateHandler: () => void) => {
  return async (dispatch: Dispatch, getState: () => State): Promise<void> => {

      const options: CallClientOptions = createCallOptions();
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

      const deviceManager: DeviceManager = await callClient.getDeviceManager();

      dispatch(setDeviceManager(deviceManager));
      subscribeToDeviceManager(deviceManager, dispatch, getState);
  };
}

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

export const addParticipant = async (call: Call, user: CommunicationUserKind | CallingApplicationKind): Promise<void> => {
  await call.addParticipant(user);
};

export const removeParticipant = async (
  call: Call,
  user: CommunicationUserKind | CallingApplicationKind
): Promise<void> => {
  await call.removeParticipant(user).catch((e: CommunicationError) => console.error(e));
};
