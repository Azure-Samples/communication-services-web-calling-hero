import React, { useState } from 'react';
import {
  mediaGalleryGridStyle,
  mediaGalleryStyle,
  mediaGallerySubstageStyle,
  substageMediaGalleryStyle
} from './styles/MediaGallery.styles';
import { RemoteParticipant, LocalVideoStream } from '@azure/communication-calling';
import { utils } from '../Utils/Utils';
import LocalStreamMedia from './LocalStreamMedia';
import RemoteStreamMedia from './RemoteStreamMedia';
import { SelectionState } from 'core/RemoteStreamSelector';
import { Stack } from '@fluentui/react';
import { Constants } from '../core/constants';

export interface MediaGalleryProps {
  userId: string;
  displayName: string;
  remoteParticipants: RemoteParticipant[];
  localVideoStream: LocalVideoStream;
  dominantParticipants: SelectionState[];
}

export default (props: MediaGalleryProps): JSX.Element => {
  const [gridCol, setGridCol] = useState(1);
  const [gridRow, setGridRow] = useState(1);

  if (Constants.DOMINANT_PARTICIPANTS_COUNT < 1 || Constants.DOMINANT_PARTICIPANTS_COUNT > 8) {
    console.error('Please use a value for dominante participants between 1 <= x <= 8');
  }

  // we only are going to support up to a 3x3 grid for today (1 local + 8 remote)
  const rows = [1, 1, 2, 2, 2, 2, 3, 3, 3];
  const cols = [1, 2, 2, 2, 3, 3, 3, 3, 3];

  const calculateNumberOfRows = React.useCallback((participants, maxStreamsToRender) => {
    const length = Math.min(participants.length, maxStreamsToRender);
    if (length - 1 >= rows.length) {
      return 3;
    }

    return rows[length];
  }, []);

  const calculateNumberOfColumns = React.useCallback((participants, maxStreamsToRender) => {
    const length = Math.min(participants.length, maxStreamsToRender);
    if (length - 1 >= cols.length) {
      return 3;
    }

    return cols[length];
  }, []);

  const getMediaGalleryTilesForParticipants = (
    participants: RemoteParticipant[],
    displayName: string
  ): JSX.Element[] => {
    const remoteParticipantsMediaGalleryItems = participants.map((participant) => (
      <div key={`${utils.getId(participant.identifier)}-tile`} className={mediaGalleryStyle}>
        <RemoteStreamMedia
          key={utils.getId(participant.identifier)}
          stream={participant.videoStreams[0]}
          isParticipantStreamSelected={
            props.dominantParticipants.filter((p) => p.participantId === utils.getId(participant.identifier)).length > 0
          }
          label={participant.displayName ?? utils.getId(participant.identifier)}
        />
      </div>
    ));

    // create a LocalStreamMedia component for the local participant
    const localParticipantMediaGalleryItem = (
      <div key="localParticipantTile" className={mediaGalleryStyle}>
        <LocalStreamMedia label={displayName} stream={props.localVideoStream} />
      </div>
    );

    // add the LocalStreamMedia at the beginning of the list
    remoteParticipantsMediaGalleryItems.unshift(localParticipantMediaGalleryItem);

    return remoteParticipantsMediaGalleryItems;
  };

  const getSubstageMediaGalleryTilesForParticipants = (participants: RemoteParticipant[]): JSX.Element[] => {
    const remoteParticipantsMediaGalleryItems = participants.map((participant) => (
      <div key={`${utils.getId(participant.identifier)}-tile`} className={substageMediaGalleryStyle}>
        <RemoteStreamMedia
          key={utils.getId(participant.identifier)}
          stream={participant.videoStreams[0]}
          isParticipantStreamSelected={false}
          label={participant.displayName ?? utils.getId(participant.identifier)}
        />
      </div>
    ));

    return remoteParticipantsMediaGalleryItems;
  };

  const numberOfColumns = calculateNumberOfColumns(props.remoteParticipants, Constants.DOMINANT_PARTICIPANTS_COUNT);
  if (numberOfColumns !== gridCol) setGridCol(numberOfColumns);
  const numberOfRows = calculateNumberOfRows(props.remoteParticipants, Constants.DOMINANT_PARTICIPANTS_COUNT);
  if (numberOfRows !== gridRow) setGridRow(numberOfRows);

  const participantsToLayout = props.remoteParticipants.sort((a, b) => {
    const isParticipantADominant =
      props.dominantParticipants.filter((p) => p.participantId === utils.getId(a.identifier)).length > 0;
    const isParticiantBDominant =
      props.dominantParticipants.filter((p) => p.participantId === utils.getId(b.identifier)).length > 0;
    if (isParticipantADominant && !isParticiantBDominant) {
      return -1;
    } else if (!isParticipantADominant && isParticiantBDominant) {
      return 1;
    }
    return 0;
  });

  // we want to reserve the main stage for video streams we are going to render.
  // we determine the number of participants to render based on how we can select dominant participants
  const mainStageParticipants = participantsToLayout.slice(0, Constants.DOMINANT_PARTICIPANTS_COUNT);
  // the rest of the participants will go to the sub-stage.
  const substageParticipants = participantsToLayout.slice(Constants.DOMINANT_PARTICIPANTS_COUNT);
  const isSubstageVisible = substageParticipants.length > 0;
  return (
    <Stack style={{ height: '100%' }}>
      <div
        id="video-gallery"
        className={mediaGalleryGridStyle}
        style={{
          gridTemplateRows: `repeat(${gridRow}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${gridCol}, 1fr)`
        }}
      >
        {getMediaGalleryTilesForParticipants(mainStageParticipants, props.displayName)}
      </div>
      {isSubstageVisible && (
        <Stack horizontal className={mediaGallerySubstageStyle}>
          {getSubstageMediaGalleryTilesForParticipants(substageParticipants)}
        </Stack>
      )}
    </Stack>
  );
};
