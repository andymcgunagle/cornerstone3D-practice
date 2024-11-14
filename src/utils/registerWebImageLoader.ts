import * as cornerstone from "@cornerstonejs/core";
import type { IImage, ImageLoaderFn } from "@cornerstonejs/core/types";

const canvas: HTMLCanvasElement = document.createElement("canvas");

let lastImageIdDrawn: string | undefined;

/** 
 * The legacy cornerstoneWebImageLoader references the code for this web image loader. I've refactored it a bit - mostly organization and types without changing the logic.
 * - Reference in legacy package: https://github.com/cornerstonejs/cornerstoneWebImageLoader?tab=readme-ov-file#cornerstone-web-image-loader
 * - New code: https://github.com/cornerstonejs/cornerstone3D/blob/main/packages/core/examples/webLoader/registerWebImageLoader.ts
 */

/**
 * @description Creates a cornerstone Image object for the specified Image and imageId.
 * @param image - An Image
 * @param imageId - the imageId for this image
 * @returns Cornerstone Image Object
 */
function createImage(image: HTMLImageElement, imageId: string): IImage {

  function getPixelData() {
    const imageData = getImageData();

    const targetArray = new Uint8Array((imageData?.width ?? 0) * (imageData?.height ?? 0) * 3);

    if (imageData) {
      for (let i = 0, j = 0; i < imageData?.data.length; i += 4, j += 3) {
        targetArray[j] = imageData.data[i];
        targetArray[j + 1] = imageData.data[i + 1];
        targetArray[j + 2] = imageData.data[i + 2];
      }
    }

    return targetArray;
  }

  function getImageData() {
    let context: CanvasRenderingContext2D | null = null;

    if (lastImageIdDrawn === imageId) {
      context = canvas.getContext("2d");
    } else {
      canvas.height = image.naturalHeight;

      canvas.width = image.naturalWidth;

      context = canvas.getContext("2d");

      context?.drawImage(image, 0, 0);

      lastImageIdDrawn = imageId;
    }

    return context?.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
  }

  function getCanvas() {
    if (lastImageIdDrawn === imageId) return canvas;

    canvas.height = image.naturalHeight;

    canvas.width = image.naturalWidth;

    const context = canvas.getContext("2d");

    context?.drawImage(image, 0, 0);

    lastImageIdDrawn = imageId;

    return canvas;
  }

  const rows = image.naturalHeight;
  const columns = image.naturalWidth;

  /** Extract the various attributes we need. */
  return {
    color: true,
    columnPixelSpacing: 1, // For web it's always 1
    columns,
    dataType: "Uint8Array",
    getCanvas,
    getPixelData,
    height: rows,
    imageId,
    intercept: 0,
    invert: false,
    maxPixelValue: 255,
    minPixelValue: 0,
    numberOfComponents: 3,
    rgba: false, // We converted the canvas rgba already to rgb above
    rowPixelSpacing: 1, // For web it's always 1
    rows,
    sizeInBytes: rows * columns * 3,
    slope: 1,
    voiLUTFunction: "LINEAR", // Not 100% this is correct, but it works...
    width: columns,
    windowCenter: 128,
    windowWidth: 255,
  };
}

function arrayBufferToImage(arrayBuffer: ArrayBuffer): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    const arrayBufferView = new Uint8Array(arrayBuffer);

    const blob = new Blob([arrayBufferView]);

    const urlCreator = window.URL || window.webkitURL;

    const imageUrl = urlCreator.createObjectURL(blob);

    image.src = imageUrl;

    image.onload = () => {
      resolve(image);
      urlCreator.revokeObjectURL(imageUrl);
    };

    image.onerror = (error) => {
      urlCreator.revokeObjectURL(imageUrl);
      reject(error);
    };
  });
}

const options = {
  beforeSend: (xhr: XMLHttpRequest) => {
    console.info("beforeSend:", xhr);
  },
} as const;

/** Loads an image given a url to an image. */
function loadImage(uri: string, imageId: string) {
  const xhr = new XMLHttpRequest();

  xhr.open("GET", uri, true);

  xhr.responseType = "arraybuffer";

  options.beforeSend(xhr);

  xhr.onprogress = (oProgress) => {
    if (oProgress.lengthComputable) {
      // evt.loaded the bytes browser receive
      // evt.total the total bytes set by the header
      const loaded = oProgress.loaded;
      const total = oProgress.total;
      const percentComplete = Math.round((loaded / total) * 100);

      cornerstone.triggerEvent(
        cornerstone.eventTarget,
        "cornerstoneimageloadprogress",
        {
          imageId,
          loaded,
          percentComplete,
          total,
        }
      );
    }
  };

  const promise = new Promise<IImage>((resolve, reject) => {
    xhr.onload = async () => {
      try {
        const image = await arrayBufferToImage(xhr.response);

        const imageObject = createImage(image, imageId);

        resolve(imageObject);
      } catch (error) {
        console.error(error);
      }
    };

    xhr.onerror = (error) => {
      reject(error);
    };

    xhr.send();
  });

  return {
    promise,
    cancelFn: () => {
      xhr.abort();
    },
  };
}

export const webImageLoaderSchemeName = "web" as const;

export const webImageLoaderSchemeDelimiter = ":" as const;

export const webImageLoaderSchemeWithDelimiter = `${webImageLoaderSchemeName}${webImageLoaderSchemeDelimiter}` as const;

/**
 * Small stripped down loader from cornerstoneDICOMImageLoader which doesn't create cornerstone images we don't need.
 */
export const webImageLoaderFn: ImageLoaderFn = (
  imageId,
  options
) => {
  return {
    promise: new Promise<any>((resolve, reject) => {
      /** Get the pixel data from the server. */
      loadImage(imageId.replace(`${webImageLoaderSchemeWithDelimiter}`, ""), imageId)
        .promise.then((image) => {
          // image.getPixelData();
          resolve(image);

        }, (error) => {
          reject(error);
        }).catch((error) => {
          reject(error);
        });
    }),
    cancelFn: undefined,
  };
};
