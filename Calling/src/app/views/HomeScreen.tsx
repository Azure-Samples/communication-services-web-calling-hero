// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { Stack, PrimaryButton, Image, ChoiceGroup, IChoiceGroupOption, Text, TextField } from '@fluentui/react';
import heroSVG from '../../assets/hero.svg';
import {
  imgStyle,
  infoContainerStyle,
  callContainerStackTokens,
  callOptionsGroupStyles,
  configContainerStyle,
  configContainerStackTokens,
  containerStyle,
  containerTokens,
  headerStyle,
  teamsItemStyle,
  buttonStyle
} from '../styles/HomeScreen.styles';
import { outboundTextField } from '../styles/HomeScreen.styles';
import { ThemeSelector } from '../theming/ThemeSelector';
import { localStorageAvailable } from '../utils/localStorage';
import { getDisplayNameFromLocalStorage, saveDisplayNameToLocalStorage } from '../utils/localStorage';
import { DisplayNameField } from './DisplayNameField';
import { RoomLocator, TeamsMeetingLinkLocator } from '@azure/communication-calling';
import { TeamsMeetingIdLocator } from '@azure/communication-calling';
import { getRoomIdFromUrl } from '../utils/AppUtils';
import { getIsCTE } from '../utils/AppUtils';
import { CallAdapterLocator } from '@azure/communication-react';

export type CallOption = 'ACSCall' | 'TeamsMeeting' | 'Rooms' | 'StartRooms' | 'TeamsIdentity' | 'TeamsAdhoc';

export interface HomeScreenProps {
  startCallHandler(callDetails: {
    displayName: string;
    callLocator?: CallAdapterLocator | TeamsMeetingLinkLocator | RoomLocator | TeamsMeetingIdLocator;
    option?: CallOption;
    role?: string;
    teamsToken?: string;
    teamsId?: string;
    outboundTeamsUsers?: string[];
  }): void;
  joiningExistingCall: boolean;
}

type ICallChoiceGroupOption = IChoiceGroupOption & { key: CallOption };

