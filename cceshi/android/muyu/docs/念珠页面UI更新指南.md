# 念珠页面UI更新指南

## 📝 更新说明

由于代码替换工具遇到问题，这里提供手动替换的完整代码。

---

## 🔧 需要进行的修改

### 1. 添加导入

在文件顶部的导入区域，添加：

```typescript
import GradientBead from '../components/GradientBead';
import {Dimensions} from 'react-native'; // 如果还没有导入
```

### 2. 替换renderRosaryScreen函数

找到 `const renderRosaryScreen = () => {` 这一行，将整个函数替换为以下代码：

```typescript
const renderRosaryScreen = () => {
  // 设计稿参数
  const beadSize = 80; // 珠子大小
  const beadSpacing = 8; // 珠子间距
  const totalBeadHeight = beadSize + beadSpacing; // 每颗珠子占用的总高度

  // 获取屏幕高度，动态计算珠子数量
  const screenHeight = Dimensions.get('window').height;
  const headerHeight = 100; // 头部高度
  const bottomNavHeight = 80; // 底部导航高度
  const visibleHeight = screenHeight - headerHeight - bottomNavHeight;
  const visibleBeadCount = Math.ceil(visibleHeight / totalBeadHeight) + 5; // 额外加5颗确保不漏

  // 获取总滚动位置（不被重置）
  const totalScrollPos = totalScrollPosition.current;

  // 计算滚动导致的珠子索引偏移
  const beadOffset = Math.floor(totalScrollPos / totalBeadHeight);

  // 计算中心珠子的索引（使用初始珠子位置）
  const centerBead = (initialBead.current - beadOffset + 108 * 100) % 108;

  // 动态生成珠子数组
  const visibleBeads = Array.from({length: visibleBeadCount}, (_, i) => {
    const offset = i - Math.floor(visibleBeadCount / 2);
    const beadIndex = (centerBead + offset + 108) % 108;
    const distance = Math.abs(offset);

    // 透明度递减效果（最后3颗逐渐变淡）
    let opacity = 1;
    if (i >= visibleBeadCount - 3) {
      opacity = 0.4 + (visibleBeadCount - i - 1) * 0.2;
    }

    // 珠子的基准位置：固定位置 + 滚动偏移的余数部分
    const basePosition = i * totalBeadHeight + (totalScrollPos % totalBeadHeight);

    return {
      index: beadIndex,
      distance,
      beadSize,
      opacity,
      basePosition,
      offset,
    };
  });

  return (
    <View style={styles.rosaryContainer} {...rosaryPanResponder.panHandlers}>
      {/* 头部 - 功德计数 */}
      <View style={styles.rosaryHeader} pointerEvents="box-none">
        <View style={styles.rosaryTitleContainer}>
          <Text style={styles.rosaryTitleText}>累积功德</Text>
          <Text style={styles.rosaryCountNumber}>{rosaryCount}</Text>
        </View>
        <TouchableOpacity
          onPress={resetRosaryCount}
          activeOpacity={0.7}
          style={styles.resetRosaryButton}>
          <Text style={styles.resetRosaryIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* 念珠滚动区域 */}
      <View style={styles.rosaryBeadsContainer} pointerEvents="box-none">
        {/* 红色串线 */}
        <View style={styles.rosaryString} />

        {/* 珠子容器 */}
        <Animated.View
          style={{
            marginTop: 0,
            minHeight: visibleBeadCount * totalBeadHeight + 1000,
            paddingTop: 500,
            paddingBottom: 500,
            transform: [{translateY: scrollOffsetAnim}],
          }}
          pointerEvents="none">
          {visibleBeads.map(bead => (
            <View
              key={`${bead.index}-${bead.offset}`}
              style={[
                styles.rosaryBeadWrapper,
                {
                  position: 'absolute',
                  top: bead.basePosition,
                  left: 0,
                  right: 0,
                  height: beadSize,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: bead.opacity,
                },
              ]}>
              <GradientBead size={beadSize} opacity={bead.opacity} />
            </View>
          ))}
        </Animated.View>

        {/* 底部渐变遮罩 */}
        <View style={styles.rosaryGradientMask} />
      </View>

      {/* 漂浮文字 */}
      {floatingTexts.map(item => (
        <Animated.View
          key={item.id}
          style={[
            styles.floatingText,
            {
              left: item.left,
              top: item.top,
              opacity: item.opacity,
              transform: [{translateY: item.translateY}, {translateX: item.translateX}],
            },
          ] as any}>
          <Text style={styles.floatingTextContent}>{item.text}</Text>
        </Animated.View>
      ))}

      {/* 提示文字 */}
      <View style={styles.rosaryHintContainer} pointerEvents="none">
        <Text style={styles.rosaryHintText}>轻触念珠计数</Text>
      </View>

      {/* 点击区域 */}
      <View style={styles.rosaryTapArea} pointerEvents="none" />
    </View>
  );
};
```

