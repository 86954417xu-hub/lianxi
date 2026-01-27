import React from 'react';
import {View, StyleSheet, Image} from 'react-native';

interface WoodFishProps {
  customImage?: string | null;
  woodFishType?: number;
}

const WoodFish: React.FC<WoodFishProps> = ({customImage, woodFishType = 1}) => {
  if (customImage) {
    // 显示自定义图片
    return (
      <View style={styles.container}>
        <Image
          source={{uri: `file://${customImage}`}}
          style={styles.imageStyle}
          resizeMode="contain"
        />
      </View>
    );
  }

  // 显示预设木鱼图片
  const imageSource =
    woodFishType === 1
      ? require('../../assets/woodfish1.png')
      : require('../../assets/woodfish2.png');

  return (
    <View style={[styles.container, {backgroundColor: 'transparent'}]}>
      <Image
        source={imageSource}
        style={styles.imageStyle}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 286,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    width: 286,
    height: 260,
    resizeMode: 'contain',
  },
  fishBody: {
    position: 'relative',
    width: 200,
    height: 180,
  },
  fishMain: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 160,
    height: 120,
    backgroundColor: '#A0522D',
    borderRadius: 80,
    borderWidth: 3,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: {width: 3, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  fishTop: {
    position: 'absolute',
    top: 10,
    left: 40,
    width: 120,
    height: 40,
    backgroundColor: '#8B4513',
    borderRadius: 60,
  },
  fishBottom: {
    position: 'absolute',
    top: 110,
    left: 50,
    width: 100,
    height: 40,
    backgroundColor: '#6D4C41',
    borderRadius: 50,
  },
  fishMouth: {
    position: 'absolute',
    top: 60,
    left: 70,
    width: 60,
    height: 40,
    backgroundColor: '#3E2723',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  fishBase: {
    position: 'absolute',
    bottom: 0,
    left: 60,
    width: 80,
    height: 20,
    backgroundColor: '#5D4037',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default WoodFish;
