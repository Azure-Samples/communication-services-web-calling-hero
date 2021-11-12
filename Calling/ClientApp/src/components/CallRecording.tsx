﻿// © Microsoft Corporation. All rights reserved.
import React from 'react';
import { ContextualMenuItemType, IContextualMenuProps, ITooltipHostStyles, TooltipHost } from '@fluentui/react';
import { MoreIcon } from '@fluentui/react-icons-northstar';
import { ContextualMenu, IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { fullWidth } from './styles/MediaControls.styles';
import { IconColor, recordingItemStyle } from './styles/CallRecording.styles';
import { Constants, RecordingKeys, RecordingOptions } from '../core/constants';

export interface CallRecordingProps {
  startRecording(): void;
  startAudioRecording(recordingFormat: string): void;
  stopRecording(): void;
  recordingStatus: 'STARTED' | 'STOPPED';
}

export const CallRecording = (props: CallRecordingProps): JSX.Element => {
  const linkRef = React.useRef(null);
  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const onShowContextualMenu = React.useCallback((ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault();
    setShowContextualMenu(true);
  }, []);

  const onHideContextualMenu = React.useCallback(() => setShowContextualMenu(false), []);

  const recordingStatus = { props };

  const [selectedFormat, setSelectedFormat] = React.useState(RecordingOptions.Mp3.toLowerCase());

  const onFormatSelect = React.useCallback(
    (ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>, item?: IContextualMenuItem): void => {
      ev && ev.preventDefault();

      if (item) {
        setSelectedFormat(item.key);
      }
    },
    [selectedFormat],
  );

  const onContextMenuItemClick = React.useCallback(
    (ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>, item?: IContextualMenuItem): void => {

      if (item?.key === RecordingKeys.StartRecording.toLowerCase()) {
        props.startRecording();
      }
      else if (item?.key === RecordingKeys.StartAudioRecording.toLowerCase()) {
        props.startAudioRecording(selectedFormat);
      }
      else if (item?.key === RecordingKeys.StopRecording.toLowerCase()) {
        props.stopRecording();
      }
    },
    [recordingStatus]
  );
  const menuProps: IContextualMenuProps = React.useMemo(
    () => ({
      items: [
        {
          key: RecordingKeys.StartRecording.toLowerCase(),
          iconProps: {
            iconName: 'CircleFill',
            style: { color: 'crimson' }
          },
          text: Constants.START_RECORDING,
          disabled: props.recordingStatus === Constants.STARTED.toUpperCase(),
          onClick: onContextMenuItemClick
        },
        {
          key: RecordingKeys.StartAudioRecording.toLowerCase(),
          subMenuProps: {
            items: [
              {
                key: RecordingKeys.RecordingFormat.toLowerCase(),
                itemType: ContextualMenuItemType.Section,
                sectionProps: {
                  topDivider: true,
                  bottomDivider: true,
                  title: Constants.SELECT_RECORDING_FORMAT,
                  items: [
                    {
                      key: RecordingOptions.Mp3.toLowerCase(),
                      text: RecordingOptions.Mp3, 
                      canCheck: true,
                      isChecked: selectedFormat === RecordingOptions.Mp3.toLowerCase(),
                      onClick: onFormatSelect,
                    },
                    {
                      key: RecordingOptions.Wav.toLowerCase(),
                      text: RecordingOptions.Wav,
                      canCheck: true,
                      isChecked: selectedFormat === RecordingOptions.Wav.toLowerCase(),
                      onClick: onFormatSelect,
                    },
                  ],
                },
              },
              {
                 key: RecordingKeys.StartAudioRecording.toLowerCase(),
                 text: Constants.OK,
                 style: { textAlign: 'center' },
                 onClick: onContextMenuItemClick,
              },
            ],
          },
          iconProps: {
            iconName: 'CircleFill',
            style: { color: 'crimson' }
          },
          text: Constants.START_AUDIO_RECORDING,
          disabled: props.recordingStatus === Constants.STARTED.toUpperCase(),
        },
        {
          key: RecordingKeys.StopRecording.toLowerCase(),
          iconProps: {
            iconName: 'CircleStopSolid',
            style: { color: 'indianred' }
          },
          text: Constants.STOP_RECORDING,
          disabled: props.recordingStatus === Constants.STOPPED.toUpperCase(),
          onClick: onContextMenuItemClick
        }
      ]
    }),
    [props.recordingStatus, onFormatSelect, onContextMenuItemClick]
  );

  const calloutProps = { gapSpace: 0 };
  const hostStyles: Partial<ITooltipHostStyles> = { root: { display: 'inline-block' } };
  return (
    <div>
      {
        <a ref={linkRef} className={IconColor} onClick={onShowContextualMenu} href="#">
          <div className={fullWidth}>
            <TooltipHost content="More actions" id="moreActions" calloutProps={calloutProps} styles={hostStyles}>
              <MoreIcon aria-describedby={'moreActions'} size="medium" className={recordingItemStyle}/>
            </TooltipHost>
          </div>
        </a>
      }
      <ContextualMenu
        items={menuProps.items}
        hidden={!showContextualMenu}
        target={linkRef}
        onItemClick={onHideContextualMenu}
        onDismiss={onHideContextualMenu}
        gapSpace={10}
      />
    </div>
  );
};