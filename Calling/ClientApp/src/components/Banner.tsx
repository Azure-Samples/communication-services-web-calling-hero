import React from 'react';
import { IconButton, Stack } from "@fluentui/react";
import { bannerStyle, headerStyle, dismissButtonStyle,
    bannerWarningStyle, iconColor, bannerMessageStyle, bannerDismissOuterStyle
} from './styles/GroupCall.styles';

export interface BannerProps {
    dismissBanner(): void;
    bannerMessages: {Header: string, Message: string, LinkText: string };
}

export default (props: BannerProps): JSX.Element => {
    return (
        <div>
        <Stack.Item>
            <div className={bannerStyle} id="banner">
                <div className={bannerWarningStyle}>
                    <IconButton iconProps={{ iconName: 'Warningsolid' }} className={iconColor} title="Warning" ariaLabel="Warning" />
                </div>
                <div className={headerStyle}>
                     {props.bannerMessages.Header}
                </div> &nbsp;
                <div className={bannerMessageStyle}>
                    {props.bannerMessages.Message}
                </div>  
            <div className={bannerDismissOuterStyle}>
                    <button onClick={props.dismissBanner} className={dismissButtonStyle}>Dismiss</button>
                </div>
             </div>
        </Stack.Item>
        </div>
    );
};
