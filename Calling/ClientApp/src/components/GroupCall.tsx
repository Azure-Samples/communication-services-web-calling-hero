// © Microsoft Corporation. All rights reserved.
import React, { useState, useEffect } from 'react';
import { Label, MessageBar, Overlay, Stack } from '@fluentui/react';
import Header from '../containers/Header';
import MediaGallery from '../containers/MediaGallery';
import MediaFullScreen from './MediaFullScreen';
import CommandPanel, { CommandPanelTypes } from './CommandPanel';
import { Constants } from '../core/constants';
import {
  headerStyles,
  containerStyles,
  paneStyles,
  hiddenContainerClassName,
  activeContainerClassName,
  loadingStyle,
  overlayStyles,
  messageBarStyles
} from './styles/GroupCall.styles';
import {
  Call,
  LocalVideoStream,
  AudioDeviceInfo,
  VideoDeviceInfo,
  RemoteParticipant,
  CallAgent,
  DeviceManager,
  TeamsMeetingLinkLocator,
  GroupCallLocator
} from '@azure/communication-calling';
import { ParticipantStream } from 'core/reducers/index.js';

export interface GroupCallProps {
  userId: string;
  groupId: string;
  call: Call;
  callAgent: CallAgent;
  deviceManager: DeviceManager;
  mic: boolean;
  remoteParticipants: RemoteParticipant[];
  callState: string;
  localVideo: boolean;
  localVideoStream: LocalVideoStream;
  screenShareStreams: ParticipantStream[];
  audioDeviceInfo: AudioDeviceInfo;
  videoDeviceInfo: VideoDeviceInfo;
  audioDeviceList: AudioDeviceInfo[];
  videoDeviceList: VideoDeviceInfo[];
  screenWidth: number;
  shareScreen: boolean;
  locator: GroupCallLocator | TeamsMeetingLinkLocator;
  isBeingRecorded: boolean;
  isBeingTranscribed: boolean;
  setAudioDeviceInfo(deviceInfo: AudioDeviceInfo): void;
  setVideoDeviceInfo(deviceInfo: VideoDeviceInfo): void;
  setLocalVideoStream(stream: LocalVideoStream | undefined): void;
  mute(): void;
  join(locator: GroupCallLocator | TeamsMeetingLinkLocator): void;
  endCallHandler(): void;
}

export default (props: GroupCallProps): JSX.Element => {
  const [selectedPane, setSelectedPane] = useState(CommandPanelTypes.None);
  const [isCallBeingRecorded, setIsCallBeingRecorded] = useState<Boolean | undefined>(undefined);
  const [recordedBannerViewable, setRecordedBannerViewable] = useState(false);
  const [isCallBeingTranscribed, setIsCallBeingTranscribed] = useState<Boolean | undefined>(undefined);
  const [transcribedBannerViewable, setTranscribedBannerViewable] = useState(false);
  const activeScreenShare = props.screenShareStreams && props.screenShareStreams.length === 1;

  const { callAgent, call, join, locator, isBeingRecorded, isBeingTranscribed } = props;

  useEffect(() => {
    if (callAgent && !call) {
      join(locator);
    }
  }, [callAgent, call, join, locator]);

  useEffect(() => {
    if (isCallBeingRecorded !== isBeingRecorded) {
      if (isCallBeingRecorded === undefined && isBeingRecorded === false) {
        return;
      }
      setRecordedBannerViewable(true);
      setIsCallBeingRecorded(isBeingRecorded);
    }
    if (isCallBeingTranscribed !== isBeingTranscribed) {
      if (isCallBeingTranscribed === undefined && isBeingTranscribed === false) {
        return;
      }
      setTranscribedBannerViewable(true);
      setIsCallBeingTranscribed(isBeingTranscribed);
    }
   }, [isBeingRecorded, isBeingTranscribed]);

  return (
    <Stack horizontalAlign="center" verticalAlign="center" styles={containerStyles}>
      <Stack.Item styles={headerStyles}>
        <Header
          selectedPane={selectedPane}
          setSelectedPane={setSelectedPane}
          endCallHandler={() => { 
            props.endCallHandler(); 
          }}
          screenWidth={props.screenWidth}
        />
      </Stack.Item>
      { recordedBannerViewable && <Stack.Item styles={messageBarStyles}>
      <MessageBar onDismiss={()=>{setRecordedBannerViewable(false)}}>
        <Label>{ isBeingRecorded ? "Recording started." : "Recording is being saved" }</Label>
        <div>{ isBeingRecorded ? "This call is being recorded for quality assurance." : "Recording has stopped" }</div>
      </MessageBar>
      </Stack.Item> }
      { transcribedBannerViewable && <Stack.Item styles={messageBarStyles}>
        <MessageBar onDismiss={()=>{setTranscribedBannerViewable(false)}}>
          <Label>{ isBeingTranscribed ? "Recording and transcription have started." : "Recording and transcription has stopped."}</Label>
          <div>{ isBeingTranscribed ? "By attending this meeting, you consent to being included. Privacy policy" : ""}</div>
        </MessageBar>
      </Stack.Item>  }
      <Stack.Item styles={containerStyles}>
        { props.shareScreen && (
          <div className={loadingStyle}>
          <Label>Your screen is being shared</Label>
        </div>)
        }
        { props.callState === Constants.CONNECTED &&
          (
            <Stack horizontal styles={containerStyles}>
              <Stack.Item grow styles={activeScreenShare ? activeContainerClassName : hiddenContainerClassName}>
                {activeScreenShare && <MediaFullScreen activeScreenShareStream={props.screenShareStreams[0]} />}
              </Stack.Item>
              <Stack.Item grow styles={!activeScreenShare ? activeContainerClassName : hiddenContainerClassName}>
                <MediaGallery />
              </Stack.Item>
              {selectedPane !== CommandPanelTypes.None && (
                  window.innerWidth > Constants.MINI_HEADER_WINDOW_WIDTH ?
                <Stack.Item disableShrink styles={paneStyles}>
                  <CommandPanel {...props} selectedPane={selectedPane} setSelectedPane={setSelectedPane} />
                </Stack.Item>
                :
                <Overlay styles={overlayStyles}>
                    <CommandPanel {...props} selectedPane={selectedPane} setSelectedPane={setSelectedPane} />
                </Overlay>
              )}
            </Stack>
          )
        }
        {
          props.callState === Constants.LOBBY && (
            <Stack horizontal styles={containerStyles}>
              <div className={loadingStyle} style={{width:'100%'}}>
                <Label>Waiting to be admitted</Label>
              </div>
            </Stack>
          )
        }
      </Stack.Item>
    </Stack>
  );
};
