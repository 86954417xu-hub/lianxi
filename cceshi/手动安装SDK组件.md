# Android SDK 组件安装指南

## 当前状态
✅ JDK 17 已安装
✅ Node.js v24.13.0 已安装
✅ Android SDK 基础框架已安装
❌ Android SDK 命令行工具缺失
❌ SDK 组件未安装

## 需要安装的组件

### 方案1：使用 Android Studio（推荐，最简单）

1. **安装 Android Studio**
   - 下载：https://developer.android.com/studio
   - 运行安装程序，选择 "Standard" 安装类型
   - 安装完成后，Android Studio 会自动下载所有必需的 SDK 组件

2. **验证安装**
   - 打开 Android Studio
   - 点击 "More Actions" → "SDK Manager"
   - 确认以下组件已安装：
     - Android 14.0 (API 34)
     - Android SDK Build-Tools 34.0.0
     - Android SDK Platform-Tools

### 方案2：手动下载 Command-line Tools

1. **下载 Command-line Tools**
   - 访问：https://developer.android.com/studio#command-tools
   - 下载 "Command line tools only" for Windows
   - 文件名：`commandlinetools-win-11076708_latest.zip`

2. **解压并安装**
   ```powershell
   # 在 PowerShell 中运行
   $ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
   # 创建目录
   New-Item -ItemType Directory -Force -Path "$ANDROID_HOME\cmdline-tools\latest"
   # 解压文件
   Expand-Archive -Path "下载路径\commandlinetools-win-11076708_latest.zip" -DestinationPath "$ANDROID_HOME\cmdline-tools\latest"
   ```

3. **安装 SDK 组件**
   ```powershell
   cd $ANDROID_HOME\cmdline-tools\latest\bin
   # 接受许可协议
   ./sdkmanager --licenses
   # 安装必需组件
   ./sdkmanager "build-tools;34.0.0" "platforms;android-34" "platform-tools" "ndk;25.1.8937393"
   ```

## 快速安装步骤

### 方法1：使用 Android Studio GUI（最简单）

1. 安装 Android Studio
2. 首次启动选择 "Standard"
3. 等待自动下载完成
4. 完成！

### 方法2：使用命令行（需要先下载 Command-line Tools）

运行以下 PowerShell 脚本：

```powershell
# 设置路径
$ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$TOOL_ZIP = "$env:USERPROFILE\Downloads\commandlinetools-win-11076708_latest.zip"

# 1. 创建目录
Write-Host "创建目录..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$ANDROID_HOME\cmdline-tools\latest"

# 2. 解压文件
Write-Host "解压文件..." -ForegroundColor Yellow
Expand-Archive -Path $TOOL_ZIP -DestinationPath "$ANDROID_HOME\cmdline-tools\latest" -Force

# 3. 接受许可
Write-Host "接受许可协议..." -ForegroundColor Yellow
& "$ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --licenses

# 4. 安装组件
Write-Host "安装 SDK 组件..." -ForegroundColor Yellow
& "$ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" `
    "build-tools;34.0.0" `
    "platforms;android-34" `
    "platform-tools" `
    "ndk;25.1.8937393"

Write-Host "安装完成！" -ForegroundColor Green
```

## 验证安装

安装完成后，运行：

```powershell
# 设置环境变量
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin"

# 验证
java -version
node --version
adb --version
```

## 安装完成后

运行构建脚本：

```powershell
d:\ceshi\build_release.bat
```

## 常见问题

### Q: Command-line Tools 安装后 sdkmanager 命令无效
A: 确保文件夹结构正确，应该是：
```
ANDROID_HOME/
  └── cmdline-tools/
      └── latest/
          ├── bin/
          ├── lib/
          └── ...
```

### Q: sdkmanager 提示找不到 Java
A: 设置 JAVA_HOME 环境变量：
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```

### Q: 组件下载很慢
A: 配置国内镜像（在 $HOME/.gradle/init.gradle 中）：
```gradle
allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/jcenter' }
        maven { url 'https://maven.aliyun.com/repository/public' }
    }
}
```
