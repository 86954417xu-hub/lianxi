@echo off
setlocal

REM 设置环境变量
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "PATH=C:\Program Files\Java\jdk-17\bin;C:\Program Files\nodejs;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\emulator;%PATH%"

echo 使用 React Native CLI 构建 Release APK...
echo.

cd /d "d:\ceshi\android\muyu"

REM 构建
call npx react-native build-android --mode=release

echo.
echo 构建完成！
pause
