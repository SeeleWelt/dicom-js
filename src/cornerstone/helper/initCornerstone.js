import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader"
import { init as csToolsInit } from "@cornerstonejs/tools";
import {
  init as csRenderInit,
} from '@cornerstonejs/core';
import initVolumeLoader from "@/cornerstone/helper/initVolumeLoader";
import initProviders from "@/cornerstone/helper/initProviders";
export default async function initCornerstone() {
  // 初始化 - 元数据提供者
  initProviders();

  // 初始化 - Dicom文件加载器
  cornerstoneDICOMImageLoader.init();

  // 初始化 - Volume加载器
  initVolumeLoader();

  // 初始化 - CornerStone
  await csRenderInit();

  // 初始化 - CornerStone/tool
  await csToolsInit();
}
