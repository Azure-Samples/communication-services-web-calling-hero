import { BlobServiceClient } from '@azure/storage-blob';
import { Feedback } from './Feedback';

export const uploadFeedback = async (feedback: Feedback, screenShotCanvas: HTMLCanvasElement | undefined): Promise<void> => {
  try {
    const response = await fetch('/blobSettings');
    if (!response.ok) {
      throw new Error('Failed to get blob settings from server!');
    }
    const settings = await response.json();

    const blobServiceClient = new BlobServiceClient(settings.sasUri);
    const containerClient = blobServiceClient.getContainerClient(settings.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient('logs-' + feedback.guid + '.json');
    const serializedFeedback = JSON.stringify(feedback, null, 4);
    const logPromise = blockBlobClient.upload(serializedFeedback, serializedFeedback.length);
    let screenShotPromise = undefined;
    if (screenShotCanvas) {
      const blockBlobClient = containerClient.getBlockBlobClient('screenShot-' + feedback.guid + '.png');
      const screenShotBlob = await getCanvasBlob(screenShotCanvas);
      if (screenShotBlob != null) {
        screenShotPromise = blockBlobClient.uploadData(screenShotBlob);
      }
    }
    await Promise.all([logPromise, screenShotPromise]);
  } catch (error) {
    console.log(error);
  }
};

const getCanvasBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
};
