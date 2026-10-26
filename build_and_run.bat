@echo off
title Build ^& Run Sachin Portfolio
color 0b

echo ============================================================
echo   FULL BUILD: Sync + Maven Build + Launch
echo ============================================================
echo.

:: Step 0: Free port 8080 and stop any lingering backend instances to release file locks
echo [STEP 0] Checking and releasing backend process locks...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Get-NetTCPConnection -LocalPort 8080 -ErrorAction Stop | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } } catch {}; try { Get-CimInstance Win32_Process -ErrorAction Stop | Where-Object { $_.CommandLine -like '*portfolio-backend*' -or $_.CommandLine -like '*PortfolioApplication*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } } catch {}; exit 0"
ping -n 2 127.0.0.1 >nul

:: Step 1: Sync frontend files
echo.
echo [STEP 1] Syncing frontend to static resources...
call sync_frontend.bat
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Sync failed!
    pause
    exit /b 1
)

:: Step 2: Find Maven
set MVN_CMD=
where mvn >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set MVN_CMD=mvn
) else if exist "%USERPROFILE%\maven\apache-maven-3.9.6\bin\mvn.cmd" (
    set MVN_CMD=%USERPROFILE%\maven\apache-maven-3.9.6\bin\mvn.cmd
) else if exist "C:\Program Files\Apache\Maven\bin\mvn.cmd" (
    set MVN_CMD=C:\Program Files\Apache\Maven\bin\mvn.cmd
) else if exist "C:\maven\bin\mvn.cmd" (
    set MVN_CMD=C:\maven\bin\mvn.cmd
)

if "%MVN_CMD%"=="" (
    echo [ERROR] Maven not found! Please install Maven and add it to PATH.
    echo         Download: https://maven.apache.org/download.cgi
    pause
    exit /b 1
)

:: Step 3: Clean prior JAR artifacts to prevent Windows rename lock during repackage
echo.
echo [STEP 2] Building backend JAR...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$items = @('backend\target\portfolio-backend-1.0.0.jar', 'backend\target\portfolio-backend-1.0.0.jar.original'); foreach ($item in $items) { if (Test-Path $item) { for ($i=0; $i -lt 5; $i++) { try { [System.IO.File]::Delete($item); break } catch { Start-Sleep -Milliseconds 300 } } } }; exit 0"

call "%MVN_CMD%" -f backend\pom.xml package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo [WARN] Maven build encountered an error. Re-checking file locks and retrying...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Get-NetTCPConnection -LocalPort 8080 -ErrorAction Stop | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } } catch {}; try { Get-CimInstance Win32_Process -ErrorAction Stop | Where-Object { $_.CommandLine -like '*portfolio-backend*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } } catch {}; exit 0"
    ping -n 3 127.0.0.1 >nul
    if exist "backend\target\portfolio-backend-1.0.0.jar.original" del /f /q "backend\target\portfolio-backend-1.0.0.jar.original" >nul 2>&1
    if exist "backend\target\portfolio-backend-1.0.0.jar" del /f /q "backend\target\portfolio-backend-1.0.0.jar" >nul 2>&1
    call "%MVN_CMD%" -f backend\pom.xml package -DskipTests
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Maven build failed! Check errors above.
        pause
        exit /b 1
    )
)

:: Verify JAR exists and is an executable fat JAR (> 5MB)
if not exist "backend\target\portfolio-backend-1.0.0.jar" (
    echo [ERROR] Expected JAR not found at backend\target\portfolio-backend-1.0.0.jar!
    pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "if ((Get-Item 'backend\target\portfolio-backend-1.0.0.jar').Length -lt 5000000) { exit 1 } else { exit 0 }"
if %ERRORLEVEL% neq 0 (
    echo [WARN] JAR is thin archive. Running Spring Boot repackage...
    call "%MVN_CMD%" -f backend\pom.xml spring-boot:repackage
)

echo.
echo [STEP 3] Launching portfolio...
echo.
echo ============================================================
echo   Portfolio URL:     http://localhost:8080
echo   Admin Panel:       http://localhost:8080/admin
echo   Username:          sachin_admin
echo   Password:          Admin@2026!
echo ============================================================
echo.

start "" cmd /c "ping -n 6 127.0.0.1 >nul && start http://localhost:8080"
java -jar "backend\target\portfolio-backend-1.0.0.jar"
pause
