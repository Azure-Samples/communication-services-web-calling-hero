// © Microsoft Corporation. All rights reserved.
import React from 'react';
import { ContextualMenuItemType, IContextualMenuProps, ITooltipHostStyles, TooltipHost } from '@fluentui/react';
import { MoreIcon } from '@fluentui/react-icons-northstar';
import { ContextualMenu, IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { fullWidth } from './styles/MediaControls.styles';
import { IconColor, recordingItemStyle } from './styles/CallRecording.styles';

export interface CallRecordingProps {
  startRecording(): void;
  startAudioRecording(recordingContent: string, recordingChannel: string, recordingFormat: string): void;
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

  const keys: string[] = ['startRecording', 'startAudioRecording', 'mixed', 'recordingFormat', 'mp3', 'wav', 'stopRecording', 'ok', 'audio'];
  const recordingStatus = { props };

  const [selectedFormat, setSelectedFormat] = React.useState("mp3");

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

      if (item?.key === 'startRecording') {
        props.startRecording();
      }
      else if (item?.key === 'ok') {
          if (selectedFormat) {
              props.startAudioRecording(keys[8], keys[2], selectedFormat);
          }
      }
      else if (item?.key === 'stopRecording') {
        props.stopRecording();
      }
    },
    [recordingStatus]
  );
  const menuProps: IContextualMenuProps = React.useMemo(
    () => ({
      items: [
        {
          key: keys[0],
          iconProps: {
            iconName: 'CircleFill',
            style: { color: 'crimson' }
          },
          text: 'Start recording',
          disabled: props.recordingStatus === 'STARTED',
          onClick: onContextMenuItemClick
        },
        {
          key: keys[1],
          subMenuProps: {
            items: [
              {
                key: keys[3],
                itemType: ContextualMenuItemType.Section,
                sectionProps: {
                  topDivider: true,
                  bottomDivider: true,
                  title: 'Select Recording Format',
                  items: [
                    { key: keys[4],
                      text: 'Mp3', 
                      canCheck: true,
                      isChecked: selectedFormat === 'mp3',
                      onClick: onFormatSelect,
                    },
                    { key: keys[5],
                      text: 'Wav',
                      canCheck: true,
                      isChecked: selectedFormat === 'wav',
                      onClick: onFormatSelect,
                    },
                  ],
                },
              },
              {
                 key: keys[7],
                 text: 'Ok',
                 style: { textAlign: 'center' },
                 onClick: onContextMenuItemClick,
              },
            ],
          },
          iconProps: {
            iconName: 'CircleFill',
            style: { color: 'crimson' }
          },
          text: 'Start audio-only recording',
          disabled: props.recordingStatus === 'STARTED',
        },
        {
          key: keys[6],
          iconProps: {
            iconName: 'CircleStopSolid',
            style: { color: 'indianred' }
          },
          text: 'Stop recording',
          disabled: props.recordingStatus === 'STOPPED',
          onClick: onContextMenuItemClick
        }
      ]
    }),
    [props.recordingStatus, onFormatSelect, onContextMenuItemClick, keys]
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