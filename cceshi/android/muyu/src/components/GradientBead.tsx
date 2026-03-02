import React from 'react';
import {View, StyleSheet} from 'react-native';

interface GradientBeadProps {
  size?: number;
  opacity?: number;
}

const GradientBead: React.FC<GradientBeadProps> = ({size = 80, opacity = 1}) => {
  // 设计稿参数换算 (w-20 = 80px, h-20 = 80px)
  // top-3 = 12px, left-4 = 16px, w-8 = 32px, h-5 = 20px
  // bottom-3 = 12px, right-4 = 16px, w-6 = 24px, h-4 = 16px
  
  return (
    <View style={[styles.beadContainer, {width: size, height: size, opacity}]}>
      {/* 主珠子 - 渐变背景 amber-600 -> amber-800 -> red-900 */}
      <View style={[styles.beadBase, {width: size, height: size, borderRadius: size / 2}]}>
        {/* 渐变模拟 - 多层叠加 */}
        {/* 底层: red-900 (#7F1D1D) */}
        <View
          style={[
            styles.gradientLayer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: '#7F1D1D',
            },
          ]}
        />
        {/* 中层: amber-800 (#92400E) */}
        <View
          style={[
            styles.gradientLayer,
            {
              width: size * 0.95,
              height: size * 0.95,
              borderRadius: (size * 0.95) / 2,
              backgroundColor: '#92400E',
              top: size * 0.025,
              left: size * 0.025,
            },
          ]}
        />
        {/* 上层: amber-600 (#D97706) */}
        <View
          style={[
            styles.gradientLayer,
            {
              width: size * 0.75,
              height: size * 0.75,
              borderRadius: (size * 0.75) / 2,
              backgroundColor: '#D97706',
              top: size * 0.05,
              left: size * 0.05,
            },
          ]}
        />
        
        {/* 高光效果 - top-3 left-4 w-8 h-5 */}
        <View
          style={[
            styles.highlight,
            {
              width: size * 0.4,  // w-8 = 32px / 80px = 0.4
              height: size * 0.25, // h-5 = 20px / 80px = 0.25
              borderRadius: size * 0.2,
              top: size * 0.15,    // top-3 = 12px / 80px = 0.15
              left: size * 0.2,    // left-4 = 16px / 80px = 0.2
            },
          ]}
        />
        
        {/* 暗部效果 - bottom-3 right-4 w-6 h-4 */}
        <View
          style={[
            styles.shadow,
            {
              width: size * 0.3,   // w-6 = 24px / 80px = 0.3
              height: size * 0.2,  // h-4 = 16px / 80px = 0.2
              borderRadius: size * 0.15,
              bottom: size * 0.15, // bottom-3 = 12px / 80px = 0.15
              right: size * 0.2,   // right-4 = 16px / 80px = 0.2
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  beadContainer: {
    // shadow-xl + bead-shadow 外阴影
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  beadBase: {
    overflow: 'hidden',
  },
  gradientLayer: {
    position: 'absolute',
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{rotate: '45deg'}],
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default GradientBead;
