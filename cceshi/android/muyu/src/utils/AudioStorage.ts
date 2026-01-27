import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUDIO_CACHE_DIR = `${RNFS.CachesDirectoryPath}/woodenfish`;

export const initAudioCache = async () => {
  const exists = await RNFS.exists(AUDIO_CACHE_DIR);
  if (!exists) {
    await RNFS.mkdir(AUDIO_CACHE_DIR);
  }
};

export const saveAudio = async (sourceUri: string): Promise<string | null> => {
  try {
    await initAudioCache();

    const timestamp = Date.now();
    const extension = sourceUri.split('.').pop() || 'mp3';
    const fileName = `woodfish_sound_${timestamp}.${extension}`;
    const destinationPath = `${AUDIO_CACHE_DIR}/${fileName}`;

    // 复制文件到缓存目录
    await RNFS.copyFile(sourceUri, destinationPath);

    // 保存路径到 AsyncStorage
    await AsyncStorage.setItem('woodfishSoundPath', destinationPath);

    return destinationPath;
  } catch (error) {
    console.error('Failed to save audio:', error);
    return null;
  }
};

export const getSavedAudioPath = async (): Promise<string | null> => {
  try {
    const path = await AsyncStorage.getItem('woodfishSoundPath');
    if (path && await RNFS.exists(path)) {
      return path;
    }
    return null;
  } catch (error) {
    console.error('Failed to get saved audio path:', error);
    return null;
  }
};

export const clearAudioCache = async () => {
  try {
    const path = await AsyncStorage.getItem('woodfishSoundPath');
    if (path && await RNFS.exists(path)) {
      await RNFS.unlink(path);
    }
    await AsyncStorage.removeItem('woodfishSoundPath');
  } catch (error) {
    console.error('Failed to clear audio cache:', error);
  }
};
