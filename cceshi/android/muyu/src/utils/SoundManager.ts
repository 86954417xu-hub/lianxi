import { Platform, Vibration } from 'react-native';

export class SoundManager {
  private static instance: SoundManager;
  private soundPool: any = null;

  private constructor() {}

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public async playWoodFishSound(): Promise<void> {
    try {
      // 使用震动反馈
      if (Platform.OS === 'android') {
        // 震动50ms,荣耀手机可能需要更长的震动时间
        Vibration.vibrate(50);
      }
    } catch (error) {
      console.log('Sound error:', error);
    }
  }
}

export const soundManager = SoundManager.getInstance();
