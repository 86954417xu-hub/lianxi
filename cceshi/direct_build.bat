@echo off
setlocal

echo ========================================
echo 直接构建 Release APK
echo ========================================
echo.

REM 设置环境变量
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "PATH=C:\Program Files\Java\jdk-17\bin;C:\Program Files\nodejs;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

echo 环境变量：
echo JAVA_HOME=%JAVA_HOME%
echo ANDROID_HOME=%ANDROID_HOME%
echo.

REM 进入正确的目录
cd /d "d:\ceshi\android\muyu\android"
echo 当前工作目录: %CD%
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
echo [1/3] 清理构建...
set "CMD_DIR=%CD%"
call "%CMD_DIR%\gradlew.bat" clean --no-daemon
if errorlevel 1 (
    echo [错误] 清理失败
    pause
    exit /b 1
)
echo 清理完成
echo.

REM 构建
echo [2/3] 构建 Release APK...
call "%CMD_DIR%\gradlew.bat" assembleRelease --no-daemon --no-build-cache
if errorlevel 1 (
    echo [错误] 构建失败
    pause
    exit /b 1
)
echo 构建完成
echo.

REM 检查输出
echo [3/3] 检查 APK 文件...
set "APK_PATH=%CD%\app\build\outputs\apk\release\app-release.apk"
if exist "%APK_PATH%" (
    echo ========================================
    echo [成功] APK 构建成功！
    echo ========================================
    echo 文件位置: %APK_PATH%
    dir "%APK_PATH%"
    echo.
    choice /C YN /M "是否安装到设备？"
    if errorlevel 2 goto end
    if errorlevel 1 (
        echo 正在安装...
        adb install "%APK_PATH%"
    )
) else (
    echo [错误] APK 文件未找到
    echo 请检查: %APK_PATH%
)
echo.

:end
pause
