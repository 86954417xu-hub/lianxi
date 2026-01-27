# 敲木鱼 App

一款跨平台的敲木鱼应用，支持 iOS 和 Android。

## 功能特点

- 🎯 简约清新的UI设计
- 📊 敲击计数功能
- 🎨 支持本地上传木鱼和锤子图片
- 💾 本地缓存自定义图片
- ✨ 流畅的动画效果
- 💾 计数数据本地持久化

## 安装依赖

```bash
npm install
```

## 运行项目

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

## 技术栈

- React Native 0.73.6
- TypeScript
- React Native Image Picker (图片选择)
- React Native FS (文件系统操作)
- Async Storage (本地存储)
- Safe Area Context (安全区域)

## 项目结构

```
src/
├── App.tsx                 # 应用入口
├── screens/
│   └── WoodenFishApp.tsx   # 主界面
├── components/
│   ├── WoodFish.tsx        # 木鱼组件
│   └── Hammer.tsx          # 锤子组件
└── utils/
    ├── ImageStorage.ts     # 图片存储工具
    └── SoundManager.ts     # 音效管理
```

## 自定义图片

1. 点击右上角设置图标
2. 选择"上传木鱼图片"或"上传锤子图片"
3. 从相册选择图片
4. 图片会自动保存到本地缓存

## 注意事项

- 首次运行需要安装 iOS 依赖: `cd ios && pod install`
- Android 需要配置 SDK 和模拟器
- 图片存储在应用缓存目录，清理缓存会删除自定义图片
