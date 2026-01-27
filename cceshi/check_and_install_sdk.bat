@echo off
setlocal enabledelayedexpansion

echo ========================================
echo 检查并安装 Android SDK 组件
echo ========================================
echo.

set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
echo Android SDK 路径: %ANDROID_HOME%
echo.

REM 设置 PATH
set "PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\emulator;%PATH%"

echo [1/6] 检查 SDK Manager...
if exist "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" (
    echo [成功] SDK Manager 已找到
    set SDKMANAGER=%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat
) else if exist "%ANDROID_HOME%\cmdline-tools\bin\sdkmanager.bat" (
    echo [找到] SDK Manager 在 cmd line-tools\bin
    set SDKMANAGER=%ANDROID_HOME%\cmdline-tools\bin\sdkmanager.bat
) else if exist "%ANDROID_HOME%\tools\bin\sdkmanager.bat" (
    echo [找到] SDK Manager 在 tools\bin
    set SDKMANAGER=%ANDROID_HOME%\tools\bin\sdkmanager.bat
) else (
    echo [错误] 未找到 SDK Manager！
    echo.
    echo 请先安装 Android Command-line Tools：
    echo 1. 下载: https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip
    echo 2. 解压到: %ANDROID_HOME%\cmdline-tools\latest\
    echo    (确保文件夹结构是: cmdline-tools\latest\bin\sdkmanager.bat)
    pause
    exit /b 1
)

echo SDK Manager: %SDKMANAGER%
echo.

echo [2/6] 检查已安装的 SDK 组件...
"%SDKMANAGER%" --list_installed 2>&1 | findstr /i "build-tools platforms platform-tools"
echo.

echo [3/6] 检查必需的组件...
set MISSING_COMPONENTS=0

if not exist "%ANDROID_HOME%\build-tools\34.0.0" (
    echo [缺失] Android SDK Build-Tools 34.0.0
    set MISSING_COMPONENTS=1
)

if not exist "%ANDROID_HOME%\platforms\android-34" (
    echo [缺失] Android SDK Platform 34
    set MISSING_COMPONENTS=1
)

if not exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    echo [缺失] Platform-Tools
    set MISSING_COMPONENTS=1
)

if %MISSING_COMPONENTS%==0 (
    echo [成功] 所有必需组件已安装
    echo.
    goto verify
)

echo.
echo [4/6] 安装缺失的组件...
echo 正在安装以下组件:
echo   - Android SDK Build-Tools 34.0.0
echo   - Android SDK Platform 34
echo   - Platform-Tools
echo.
echo 注意：首次运行需要接受许可协议
echo.

"%SDKMANAGER%" "build-tools;34.0.0" "platforms;android-34" "platform-tools"
if errorlevel 1 (
    echo [错误] 安装失败！
    echo 请尝试手动运行以下命令：
    echo "%SDKMANAGER%" "build-tools;34.0.0" "platforms;android-34" "platform-tools"
    pause
    exit /b 1
)

echo.
echo [成功] SDK 组件安装完成！
echo.

:verify
echo [5/6] 验证安装...
if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    echo [成功] ADB 已安装
    "%ANDROID_HOME%\platform-tools\adb.exe" --version 2>&1 | findstr /i "version"
) else (
    echo [错误] ADB 仍然未找到
)

if exist "%ANDROID_HOME%\build-tools\34.0.0" (
    echo [成功] Build-Tools 34.0.0 已安装
) else (
    echo [警告] Build-Tools 34.0.0 未找到
)

if exist "%ANDROID_HOME%\platforms\android-34" (
    echo [成功] Platform android-34 已安装
) else (
    echo [警告] Platform android-34 未找到
)

echo.
echo [6/6] 检查其他必需组件...

REM 检查 NDK
if exist "%ANDROID_HOME%\ndk\" (
    echo [成功] NDK 已安装
    dir "%ANDROID_HOME%\ndk\" /b
) else (
    echo [可选] NDK 未安装 (React Native 需要)
    echo 如需安装，运行: "%SDKMANAGER%" "ndk;25.1.8937393"
)

REM 检查 CMake
if exist "%ANDROID_HOME%\cmake\" (
    echo [成功] CMake 已安装
) else (
    echo [可选] CMake 未安装
    echo 如需安装，运行: "%SDKMANAGER%" "cmake"
)

echo.
echo ========================================
echo 检查完成！
echo ========================================
echo.
echo 现在可以构建项目了！
echo 运行: d:\ceshi\build_release.bat
echo.
pause
