# Android 安装说明

## 前置要求

1. **安装 JDK 11 或更高版本**
   - 下载: https://www.oracle.com/java/technologies/downloads/
   - 配置环境变量 JAVA_HOME

2. **安装 Android SDK**
   - 安装 Android Studio: https://developer.android.com/studio
   - 打开 Android Studio 安装 SDK 和模拟器

3. **配置环境变量**
   ```bash
   ANDROID_HOME=C:\Users\你的用户名\AppData\Local\Android\Sdk
   将 %ANDROID_HOME%\platform-tools 和 %ANDROID_HOME%\tools 添加到 PATH
   ```

## 安装步骤

### 1. 安装依赖
```bash
cd "c:/Users/x'x'z/CodeBuddy/敲木鱼"
npm install
```

### 2. 连接 Android 设备或启动模拟器

**通过USB连接真实手机:**
1. 手机开启开发者选项和USB调试
2. 用USB线连接电脑
3. 手机上允许USB调试

**启动模拟器:**
- 在 Android Studio 中启动模拟器

### 3. 构建并安装到手机

**方式一: 直接运行 (开发版)**
```bash
cd "c:/Users/x'x'z/CodeBuddy/敲木鱼"
npx react-native run-android
```

**方式二: 生成 APK 安装包**

生成 Debug 版 APK:
```bash
cd android
gradlew assembleDebug
```
APK 文件位置: `android/app/build/outputs/apk/debug/app-debug.apk`

生成 Release 版 APK (需要签名):
```bash
cd android
gradlew assembleRelease
```
APK 文件位置: `android/app/build/outputs/apk/release/app-release.apk`

### 4. 安装 APK 到手机

**通过 ADB 安装:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**手动安装:**
- 将 APK 文件发送到手机
- 在手机上点击 APK 文件安装

## 常见问题

### 1. Gradle 下载慢
修改 `android/gradle/wrapper/gradle-wrapper.properties` 中的 distributionUrl 为国内镜像

### 2. SDK 版本不匹配
在 Android Studio 的 SDK Manager 中安装:
- Android 14.0 (API 34)
- Android SDK Build-Tools 34.0.0

### 3. 无法连接设备
```bash
adb devices
```
检查设备是否在列表中

### 4. 权限问题
确保在 AndroidManifest.xml 中添加了必要的权限(已添加)

## 调试建议

- 开启 Metro 服务器: `npx react-native start`
- 查看日志: `adb logcat`
- 热重载: 在应用中按两次 R
- 菜单: 在应用中按两次 M
