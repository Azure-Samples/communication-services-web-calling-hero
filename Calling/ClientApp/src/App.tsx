// © Microsoft Corporation. All rights reserved.
import React, { useState, useEffect } from 'react';
import GroupCall from './containers/GroupCall';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { reducer } from './core/reducers';
import thunk from 'redux-thunk';
import EndCall from './components/EndCall';
import HomeScreen from './components/HomeScreen';
import ConfigurationScreen from './containers/Configuration';
import { v1 as createGUID } from 'uuid';
import { loadTheme, initializeIcons } from '@fluentui/react';
import { utils } from './Utils/Utils';
import { CallEndReason } from '@azure/communication-calling';

const sdkVersion = require('../package.json').dependencies['@azure/communication-calling'];
const lastUpdated = `Last Updated ${utils.getBuildTime()} with @azure/communication-calling:${sdkVersion}`;

loadTheme({});
initializeIcons();

const store = createStore(reducer, applyMiddleware(thunk));
const App = (): JSX.Element => {
  const [page, setPage] = useState('home');
  const [callEndReason, setCallEndReason] = useState<CallEndReason | undefined>();
  const [groupId, setGroupId] = useState('');
  const [screenWidth, setScreenWidth] = useState(0);
  const [localVideoStream, setLocalVideoStream] = useState(undefined);

  useEffect(() => {
    const setWindowWidth = (): void => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 0;
      setScreenWidth(width);
    };
    setWindowWidth();
    window.addEventListener('resize', setWindowWidth);
    return (): void => window.removeEventListener('resize', setWindowWidth);
  }, []);

  const getGroupIdFromUrl = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('groupId');
  };

  const getGroupId = (): string => {
    if (groupId) return groupId;
    const uriGid = getGroupIdFromUrl();
    const gid = uriGid == null || uriGid === '' ? createGUID() : uriGid;
    setGroupId(gid);
    return gid;
  };

  const getContent = (): JSX.Element => {
    if (page === 'home') {
      return (
        <HomeScreen
          startCallHandler={(): void => {
            window.history.pushState({}, document.title, window.location.href + '?groupId=' + getGroupId());
          }}
        />
      );
    } else if (page === 'configuration') {
      return (
        <ConfigurationScreen
          startCallHandler={(): void => setPage('call')}
          unsupportedStateHandler={(): void => setPage('unsupported')}
          callEndedHandler={(errorMsg: CallEndReason): void => {
            setCallEndReason(errorMsg);
            setPage('error');
          }}
          groupId={getGroupId()}
          screenWidth={screenWidth}
          localVideoStream={localVideoStream}
          setLocalVideoStream={setLocalVideoStream}
        />
      );
    } else if (page === 'call') {
      return (
        <GroupCall
          endCallHandler={(): void => setPage('endCall')}
          groupId={getGroupId()}
          screenWidth={screenWidth}
          localVideoStream={localVideoStream}
          setLocalVideoStream={setLocalVideoStream}
        />
      );
    } else if (page === 'endCall') {
      return (
        <EndCall
          message={'You left the call'}
          rejoinHandler={(): void => {
            window.location.reload();
          }}
          homeHandler={(): void => {
            window.location.href = window.location.href.split('?')[0];
          }}
        />
      );
    } else if (page === 'unsupported') {
      window.document.title = 'Unsupported browser';
      return (
        <>
          <a href="https://docs.microsoft.com/en-us/azure/communication-services/concepts/voice-video-calling/calling-sdk-features#calling-client-library-browser-support">
            Learn more
          </a>
          &nbsp;about browsers and platforms supported by the web calling sdk
        </>
      );
    } else if (page === 'error') {
      window.document.title = 'Call Ended';
      return (
        <div>
          <div>{`The call has ended with this error code (Code: ${callEndReason?.code} Subcode: ${callEndReason?.subCode})`}</div>

          <div>
            <a href="https://docs.microsoft.com/en-us/azure/communication-services/concepts/troubleshooting-info?tabs=csharp%2Cjavascript%2Cdotnet">
              Learn more
            </a>
            &nbsp;about why this Azure Communication Services call has ended.
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  };

  if (getGroupIdFromUrl() && page === 'home') {
    setPage('configuration');
  }

  return <Provider store={store}>{getContent()}</Provider>;
};

window.setTimeout(() => {
  try {
    console.log(`Azure Communication Services sample group calling app: ${lastUpdated}`);
  } catch (e) {}
}, 0);

export default App;
