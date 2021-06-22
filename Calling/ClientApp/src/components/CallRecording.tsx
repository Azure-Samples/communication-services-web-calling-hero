﻿// © Microsoft Corporation. All rights reserved.
import React from 'react';
import { IContextualMenuProps, ITooltipHostStyles, TooltipHost } from '@fluentui/react';
import { MoreIcon } from '@fluentui/react-icons-northstar';
import { ContextualMenu, IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { fullWidth } from './styles/MediaControls.styles';
import { IconColor, recordingIconDivStyle, recordingTextDivStyle } from './styles/CallRecording.styles';
import { Constants } from '../core/constants';
import recordingOn from '../assets/RecordingOn.png';

export interface CallRecordingProps {
  startRecording(): void;
  stopRecording(): void;
  recordingStatus: string;
}

export default (props: CallRecordingProps): JSX.Element => {
  const linkRef = React.useRef(null);
  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const onShowContextualMenu = React.useCallback((ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault();
    setShowContextualMenu(true);
  }, []);
  const onHideContextualMenu = React.useCallback(() => setShowContextualMenu(false), []);

  const keys: string[] = ['startRecording', 'stopRecording'];
  const recordingStatus = { props };
  const onContextMenuItemClick = React.useCallback(
    (ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>, item?: IContextualMenuItem): void => {
      if (item?.key === 'startRecording') {
        props.startRecording();
      }
      else {
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
          disabled: props.recordingStatus === Constants.STARTED,
          onClick: onContextMenuItemClick
        },
        {
          key: keys[1],
          iconProps: {
            iconName: 'CircleStopSolid',
            style: { color: 'indianred' }
          },
          text: 'Stop recording',
          disabled: props.recordingStatus === Constants.STOPPED || props.recordingStatus === '',
          onClick: onContextMenuItemClick
        }
      ]
    }),
    [props.recordingStatus, onContextMenuItemClick, keys]
  );

  const calloutProps = { gapSpace: 0 };
  const hostStyles: Partial<ITooltipHostStyles> = { root: { display: 'inline-block' } };
  return (
    <div>
      <div className={recordingIconDivStyle}>
        {props.recordingStatus === Constants.STARTED && (
          <div>
            <TooltipHost
              content="Recording..."
              id="recordingOnIcon"
              calloutProps={calloutProps}
              styles={hostStyles}
            >
              <img src={recordingOn} />
            </TooltipHost>
            <i className={recordingTextDivStyle}>Recording...</i>
          </div>
        )}
      </div>
      {
        <a ref={linkRef} className={IconColor} onClick={onShowContextualMenu} href="#">
          <div className={fullWidth}>
            <TooltipHost content="More actions" id="moreActions" calloutProps={calloutProps} styles={hostStyles}>
              <MoreIcon aria-describedby={'moreActions'} size="medium" />
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
