import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ParticipantStream } from '../core/reducers';
import { hiddenFullScreenStyle, fullScreenStyle, loadingStyle } from './styles/MediaFullScreen.styles';
import { RemoteVideoStream, VideoStreamRenderer, VideoStreamRendererView } from '@azure/communication-calling';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { utils } from 'Utils/Utils';

export interface MediaFullScreenProps {
  activeScreenShareStream: ParticipantStream;
}

export default (props: MediaFullScreenProps): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const fullScreenStreamMediaId = 'fullScreenStreamMediaId';
  const rendererViewRef = useRef<VideoStreamRendererView>();

  /**
   * Start stream after DOM has rendered
   */

  const activeScreenShareStream = props.activeScreenShareStream;

  const renderStreamCallback = useCallback(async () => {
    if (activeScreenShareStream && activeScreenShareStream.stream) {
      const stream: RemoteVideoStream = activeScreenShareStream.stream;
      const renderer: VideoStreamRenderer = new VideoStreamRenderer(stream);
      rendererViewRef.current = await renderer.createView({ scalingMode: 'Fit' });

      const container = document.getElementById(fullScreenStreamMediaId);
      if (container && container.childElementCount === 0) {
        setLoading(false);
        container.appendChild(rendererViewRef.current.target);
      }
    } else {
      if (rendererViewRef) {
        rendererViewRef.current?.dispose();
      }
    }
  }, [activeScreenShareStream]);

  useEffect(() => {
    renderStreamCallback();
  }, [renderStreamCallback]);

  const displayName =
    props.activeScreenShareStream.user.displayName ?? utils.getId(props.activeScreenShareStream.user.identifier);

  return (
    <>
      {loading && (
        <div className={loadingStyle}>
          <Spinner label={`Loading ${displayName}'s screen`} size={SpinnerSize.xSmall} />
        </div>
      )}
      <div id={fullScreenStreamMediaId} className={loading ? hiddenFullScreenStyle : fullScreenStyle}></div>
    </>
  );
};
