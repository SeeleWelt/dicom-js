import { utilities as csUtils } from "@cornerstonejs/core";

const scalingPerImageId = {};

function addInstance(imageId, scalingMetaData) {
  const imageURI = csUtils.imageIdToURI(imageId);
  scalingPerImageId[imageURI] = scalingMetaData;
}

function get(type, imageId) {
  if (type === "imagePlaneModule") {
    const imageURI = csUtils.imageIdToURI(imageId);
    return scalingPerImageId[imageURI];
  }
}

export default { addInstance, get };
