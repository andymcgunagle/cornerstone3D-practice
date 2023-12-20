import { volumeLoader } from "@cornerstonejs/core";
import {
  cornerstoneStreamingImageVolumeLoader,
  cornerstoneStreamingDynamicImageVolumeLoader,
} from "@cornerstonejs/streaming-image-volume-loader";

export default function initVolumeLoader() {
  volumeLoader.registerUnknownVolumeLoader(
    cornerstoneStreamingImageVolumeLoader as any
  );

  volumeLoader.registerVolumeLoader(
    "cornerstoneStreamingImageVolume",
    cornerstoneStreamingImageVolumeLoader as any
  );

  volumeLoader.registerVolumeLoader(
    "cornerstoneStreamingDynamicImageVolume",
    cornerstoneStreamingDynamicImageVolumeLoader as any
  );
}
