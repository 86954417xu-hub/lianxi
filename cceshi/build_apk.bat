@echo off
setlocal enabledelayedexpansion

echo ========================================
echo 敲木鱼项目 - Release APK 构建
echo ========================================
echo.

REM 设置所有环境变量
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
if not exist "%ANDROID_HOME%" set "ANDROID_HOME=C:\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

echo 环境变量设置：
echo JAVA_HOME=%JAVA_HOME%
echo ANDROID_HOME=%ANDROID_HOME%
echo.

REM 验证环境
echo [验证] 检查环境...
java -version 2>&1 | findstr /i "version"
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
if not exist "build.gradle" (
    echo [错误] 找不到 build.gradle
    pause
    exit /b 1
)
echo [成功] Gradle 配置文件已找到
echo.

REM 清理
echo [1/3] 清理之前的构建...
set "CMD_DIR=%CD%"
call "%CMD_DIR%\gradlew.bat" clean --no-daemon
if errorlevel 1 (
    echo [错误] 清理失败！
    pause
    exit /b 1
)
echo 清理完成
echo.

REM 构建 Release APK
echo [2/3] 构建 Release APK...
call "%CMD_DIR%\gradlew.bat" assembleRelease --no-daemon
if errorlevel 1 (
    echo [错误] 构建失败！
    echo 请检查错误信息
    pause
    exit /b 1
)
echo 构建成功
echo.

REM 显示结果
echo [3/3] APK 文件位置...
set "APK_PATH=%CD%\app\build\outputs\apk\release\app-release.apk"
if exist "%APK_PATH%" (
    echo ========================================
    echo 构建成功！
    echo ========================================
    echo.
    echo APK 文件: %APK_PATH%
    dir "%APK_PATH%" | findstr "app-release"
    echo.

    REM 询问是否安装到设备
    echo 检测设备...
    adb devices
    echo.
    choice /C YN /M "是否安装到连接的设备？"
    if errorlevel 2 goto end
    if errorlevel 1 goto install

    :install
    echo 正在安装...
    adb install "%APK_PATH%"
    if errorlevel 1 (
        echo [错误] 安装失败
    ) else (
        echo [成功] 安装完成！
    )
) else (
    echo [错误] APK 文件未找到
)

:end
echo.
echo 按任意键退出...
pause >nul
