import { init as initCore } from "@cornerstonejs/core";
import { init as initTools } from "@cornerstonejs/tools";

import initCornerstoneDICOMImageLoader from "./initCornerstoneDICOMImageLoader";
import initProviders from "./initProviders";
import initVolumeLoader from "./initVolumeLoader";

/** 
 * Grabbed this from https://github.com/cornerstonejs/cornerstone3D/blob/main/utils/demo/helpers/initDemo.js
 */
export async function initDemo() {
  initProviders();

  initCornerstoneDICOMImageLoader();

  initVolumeLoader();

  await initTools();

  const initializationResult = await initCore();

  return { initializationResult };
}
