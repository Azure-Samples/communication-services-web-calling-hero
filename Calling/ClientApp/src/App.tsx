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
import { loadTheme, initializeIcons } from '@fluentui/react';
import { utils } from './Utils/Utils';
import { CallEndReason, GroupLocator, TeamsMeetingLinkLocator } from '@azure/communication-calling';

const sdkVersion = require('../package.json').dependencies['@azure/communication-calling'];
const lastUpdated = `Last Updated ${utils.getBuildTime()} with @azure/communication-calling:${sdkVersion}`;

loadTheme({});
initializeIcons();

const store = createStore(reducer, applyMiddleware(thunk));
const App = () => {
  const [page, setPage] = useState('home');
  const [callEndReason, setCallEndReason] = useState<CallEndReason | undefined>();
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const setWindowWidth = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 0;
      setScreenWidth(width);
    };
    setWindowWidth();
    window.addEventListener('resize', setWindowWidth);
    return () => window.removeEventListener('resize', setWindowWidth);
  }, []);

  const getGroupIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('groupId');
  };

  const getTeamsMeetingLinkFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('meeting');
  }

  const getMeetingLink = () => {
    const encodedTeamsMeetingLink = getTeamsMeetingLinkFromUrl()
    if (!encodedTeamsMeetingLink) {
      return '';
    }
    return decodeURIComponent(encodedTeamsMeetingLink);
  }

  const getLocator = (): GroupLocator | TeamsMeetingLinkLocator => {
    const meetingLink = getMeetingLink();
    
    if (meetingLink === '') {
      return { groupId: getGroupId() }
    } else {
      return { meetingLink: meetingLink }
    }
  }

  const getGroupId = () => {
    const groupId = getGroupIdFromUrl();
    return groupId ? groupId : ''
  };

  const getContent = () => {
    if (page === 'home') {
      return (
        <HomeScreen
          startCallHandler={(groupId: string) => {
            window.location.href = window.location.href + '?groupId=' + encodeURIComponent(groupId);
          }}
          joinTeamsMeeting={(meetingUrl: string) => {
            window.location.href = window.location.href + '?meeting=' + encodeURIComponent(meetingUrl);
          }}
        />
      );
    } else if (page === 'configuration') {
      return (
        <ConfigurationScreen
          startCallHandler={() => setPage('call')}
          unsupportedStateHandler={() => setPage('unsupported')}
          callEndedHandler={(errorMsg: CallEndReason) => { setCallEndReason(errorMsg); setPage('error');} }
          screenWidth={screenWidth}
        />
      );
    } else if (page === 'call') {
      return (
        <GroupCall
          endCallHandler={() => setPage('endCall')}
          locator={getLocator()}
          screenWidth={screenWidth}
        />
      );
    } else if (page === 'endCall') {
      return (
        <EndCall
          message={'You left the call'}
          rejoinHandler={() => {
            window.location.href = window.location.href;
          }}
          homeHandler={() => {
            window.location.href = window.location.href.split('?')[0];
          }}
        />
      );
    } else if (page === 'unsupported') {
      window.document.title = 'Unsupported browser';
      return (
        <>
          <a href="https://docs.microsoft.com/en-us/azure/communication-services/concepts/voice-video-calling/calling-sdk-features#calling-client-library-browser-support">Learn more</a>&nbsp;about
          browsers and platforms supported by the web calling sdk
        </>
      );
    } else if (page === 'error') {
      window.document.title = 'Call Ended';
      return (
        <div>
          <div>{`The call has ended with this error code (Code: ${callEndReason?.code} Subcode: ${callEndReason?.subCode})`}</div >

          <div>
          <a href="https://docs.microsoft.com/en-us/azure/communication-services/concepts/troubleshooting-info?tabs=csharp%2Cjavascript%2Cdotnet">Learn more</a>&nbsp;about
          why this Azure Communication Services call has ended.</div>
        </div>
      );
    } else {
      return <></>
    }
  };

  if (getMeetingLink() && page === 'home') {
    setPage('configuration')
  }
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
