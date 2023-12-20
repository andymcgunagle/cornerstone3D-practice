import { useEffect, useRef, useState } from "react";

import {
  Enums,
  RenderingEngine,
  imageLoader,
  metaData,
  volumeLoader,
} from "@cornerstonejs/core";

import { hardcodedMetaDataProvider } from "./utils/hardcodedMetaDataProvider";
import { initializeCornerstone } from "./utils/initializeCornerstone";
import { webImageLoaderFn } from "./utils/registerWebImageLoader";

const imageLoaderScheme = "web" as const;
const containerId = "myContainer" as const;

/** 
 * @description You can use registerImageLoader to make an external image loader available to the cornerstone library. This function accept a scheme which the image loader function (second argument) should act on.
 * @link https://www.cornerstonejs.org/docs/concepts/cornerstone-core/imageLoader#register-image-loader
 */
imageLoader.registerImageLoader(imageLoaderScheme, webImageLoaderFn);

async function renderViewportWithWebImage({
  container,
  imageUrl,
}: {
  container: HTMLDivElement,
  imageUrl: string;
}) {
  try {
    metaData.addProvider(
      (type, imageId) => hardcodedMetaDataProvider(type, imageId, [imageUrl]),
      10_000
    );

    const renderingEngineId = "myRenderingEngine" as const;
    const volumeId = "myVolume" as const;

    const renderingEngine = new RenderingEngine(renderingEngineId);

    const volume = await volumeLoader.createAndCacheVolume(
      volumeId,
      { imageIds: [imageUrl] }
    );

    renderingEngine.setViewports([
      {
        element: container,
        type: Enums.ViewportType.STACK,
        viewportId: containerId,
      },
    ]);

    const viewport = renderingEngine.getStackViewports()[0];

    volume.load();

    await viewport.setStack([imageUrl]);

    await viewport.setImageIdIndex(0);

    renderingEngine.render();
  } catch (error) {
    console.error(error);
  }
}

/** 
 * @description Basic working example of cornerstone3D with React using a stripped down version of the webLoader example linked below. The initDemo function in the cornerstone3D repo seemed to be the key to getting this working.
 * @link https://github.com/cornerstonejs/cornerstone3D/blob/main/packages/core/examples/webLoader/index.ts
 * @link https://github.com/cornerstonejs/cornerstone3D/blob/main/utils/demo/helpers/initDemo.js
 */
export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(`${imageLoaderScheme}:https://picsum.photos/500`);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const { initializationResult } = await initializeCornerstone();

        if (!initializationResult) throw new Error("Cornerstone initialization failed");

        setIsInitialized(true);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (
          !containerRef?.current
          || !isInitialized
          || imageUrl.length === 0
        ) return;

        await renderViewportWithWebImage({
          container: containerRef.current,
          imageUrl,
        });
      } catch (error) {
        console.error(error);
      }
    })();
  }, [
    imageUrl,
    isInitialized,
  ]);

  return (
    <div
      id={containerId}
      ref={containerRef}
      style={{
        height: "500px",
        width: "500px",
      }}
    />
  );
}
