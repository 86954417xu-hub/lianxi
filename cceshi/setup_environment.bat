@echo off
echo ========================================
echo 敲木鱼项目 - 环境配置和构建脚本
echo ========================================
echo.

REM 设置 Java 环境变量
echo [1/4] 设置 Java 环境变量...
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%PATH%;%JAVA_HOME%\bin

REM 验证 Java 安装
echo 正在验证 Java 安装...
java -version
if errorlevel 1 (
    echo [错误] Java 未正确安装！
    echo 请从 https://www.oracle.com/java/technologies/downloads/ 下载安装 JDK 17
    pause
    exit /b 1
)
echo Java 环境配置成功！
echo.

REM 设置 Android SDK 环境变量（请根据实际安装路径修改）
echo [2/4] 设置 Android SDK 环境变量...
REM 默认路径，如果不同请修改
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
if not exist "%ANDROID_HOME%" (
    set ANDROID_HOME=C:\Android\Sdk
    if not exist "%ANDROID_HOME%" (
        echo [警告] 未找到 Android SDK！
        echo 请安装 Android Studio 或下载 Android SDK 命令行工具
        echo 下载地址: https://developer.android.com/studio#command-tools
    )
)
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin

REM 验证 ADB
echo 正在验证 Android SDK...
adb version 2>nul
if errorlevel 1 (
    echo [警告] ADB 未找到，请确保 Android SDK 已正确安装
) else (
    echo Android SDK 环境配置成功！
)
echo.

REM 验证 Node.js
echo [3/4] 验证 Node.js 安装...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Node.js 未安装！
    echo 请从 https://nodejs.org/ 下载安装 Node.js LTS 版本
    pause
    exit /b 1
)
echo Node.js 版本:
node --version
echo npm 版本:
npm --version
echo Node.js 环境配置成功！
echo.

REM 进入项目目录
echo [4/4] 准备构建项目...
cd /d d:\ceshi\android\muyu
echo 当前目录: %CD%
echo.

echo ========================================
echo 环境配置完成！
echo ========================================
echo.
echo 现在可以执行以下操作：
echo   1. 安装依赖（如果需要）: npm install
echo   2. 构建Debug APK: cd android ^&^& gradlew.bat assembleDebug
echo   3. 构建Release APK: cd android ^&^& gradlew.bat assembleRelease
echo   4. 运行开发版本: npm run android
echo.

choice /C YN /M "是否立即构建 Release APK？"
if errorlevel 2 goto end
if errorlevel 1 goto build

:build
echo.
echo 开始构建 Release APK...
cd android
call gradlew.bat clean
call gradlew.bat assembleRelease
echo.
echo 构建完成！APK 文件位置:
echo %CD%\app\build\outputs\apk\release\app-release.apk
echo.

:end
echo 按任意键退出...
pause >nul
