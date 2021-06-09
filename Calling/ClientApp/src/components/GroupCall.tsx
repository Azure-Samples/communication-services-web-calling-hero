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
    AudioDeviceInfo,
    VideoDeviceInfo,
    RemoteParticipant,
    CallAgent,
    DeviceManager,
    LocalVideoStream
} from '@azure/communication-calling';
import { ParticipantStream } from 'core/reducers/index.js';
import Banner from './Banner';
import DialogBox from './DialogBox';

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
    screenShareStreams: ParticipantStream[];
    audioDeviceInfo: AudioDeviceInfo;
    videoDeviceInfo: VideoDeviceInfo;
    audioDeviceList: AudioDeviceInfo[];
    videoDeviceList: VideoDeviceInfo[];
    screenWidth: number;
    shareScreen: boolean;
    setAudioDeviceInfo(deviceInfo: AudioDeviceInfo): void;
    setVideoDeviceInfo(deviceInfo: VideoDeviceInfo): void;
    mute(): void;
    isGroup(): void;
    joinGroup(): void;
    endCallHandler(): void;
    localVideoStream: LocalVideoStream;
    setLocalVideoStream: void;
    recordingStatus: string;
    recordingId: string;
    bannerVisiblilty: boolean;
    setBannerVisiblilty(b: boolean): void;
    recordingError: string;
    dialogBoxVisiblilty(b: boolean): void;
    isDialogBoxVisiblile: boolean;
}

export default (props: GroupCallProps): JSX.Element => {
    const [selectedPane, setSelectedPane] = useState(CommandPanelTypes.None);
    const activeScreenShare = props.screenShareStreams && props.screenShareStreams.length === 1;
    const [bannerMessages, setBannerMessages] = useState({ Header: '', Message: '', LinkText: '' });
   
    const dismissBanner = () => {
        props.setBannerVisiblilty(false);
    }
    const dismissDialogBox = () => {
        props.dialogBoxVisiblilty(false);
    }
    useEffect(() => {
        if (props.recordingStatus == Constants.STARTED) {
            const message = props.recordingId == '' ? 'This meeting is being recorded. By joining you are giving consent for this meeting to be recorded.'
                : 'You are recording this meeting, Be sure to let everyone know they are being recorded.';
            const header = props.recordingId == '' ? "Recording has started." : "You're recording";
            setBannerMessages({ Header: header, Message: message, LinkText: '' })
        }
        else if (props.recordingStatus == Constants.STOPPED) {
            setBannerMessages({ Header: 'Recording is being saved', Message: 'Recording has stopped. You can find the recording in blob storage.', LinkText: '' })
        }

    }, [props.recordingStatus]);

    return (
        <Stack horizontalAlign="center" verticalAlign="center" styles={containerStyles}>
            <Stack.Item styles={headerStyles}>
                <Header
                    selectedPane={selectedPane}
                    setSelectedPane={setSelectedPane}
                    endCallHandler={(): void => {
                        props.endCallHandler();
                    }}
                    screenWidth={props.screenWidth}
                    localVideoStream={props.localVideoStream}
                    setLocalVideoStream={props.setLocalVideoStream}
                />
            </Stack.Item>
            <Stack.Item styles={headerStyles}>
                {props.isDialogBoxVisiblile && (props.recordingError != '') && <DialogBox message={props.recordingError} isDialogBoxVisiblile={props.isDialogBoxVisiblile} dismissDialogBox={dismissDialogBox} />}
            </Stack.Item>
            <Stack.Item styles={containerStyles}>
                {(props.bannerVisiblilty) && props.recordingStatus != "" &&
                    <Banner bannerMessages={bannerMessages} dismissBanner={dismissBanner} />
                }

                {!props.shareScreen ? (
                    props.callState === Constants.CONNECTED && (
                        <Stack horizontal styles={containerStyles}>
                            <Stack.Item grow styles={activeScreenShare ? activeContainerClassName : hiddenContainerClassName}>
                                {activeScreenShare && <MediaFullScreen activeScreenShareStream={props.screenShareStreams[0]} />}
                            </Stack.Item>
                            <Stack.Item grow styles={!activeScreenShare ? activeContainerClassName : hiddenContainerClassName}>
                                <MediaGallery localVideoStream={props.localVideoStream} />
                            </Stack.Item>
                            {selectedPane !== CommandPanelTypes.None &&
                                (window.innerWidth > Constants.MINI_HEADER_WINDOW_WIDTH ? (
                                    <Stack.Item disableShrink styles={paneStyles}>
                                        <CommandPanel {...props} selectedPane={selectedPane} setSelectedPane={setSelectedPane} />
                                    </Stack.Item>
                                ) : (
                                        <Overlay styles={overlayStyles}>
                                            <CommandPanel {...props} selectedPane={selectedPane} setSelectedPane={setSelectedPane} />
                                        </Overlay>
                                    ))}
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
