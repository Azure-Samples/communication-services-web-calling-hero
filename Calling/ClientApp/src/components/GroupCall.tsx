// © Microsoft Corporation. All rights reserved.
import React, { useState, useEffect } from 'react';
import { Label, Overlay, Stack } from '@fluentui/react';
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
  overlayStyles
} from './styles/GroupCall.styles';
import {
  Call,
  LocalVideoStream,
  AudioDeviceInfo,
  VideoDeviceInfo,
  RemoteParticipant,
  CallAgent,
  DeviceManager
} from '@azure/communication-calling';
import { ParticipantStream } from 'core/reducers/index.js';

export interface GroupCallProps {
  userId: string;
  groupId: string;
  call: Call;
  callAgent: CallAgent;
  mic: boolean;
  remoteParticipants: RemoteParticipant[];
  streams: ParticipantStream[];
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
  setAudioDeviceInfo(deviceInfo: AudioDeviceInfo): void;
  setVideoDeviceInfo(deviceInfo: VideoDeviceInfo): void;
  setLocalVideoStream(stream: LocalVideoStream | undefined): void;
  mute(): void;
  isGroup(): void;
  joinGroup(): void;
  endCallHandler(): void;
  attempts: number;
  setAttempts(attempts: number): void;
  deviceManager: DeviceManager;
}

export default (props: GroupCallProps): JSX.Element => {
  const [selectedPane, setSelectedPane] = useState(CommandPanelTypes.None);
  const activeScreenShare = props.screenShareStreams && props.screenShareStreams.length === 1;

  const { callAgent, call, groupId, joinGroup, attempts } = props;

  useEffect(() => {
    if (attempts > 3) {
      props.endCallHandler();
      // after we switch the screen on the next tick we want to 
      // set the attempts back to 0
      setTimeout(()=> props.setAttempts(0), 0)
    }
    if (callAgent && !call) {
      joinGroup();
      document.title = `${groupId} group call sample`;
    }
  }, [callAgent, call, groupId, joinGroup]);

  return (
    <Stack horizontalAlign="center" verticalAlign="center" styles={containerStyles}>
      <Stack.Item styles={headerStyles}>
        <Header
          selectedPane={selectedPane}
          setSelectedPane={setSelectedPane}
          endCallHandler={props.endCallHandler}
          screenWidth={props.screenWidth}
        />
      </Stack.Item>
      <Stack.Item styles={containerStyles}>
        {!props.shareScreen ? (
          props.callState === Constants.CONNECTED && (
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
        ) : (
          <div className={loadingStyle}>
            <Label>Your screen is being shared</Label>
          </div>
        )}
      </Stack.Item>
    </Stack>
  );
};
