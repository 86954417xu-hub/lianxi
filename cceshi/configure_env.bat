@echo off
setlocal enabledelayedexpansion

echo ========================================
echo 配置环境变量 - 敲木鱼项目
echo ========================================
echo.

REM 检查是否以管理员身份运行
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [警告] 建议以管理员身份运行以设置永久环境变量
    echo 当前会话仍可正常使用
    echo.
)

REM 设置 Java 环境变量
echo [1/4] 配置 Java 环境变量...
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
echo JAVA_HOME: %JAVA_HOME%

REM 设置 Node.js 环境变量
echo [2/4] 配置 Node.js 环境变量...
set "NODE_HOME=C:\Program Files\nodejs"
echo NODE_HOME: %NODE_HOME%

REM 设置 Android SDK 环境变量
echo [3/4] 配置 Android SDK 环境变量...
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
echo ANDROID_HOME: %ANDROID_HOME%

REM 设置 PATH
echo [4/4] 更新 PATH 环境变量...
set "PATH=%JAVA_HOME%\bin;%NODE_HOME%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\emulator;%PATH%"

REM 尝试设置永久环境变量（需要管理员权限）
echo.
echo 尝试设置永久环境变量...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v JAVA_HOME /t REG_SZ /d "%JAVA_HOME%" /f 2>nul
if %errorLevel% equ 0 (
    echo [成功] JAVA_HOME 已永久设置
) else (
    echo [跳过] JAVA_HOME 需要管理员权限永久设置（当前会话可用）
)

reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v ANDROID_HOME /t REG_SZ /d "%ANDROID_HOME%" /f 2>nul
if %errorLevel% equ 0 (
    echo [成功] ANDROID_HOME 已永久设置
) else (
    echo [跳过] ANDROID_HOME 需要管理员权限永久设置（当前会话可用）
)

reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH /t REG_EXPAND_SZ /d "%PATH%" /f 2>nul
if %errorLevel% equ 0 (
    echo [成功] PATH 已永久设置
) else (
    echo [跳过] PATH 需要管理员权限永久设置（当前会话可用）
)

echo.
echo ========================================
echo 环境变量配置完成！
echo ========================================
echo.
echo 验证安装...
echo.

echo [Java]
"%JAVA_HOME%\bin\java.exe" -version 2>&1 | findstr /i "version"
if errorlevel 1 (
    echo [错误] Java 验证失败
) else (
    echo [成功] Java 已配置
)

echo.
echo [Node.js]
"%NODE_HOME%\node.exe" --version
if errorlevel 1 (
    echo [错误] Node.js 验证失败
) else (
    echo [成功] Node.js 已配置
)

"%NODE_HOME%\npm.cmd" --version
if errorlevel 1 (
    echo [错误] npm 验证失败
) else (
    echo [成功] npm 已配置
)

echo.
echo [Android SDK]
"%ANDROID_HOME%\platform-tools\adb.exe" --version 2>&1 | findstr /i "version"
if errorlevel 1 (
    echo [警告] ADB 未找到，请确保已安装 Platform-Tools
) else (
    echo [成功] ADB 已配置
)

echo.
echo ========================================
echo 当前环境变量：
echo ========================================
echo JAVA_HOME=%JAVA_HOME%
echo NODE_HOME=%NODE_HOME%
echo ANDROID_HOME=%ANDROID_HOME%
echo.
echo PATH=%PATH%
echo.

echo 环境配置完成！
echo 注意：如果以非管理员身份运行，请重启终端使环境变量生效
echo 或者以管理员身份运行此脚本进行永久配置
pause