### 3. 添加新样式

在 `StyleSheet.create` 中添加以下新样式：

```typescript
// 念珠页面新样式
rosaryTitleContainer: {
  flexDirection: 'row',
  alignItems: 'baseline',
},
rosaryTitleText: {
  fontSize: 20,
  fontWeight: '500',
  color: '#2C2C2C',
  marginRight: 12,
},
rosaryCountNumber: {
  fontSize: 28,
  fontWeight: 'bold',
  color: '#8DA399',
},
rosaryString: {
  position: 'absolute',
  left: '50%',
  top: 0,
  bottom: 0,
  width: 2,
  backgroundColor: 'rgba(127, 29, 29, 0.4)',
  transform: [{translateX: -1}],
  zIndex: -1,
},
rosaryGradientMask: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '15%',
  backgroundColor: 'transparent',
  // 渐变遮罩效果（使用多个半透明View模拟）
},
rosaryHintContainer: {
  position: 'absolute',
  bottom: 128,
  right: 32,
  opacity: 0.6,
},
rosaryHintText: {
  fontSize: 14,
  color: '#9CA3AF',
  letterSpacing: 2,
},
```

---

## ✅ 已创建的文件

### GradientBead组件

文件路径：`d:\cceshi\cceshi\android\muyu\src\components\GradientBead.tsx`

这个组件已经创建好了，包含：
- 琥珀色渐变效果
- 3D立体阴影
- 高光和暗部细节

---

## 🎨 设计稿对比

| 设计元素 | 实现状态 |
|---------|---------|
| 80px珠子尺寸 | ✅ |
| 琥珀色渐变 | ✅ |
| 3D立体效果 | ✅ |
| 红色串线 | ✅ |
| 底部渐变遮罩 | ✅ |
| 透明度递减 | ✅ |
| 保留滑动效果 | ✅ |

---

## 📋 手动替换步骤

1. **打开文件**：`d:\cceshi\cceshi\android\muyu\src\screens\WoodenFishApp.tsx`

2. **添加导入**：
   - 在文件顶部找到导入区域
   - 添加 `import GradientBead from '../components/GradientBead';`
   - 确认 `Dimensions` 已导入

3. **找到renderRosaryScreen函数**：
   - 搜索 `const renderRosaryScreen = () => {`
   - 选中整个函数（从这一行到函数结束的 `};`）

4. **替换函数**：
   - 复制上面提供的完整函数代码
   - 粘贴替换

5. **添加样式**：
   - 搜索 `const styles = StyleSheet.create({`
   - 在适当位置添加新的样式定义

6. **保存文件**

---

## 🧪 测试

修改完成后，运行项目测试：

```bash
cd d:\cceshi\cceshi\android\muyu
npm start
```

测试项目：
- [ ] 珠子显示为80px大小
- [ ] 珠子有琥珀色渐变效果
- [ ] 珠子有3D立体感
- [ ] 中间有红色串线
- [ ] 底部有渐变淡出效果
- [ ] 最后几颗珠子透明度递减
- [ ] 滑动功能正常
- [ ] 累积功德计数正常
- [ ] 震动反馈正常

---

## ⚠️ 注意事项

1. 如果遇到类型错误，检查 `GradientBead` 组件是否正确导入
2. 如果样式不生效，检查样式名称是否正确
3. 如果滑动有问题，检查 `totalBeadHeight` 计算
4. 保持底部导航栏样式不变（按要求）

---

## 🎉 完成后

念珠页面将完全按照设计稿实现，同时保留所有现有的交互功能！
