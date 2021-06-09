// © Microsoft Corporation. All rights reserved.
import { AudioDeviceInfo, VideoDeviceInfo, RemoteVideoStream } from '@azure/communication-calling';
import { CommunicationIdentifierKind } from '@azure/communication-common';
import { CommunicationUserToken } from '@azure/communication-identity';
import preval from 'preval.macro';
export declare interface RecordingApiResponse {
    recordingId: string;
    message: string;
}
export declare interface RecordingActionResponse {
    message: string;
}

export const utils = {
    getAppServiceUrl: (): string => {
        return window.location.origin;
    },
    getTokenForUser: async (): Promise<CommunicationUserToken> => {
        const response = await fetch('/token');
        if (response.ok) {
            return response.json();
        }
        throw new Error('Invalid token response');
    },
    getRefreshedTokenForUser: async (identity: string): Promise<string> => {
        const response = await fetch(`/refreshToken/${identity}`);
        if (response.ok) {
            const content = await response.json();
            return content.token;
        }
        throw new Error('Invalid token response');
    },
    startRecording: async (id: string): Promise<RecordingApiResponse> => {
        const response = await fetch('/recording/startRecording?serverCallId=' + id);
        if (response.ok) {
            var recordingid = await response.json();
            return { recordingId: recordingid, message: '' };
        }
        var output = await response.json();
        var errorMessage = output.message || "Recording could not be started";
        return { recordingId: '', message: errorMessage };
    },
    //Use this code if you have to implement pause/resume recording
    /*pauseRecording: async (serverCallId: string, recordingId: string): Promise<RecordingActionResponse> => {
        const response = await fetch('/recording/pauseRecording?serverCallId=' + serverCallId + '&recordingId=' + recordingId);
        if (response.ok) {
            return { message: '' };
        }
        return { message: "Recording could not be paused" };
    },
    resumeRecording: async (serverCallId: string, recordingId: string): Promise<RecordingActionResponse> => {
        const response = await fetch('/recording/resumeRecording?serverCallId=' + serverCallId + '&recordingId=' + recordingId);
        if (response.ok) {
            return { message: '' };
        }
        return { message: "Recording could not be resumed" };
    },*/
    stopRecording: async (serverCallId: string, recordingId: string): Promise<RecordingActionResponse> => {
        const response = await fetch('/recording/stopRecording?serverCallId=' + serverCallId + '&recordingId=' + recordingId);
        if (response.ok) {
            return { message: '' };
        }
        return { message: "Recording could not be stopped" };
    },
    isSelectedAudioDeviceInList(selected: AudioDeviceInfo, list: AudioDeviceInfo[]): boolean {
        return list.filter((item) => item.name === selected.name).length > 0;
    },
    isSelectedVideoDeviceInList(selected: VideoDeviceInfo, list: VideoDeviceInfo[]): boolean {
        return list.filter((item) => item.name === selected.name).length > 0;
    },
    isMobileSession(): boolean {
        return window.navigator.userAgent.match(/(iPad|iPhone|iPod|Android|webOS|BlackBerry|Windows Phone)/g)
            ? true
            : false;
    },
    isSmallScreen(): boolean {
        return window.innerWidth < 700 || window.innerHeight < 400;
    },
    isUnsupportedBrowser(): boolean {
        return window.navigator.userAgent.match(/(Firefox)/g) ? true : false;
    },
    getId: (identifier: CommunicationIdentifierKind): string => {
        switch (identifier.kind) {
            case 'communicationUser':
                return identifier.communicationUserId;
            case 'phoneNumber':
                return identifier.phoneNumber;
            case 'microsoftTeamsUser':
                return identifier.microsoftTeamsUserId;
            case 'unknown':
                return identifier.id;
        }
    },
    getStreamId: (userId: string, stream: RemoteVideoStream): string => {
        return `${userId}-${stream.id}-${stream.mediaStreamType}`;
    },
    /*
     * TODO:
     *  Remove this method once the SDK improves error handling for unsupported browser.
     */
    isOnIphoneAndNotSafari(): boolean {
        const userAgent = navigator.userAgent;
        // Chrome uses 'CriOS' in user agent string and Firefox uses 'FxiOS' in user agent string.
        if (userAgent.includes('iPhone') && (userAgent.includes('FxiOS') || userAgent.includes('CriOS'))) {
            return true;
        }
        return false;
    },
    getBuildTime: (): string => {
        const dateTimeStamp = preval`module.exports = new Date().toLocaleString();`;
        return dateTimeStamp;
    }
};