export const HomeScreen = (props: HomeScreenProps): JSX.Element => {
  const imageProps = { src: heroSVG.toString() };
  const headerTitle = props.joiningExistingCall ? 'Join Call' : 'Start or join a call';
  const callOptionsGroupLabel = 'Select a call option';
  const buttonText = 'Next';
  const callOptions: ICallChoiceGroupOption[] = [
    { key: 'ACSCall', text: 'Start a call' },
    { key: 'StartRooms', text: 'Start a Rooms call' },
    { key: 'TeamsMeeting', text: 'Join a Teams meeting using ACS identity' },
    { key: 'Rooms', text: 'Join a Rooms Call' },
    { key: 'TeamsIdentity', text: 'Join a Teams call using Teams identity' },
    { key: 'TeamsAdhoc', text: 'Call a Teams User or voice application' }
  ];
  const roomIdLabel = 'Room ID';
  const teamsTokenLabel = 'Enter a Teams token';
  const teamsIdLabel = 'Enter a Teams Id';
  const roomsRoleGroupLabel = 'Rooms Role';
  const roomRoleOptions: IChoiceGroupOption[] = [
    { key: 'Consumer', text: 'Consumer' },
    { key: 'Presenter', text: 'Presenter' },
    { key: 'Attendee', text: 'Attendee' }
  ];

  // Get display name from local storage if available
  const defaultDisplayName = localStorageAvailable ? getDisplayNameFromLocalStorage() : null;
  const [displayName, setDisplayName] = useState<string | undefined>(defaultDisplayName ?? undefined);

  const [chosenCallOption, setChosenCallOption] = useState<ICallChoiceGroupOption>(callOptions[0]);
  const [callLocator, setCallLocator] = useState<TeamsMeetingLinkLocator | RoomLocator | TeamsMeetingIdLocator>();
  const [meetingId, setMeetingId] = useState<string>();
  const [passcode, setPasscode] = useState<string>();
  const [chosenRoomsRoleOption, setRoomsRoleOption] = useState<IChoiceGroupOption>(roomRoleOptions[1]);
  const [teamsToken, setTeamsToken] = useState<string>();
  const [teamsId, setTeamsId] = useState<string>();
  const [outboundTeamsUsers, setOutboundTeamsUsers] = useState<string | undefined>();

  const startGroupCall: boolean = chosenCallOption.key === 'ACSCall';
  const teamsCallChosen: boolean = chosenCallOption.key === 'TeamsMeeting';
  const teamsIdentityChosen = chosenCallOption.key === 'TeamsIdentity';
  const teamsAdhocChosen: boolean = chosenCallOption.key === 'TeamsAdhoc';

  const buttonEnabled =
    (displayName || teamsToken) &&
    (startGroupCall ||
      (teamsCallChosen && callLocator) ||
      (((chosenCallOption.key === 'Rooms' && callLocator) || chosenCallOption.key === 'StartRooms') &&
        chosenRoomsRoleOption) ||
      (teamsAdhocChosen && outboundTeamsUsers) ||
      (teamsIdentityChosen && callLocator && teamsToken && teamsId));

  const showDisplayNameField = !teamsIdentityChosen;

  const [teamsIdFormatError, setTeamsIdFormatError] = useState<boolean>(false);

  return (
    <Stack
      horizontal
      wrap
      horizontalAlign="center"
      verticalAlign="center"
      tokens={containerTokens}
      className={containerStyle}
    >
      <Image alt="Welcome to the ACS Calling sample app" className={imgStyle} {...imageProps} />
      <Stack className={infoContainerStyle}>
        <Text role={'heading'} aria-level={1} className={headerStyle}>
          {headerTitle}
        </Text>
        <Stack className={configContainerStyle} tokens={configContainerStackTokens}>
          <Stack tokens={callContainerStackTokens}>
            {!props.joiningExistingCall && (
              <ChoiceGroup
                styles={callOptionsGroupStyles}
                label={callOptionsGroupLabel}
                defaultSelectedKey="ACSCall"
                options={callOptions}
                required={true}
                onChange={(_, option) => {
                  option && setChosenCallOption(option as ICallChoiceGroupOption);
                  setTeamsIdFormatError(false);
                }}
              />
            )}
            {(teamsCallChosen || teamsIdentityChosen) && (
              <TextField
                className={teamsItemStyle}
                iconProps={{ iconName: 'Link' }}
                label={'Meeting Link'}
                required
                placeholder={'Enter a Teams meeting link'}
                onChange={(_, newValue) => {
                  newValue ? setCallLocator({ meetingLink: newValue }) : setCallLocator(undefined);
                }}
              />
            )}
            {(teamsCallChosen || teamsIdentityChosen) && (
              <Text className={teamsItemStyle} block variant="medium">
                <b>Or</b>
              </Text>
            )}
            {(teamsCallChosen || teamsIdentityChosen) && (
              <TextField
                className={teamsItemStyle}
                iconProps={{ iconName: 'MeetingId' }}
                label={'Meeting Id'}
                required
                placeholder={'Enter a meeting id'}
                onChange={(_, newValue) => {
                  setMeetingId(newValue);
                  newValue ? setCallLocator({ meetingId: newValue, passcode: passcode }) : setCallLocator(undefined);
                }}
              />
            )}
            {(teamsCallChosen || teamsIdentityChosen) && (
              <TextField
                className={teamsItemStyle}
                iconProps={{ iconName: 'passcode' }}
                label={'Passcode'}
                placeholder={'Enter a meeting passcode'}
                onChange={(_, newValue) => {
                  // meeting id is required, but passcode is not
                  setPasscode(newValue);
                  meetingId ? setCallLocator({ meetingId: meetingId, passcode: newValue }) : setCallLocator(undefined);
                }}
              />
            )}
            {teamsCallChosen && (
              <Text className={teamsItemStyle} block variant="medium">
                <b>And</b>
              </Text>
            )}
            {(chosenCallOption.key === 'TeamsIdentity' || getIsCTE()) && (
              <Stack>
                <TextField
                  className={teamsItemStyle}
                  label={teamsTokenLabel}
                  required
                  placeholder={'Enter a Teams Token'}
                  onChange={(_, newValue) => setTeamsToken(newValue)}
                />
              </Stack>
            )}
            {(chosenCallOption.key === 'TeamsIdentity' || getIsCTE()) && (
              <Stack>
                <TextField
                  className={teamsItemStyle}
                  label={teamsIdLabel}
                  required
                  placeholder={'Enter a Teams user ID (8:orgid:<UUID>)'}
                  errorMessage={
                    teamsIdFormatError ? `Teams user ID should be in the format '8:orgid:<UUID>'` : undefined
                  }
                  onChange={(_, newValue) => {
                    if (!newValue) {
                      setTeamsIdFormatError(false);
                      setTeamsId(undefined);
                    } else if (newValue.match(/8:orgid:[a-zA-Z0-9-]+/)) {
                      setTeamsIdFormatError(false);
                      setTeamsId(newValue);
                    } else {
                      setTeamsIdFormatError(true);
                      setTeamsId(undefined);
                    }
                  }}
                />
              </Stack>
            )}
            {chosenCallOption.key === 'Rooms' && (
              <Stack>
                <TextField
                  className={teamsItemStyle}
                  label={roomIdLabel}
                  required
                  placeholder={'Enter a room ID'}
                  onChange={(_, newValue) => setCallLocator(newValue ? { roomId: newValue } : undefined)}
                />
              </Stack>
            )}
            {(chosenCallOption.key === 'Rooms' || chosenCallOption.key === 'StartRooms' || getRoomIdFromUrl()) && (
              <ChoiceGroup
                styles={callOptionsGroupStyles}
                label={roomsRoleGroupLabel}
                defaultSelectedKey="Presenter"
                options={roomRoleOptions}
                required={true}
                onChange={(_, option) => option && setRoomsRoleOption(option)}
              />
            )}
            {teamsAdhocChosen && (
              <Stack>
                <TextField
                  className={outboundTextField}
                  label={'Teams user ID'}
                  required
                  placeholder={'Enter a Teams user ID (8:orgid:<UUID>)'}
                  errorMessage={
                    teamsIdFormatError ? `Teams user ID should be in the format '8:orgid:<UUID>'` : undefined
                  }
                  onChange={(_, newValue) => {
                    if (!newValue) {
                      setTeamsIdFormatError(false);
                      setOutboundTeamsUsers(undefined);
                    } else if (newValue.match(/8:orgid:[a-zA-Z0-9-]+/)) {
                      setTeamsIdFormatError(false);
                      setOutboundTeamsUsers(newValue);
                    } else {
                      setTeamsIdFormatError(true);
                      setOutboundTeamsUsers(undefined);
                    }
                  }}
                />
              </Stack>
            )}
          </Stack>
          {showDisplayNameField && <DisplayNameField defaultName={displayName} setName={setDisplayName} />}
          <PrimaryButton
            disabled={!buttonEnabled}
            className={buttonStyle}
            text={buttonText}
            onClick={() => {
              if (displayName || teamsIdentityChosen) {
                displayName && saveDisplayNameToLocalStorage(displayName);
                const teamsParticipantsToCall = parseParticipants(outboundTeamsUsers);
                props.startCallHandler({
                  //TODO: This needs to be updated after we change arg types of TeamsCall
                  displayName: !displayName ? 'Teams UserName PlaceHolder' : displayName,
                  callLocator: callLocator,
                  option: chosenCallOption.key,
                  role: chosenRoomsRoleOption.key,
                  teamsToken,
                  teamsId,
                  outboundTeamsUsers: teamsParticipantsToCall
                });
              }
            }}
          />
          <div>
            <ThemeSelector label="Theme" horizontal={true} />
          </div>
        </Stack>
      </Stack>
    </Stack>
  );
};

/**
 * splits the participant Id's so we can call multiple people.
 */
const parseParticipants = (participantsString?: string): string[] | undefined => {
  if (participantsString) {
    return participantsString.replaceAll(' ', '').split(',');
  } else {
    return undefined;
  }
};
