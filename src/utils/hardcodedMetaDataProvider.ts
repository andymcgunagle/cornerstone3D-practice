export function hardcodedMetaDataProvider(
  type: string,
  imageId: string,
  imageIds: string[]
) {
  const result = typeof imageId === "string" && imageId.split(':');

  if (
    Array.isArray(result) &&
    result[0] !== "web"
  ) return;

  if (type === 'imagePixelModule') {
    return {
      bitsAllocated: 24,
      bitsStored: 24,
      highBit: 24,
      photometricInterpretation: 'RGB',
      pixelRepresentation: 0,
      samplesPerPixel: 3,
    };
  }

  if (type === 'generalSeriesModule') {
    return {
      modality: 'SC',
      seriesDate: '20190201',
      seriesDescription: 'Color',
      seriesInstanceUID: '1.2.276.0.7230010.3.1.4.83233.20190201120000.1',
      seriesNumber: 1,
      seriesTime: '120000',
    };
  }

  if (type === 'imagePlaneModule') {
    const index = imageIds.indexOf(imageId);

    return {
      columnCosines: [0, 1, 0],
      columnPixelSpacing: 1,
      columns: 2048,
      frameOfReferenceUID: 'FORUID',
      imageOrientationPatient: [1, 0, 0, 0, 1, 0],
      imagePositionPatient: [0, 0, index * 5],
      pixelSpacing: [1, 1],
      rowCosines: [1, 0, 0],
      rowPixelSpacing: 1,
      rows: 1216,
    };
  }

  if (type === 'voiLutModule') {
    return {
      // According to the DICOM standard, the width is the number of samples
      // in the input, so 256 samples.
      windowWidth: [256],
      // The center is offset by 0.5 to allow for an integer value for even
      // sample counts
      windowCenter: [128],
    };
  }

  if (type === 'modalityLutModule') {
    return {
      rescaleIntercept: 0,
      rescaleSlope: 1,
    };
  }

  return undefined;
}