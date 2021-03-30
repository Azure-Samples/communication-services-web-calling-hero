// © Microsoft Corporation. All rights reserved.

import React, { useEffect, useState } from 'react';
import { Label, Spinner, SpinnerSize } from '@fluentui/react';
import { RemoteVideoStream, VideoStreamRenderer, VideoStreamRendererView } from '@azure/communication-calling';
import { videoHint, mediaContainer } from './styles/StreamMedia.styles';
import { utils } from 'Utils/Utils';
import staticMediaSVG from '../assets/staticmedia.svg';
import { Image, ImageFit } from '@fluentui/react';

export interface RemoteStreamMediaProps {
  label: string;
  stream: RemoteVideoStream | undefined;
}

export default (props: RemoteStreamMediaProps): JSX.Element => {
  let rendererView: VideoStreamRendererView;

  const streamId = props.stream ? utils.getStreamId(props.label, props.stream) : `${props.label} - no stream`;

  const [activeStreamBeingRendered, setActiveStreamBeingRendered] = useState(false);
  const [showRenderLoading, setShowRenderLoading] = useState(false);

  const imageProps = {
    src: staticMediaSVG.toString(),
    imageFit: ImageFit.contain,
    styles: {
      root: {
        width: '100%',
        height: '100%',
        display: activeStreamBeingRendered ? 'none' : 'block'
      }
    }
  };

  const loadingStyle = {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const {label, stream} = props;

  const renderRemoteStream = async () => {
    const container = document.getElementById(streamId);
    if (container && props.stream && props.stream.isAvailable) {
      // if we are already rendering a stream we don't want to start rendering the same stream
      if (activeStreamBeingRendered) {
        return;
      }

      // set the flag that a stream is being rendered
      setActiveStreamBeingRendered(true);
      setShowRenderLoading(true);
      const renderer: VideoStreamRenderer = new VideoStreamRenderer(props.stream);
      // this can block a really long time if we fail to be subscribed to the call and it has to retry
      const rendererView = await renderer.createView({ scalingMode: 'Crop' });
      setShowRenderLoading(false);
      if (container && container.childElementCount === 0) {
        container.appendChild(rendererView.target);
      }
    } else {
      setActiveStreamBeingRendered(false);

      if (rendererView) {
        rendererView.dispose();
      }
    }
  };

  useEffect(() => {
    if (!stream) {
      return;
    }

    stream.on('isAvailableChanged', renderRemoteStream);

    if (stream.isAvailable) {
      renderRemoteStream();
    }
  }, [stream, renderRemoteStream]);

  return (
    <div className={mediaContainer}>
      <div style={{display: activeStreamBeingRendered ? 'block' : 'none' }} className={mediaContainer} id={streamId}>
      { showRenderLoading && <Spinner style={loadingStyle} label={`Rendering stream...`} size={SpinnerSize.xSmall} />}
      </div>
        <Image {...imageProps}/>
        <Label className={videoHint}>{label}</Label>
    </div>
  );
};
