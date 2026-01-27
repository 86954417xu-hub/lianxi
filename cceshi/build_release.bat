@echo off
echo ========================================
echo 敲木鱼项目 - Release APK 构建脚本
echo ========================================
echo.

REM 设置环境变量
set JAVA_HOME=C:\Program Files\Java\jdk-17
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
if not exist "%ANDROID_HOME%" set ANDROID_HOME=C:\Android\Sdk
set PATH=%PATH%;%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin

REM 进入 Android 目录
cd /d d:\ceshi\android\muyu\android

REM 清理之前的构建
echo [1/3] 清理之前的构建...
call gradlew.bat clean
if errorlevel 1 (
    echo [错误] 清理失败！
    pause
    exit /b 1
)
echo 清理完成！
echo.

REM 构建 Release APK
echo [2/3] 构建 Release APK...
call gradlew.bat assembleRelease
if errorlevel 1 (
    echo [错误] 构建失败！
    echo 请检查环境配置和依赖是否正确安装
    pause
    exit /b 1
)
echo 构建成功！
echo.

REM 显示 APK 位置
echo [3/3] APK 文件信息...
set APK_PATH=%CD%\app\build\outputs\apk\release\app-release.apk
if exist "%APK_PATH%" (
    echo ========================================
    echo Release APK 构建成功！
    echo ========================================
    echo 文件位置: %APK_PATH%
    echo.
    dir "%APK_PATH%" | findstr "app-release"
    echo.

    choice /C YN /M "是否立即安装到连接的设备？"
    if errorlevel 2 goto end
    if errorlevel 1 goto install

    :install
    echo.
    echo 正在检查设备...
    adb devices
    echo.
    echo 正在安装 APK...
    adb install "%APK_PATH%"
    if errorlevel 1 (
        echo [错误] 安装失败！请确保设备已连接并开启 USB 调试
    ) else (
        echo 安装成功！
    )
) else (
    echo [错误] APK 文件未找到！
)
echo.

:end
echo 按任意键退出...
pause >nul
