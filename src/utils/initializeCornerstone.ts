import { init as initCore } from "@cornerstonejs/core";
import { init as initTools } from "@cornerstonejs/tools";

import initCornerstoneDICOMImageLoader from "./initCornerstoneDICOMImageLoader";
import initProviders from "./initProviders";
import initVolumeLoader from "./initVolumeLoader";

/** 
 * This was originally lifted from: https://github.com/cornerstonejs/cornerstone3D/blob/main/utils/demo/helpers/initDemo.js
 */
export async function initializeCornerstone() {
  /** The core and volumeLoader must be initialized in order to display images. Also, initCore currently seems to be typed incorrectly - it returns a promise and must be awaited, otherwise there will be an error. */
  const initializationResult = await initCore();
  initVolumeLoader();

  /** These do not need to be initialized in order to display images. */
  initProviders();
  initCornerstoneDICOMImageLoader();
  await initTools();

  return { initializationResult };
}
