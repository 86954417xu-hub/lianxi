import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IMAGE_CACHE_DIR = `${RNFS.CachesDirectoryPath}/woodenfish`;

export const initImageCache = async () => {
  const exists = await RNFS.exists(IMAGE_CACHE_DIR);
  if (!exists) {
    await RNFS.mkdir(IMAGE_CACHE_DIR);
  }
};

export const saveImage = async (type: 'woodFish' | 'userAvatar'): Promise<string | null> => {
  try {
    await initImageCache();

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 1,
    });

    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    if (!asset.uri) return null;

    // 生成新的文件名
    const timestamp = Date.now();
    const extension = asset.uri.split('.').pop() || 'jpg';
    const fileName = `${type}_${timestamp}.${extension}`;
    const destinationPath = `${IMAGE_CACHE_DIR}/${fileName}`;

    // 复制文件到缓存目录
    await RNFS.copyFile(asset.uri, destinationPath);

    // 保存路径到 AsyncStorage
    await AsyncStorage.setItem(`${type}ImagePath`, destinationPath);

    return destinationPath;
  } catch (error) {
    console.error('Failed to save image:', error);
    return null;
  }
};

export const getSavedImagePath = async (type: 'woodFish' | 'userAvatar'): Promise<string | null> => {
  try {
    const path = await AsyncStorage.getItem(`${type}ImagePath`);
    if (path && await RNFS.exists(path)) {
      return path;
    }
    return null;
  } catch (error) {
    console.error('Failed to get saved image path:', error);
    return null;
  }
};

export const clearImageCache = async () => {
  try {
    const exists = await RNFS.exists(IMAGE_CACHE_DIR);
    if (exists) {
      await RNFS.unlink(IMAGE_CACHE_DIR);
      await initImageCache();
    }
    await AsyncStorage.removeItem('woodFishImagePath');
    await AsyncStorage.removeItem('selectedWoodFishType');
  } catch (error) {
    console.error('Failed to clear image cache:', error);
  }
};

export const saveWoodFishType = async (type: number) => {
  try {
    await AsyncStorage.setItem('selectedWoodFishType', String(type));
  } catch (error) {
    console.error('Failed to save wood fish type:', error);
  }
};

export const getWoodFishType = async (): Promise<number> => {
  try {
    const type = await AsyncStorage.getItem('selectedWoodFishType');
    return type ? parseInt(type, 10) : 1;
  } catch (error) {
    console.error('Failed to get wood fish type:', error);
    return 1;
  }
};
