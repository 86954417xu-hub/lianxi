@echo off
setlocal enabledelayedexpansion

echo ========================================
echo 测试构建 - 验证Bug修复
echo ========================================
echo.

REM 设置环境变量
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
if not exist "%ANDROID_HOME%" set "ANDROID_HOME=C:\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

echo 环境变量：
echo JAVA_HOME=%JAVA_HOME%
echo ANDROID_HOME=%ANDROID_HOME%
echo.

REM 进入项目目录
cd /d "d:\cceshi\cceshi\android\muyu\android"
echo 当前目录: %CD%
echo.

REM 验证设置文件
if not exist "settings.gradle" (
    echo [错误] 找不到 settings.gradle
    pause
    exit /b 1
)
echo [成功] Gradle 配置文件已找到
echo.

echo 已修复的问题：
echo 1. 移除了未导入的 Sound.setCategory 调用
echo 2. 使用 SoundManager 替代直接调用 Vibration
echo 3. 修复了 useEffect 的依赖数组问题（闭包陷阱）
echo.

REM 构建 Release APK
echo [构建] 构建 Release APK...
set "CMD_DIR=%CD%"
call "%CMD_DIR%\gradlew.bat" assembleRelease --no-daemon
if errorlevel 1 (
    echo [错误] 构建失败！
    pause
    exit /b 1
)
echo 构建成功
echo.

REM 显示结果
echo [完成] APK 文件位置...
set "APK_PATH=%CD%\app\build\outputs\apk\release\app-release.apk"
if exist "%APK_PATH%" (
    echo ========================================
    echo 构建成功！
    echo ========================================
    echo 文件位置: %APK_PATH%
    dir "%APK_PATH%" | findstr "app-release"
    echo.
    echo Bug修复总结：
    echo ✓ 修复了 playWoodFishSound 函数未定义的问题
    echo ✓ 修复了 BackHandler useEffect 的闭包陷阱
    echo ✓ 集成了 SoundManager 进行音频管理
    echo.
) else (
    echo [错误] APK 文件未找到
)

echo 按任意键退出...
pause >nul
