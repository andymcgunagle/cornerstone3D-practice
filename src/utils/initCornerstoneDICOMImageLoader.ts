import * as cornerstone from "@cornerstonejs/core";
import * as cornerstoneTools from "@cornerstonejs/tools";
import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader";
import dicomParser from "dicom-parser";

(window as any).cornerstone = cornerstone;
(window as any).cornerstoneTools = cornerstoneTools;

const { preferSizeOverAccuracy } =
  cornerstone.getConfiguration().rendering;

export default function initCornerstoneDICOMImageLoader() {

  cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;

  cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;

  cornerstoneDICOMImageLoader.configure({
    useWebWorkers: true,
    decodeConfig: {
      convertFloatPixelDataToInt: false,
      use16BitDataType: preferSizeOverAccuracy,
    },
  });

  let maxWebWorkers = 1;

  if (navigator.hardwareConcurrency) {
    maxWebWorkers = Math.min(navigator.hardwareConcurrency, 7);
  }

  cornerstoneDICOMImageLoader.webWorkerManager.initialize({
    maxWebWorkers,
    startWebWorkersOnDemand: false,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: false,
        strict: false,
      },
    },
  });
}
