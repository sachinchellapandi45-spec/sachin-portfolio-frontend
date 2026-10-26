@echo off
title Sachin Portfolio - Full Stack Application
color 0b

echo ========================================================
echo         C. SACHIN - JAVA FULL STACK PORTFOLIO
echo ========================================================
echo.

:: ── Check Java ────────────────────────────────────────────
java -version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Java is not installed or not in PATH!
    echo Please install JDK 21 or later from https://adoptium.net/
    pause
    exit /b 1
)
echo [OK] Java found.

:: ── Check MySQL ────────────────────────────────────────────
mysql --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] MySQL found in PATH.
) else if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    echo [OK] MySQL Server 8.0 found.
) else (
    echo [INFO] Make sure MySQL is running on port 3306.
)

:: ── Locate Maven (mvn) ─────────────────────────────────────
set MVN_CMD=
where mvn >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set MVN_CMD=mvn
    echo [OK] Maven found in PATH.
) else (
    :: Check common install paths
    if exist "%USERPROFILE%\maven\apache-maven-3.9.6\bin\mvn.cmd" (
        set MVN_CMD=%USERPROFILE%\maven\apache-maven-3.9.6\bin\mvn.cmd
        echo [OK] Maven found at %MVN_CMD%
    ) else if exist "C:\Program Files\Apache\Maven\bin\mvn.cmd" (
        set MVN_CMD=C:\Program Files\Apache\Maven\bin\mvn.cmd
        echo [OK] Maven found at %MVN_CMD%
    ) else if exist "C:\maven\bin\mvn.cmd" (
        set MVN_CMD=C:\maven\bin\mvn.cmd
        echo [OK] Maven found at %MVN_CMD%
    ) else if exist "%USERPROFILE%\.m2\wrapper\dists" (
        echo [INFO] Using Maven wrapper...
        set MVN_CMD=backend\mvnw
    )
)

:: ── Free Port 8080 & Process Locks ──────────────────────────
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Get-NetTCPConnection -LocalPort 8080 -ErrorAction Stop | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } } catch {}; exit 0"

:: ── Build JAR if not present or incomplete ──────────────────
set NEED_BUILD=0
if not exist "backend\target\portfolio-backend-1.0.0.jar" (
    set NEED_BUILD=1
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "if ((Get-Item 'backend\target\portfolio-backend-1.0.0.jar').Length -lt 5000000) { exit 1 } else { exit 0 }"
    if errorlevel 1 set NEED_BUILD=1
)

if %NEED_BUILD% equ 1 (
    if "%MVN_CMD%"=="" (
        echo [ERROR] JAR not built and Maven not found!
        echo Please install Maven from https://maven.apache.org/download.cgi
        echo Or add Maven to your PATH and re-run this script.
        pause
        exit /b 1
    )
    echo [INFO] Building backend JAR with Maven...
    echo [INFO] This may take a minute or two...
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$items = @('backend\target\portfolio-backend-1.0.0.jar', 'backend\target\portfolio-backend-1.0.0.jar.original'); foreach ($item in $items) { if (Test-Path $item) { try { [System.IO.File]::Delete($item) } catch {} } }; exit 0"
    call "%MVN_CMD%" -f backend\pom.xml package -DskipTests
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Maven build failed! Check the output above for errors.
        pause
        exit /b 1
    )
    echo [OK] Backend JAR built successfully!
) else (
    echo [OK] Backend JAR found and validated.
)

echo.
echo ========================================================
echo   Portfolio URL:     http://localhost:8080
echo   Admin Panel:       http://localhost:8080/admin
echo   Username:          sachin_admin
echo   Password:          Admin@2026!
echo.
echo   API Docs:          http://localhost:8080/api/skills
echo   Health Check:      http://localhost:8080/actuator/health
echo ========================================================
echo.
echo [INFO] Starting Spring Boot server...
echo [INFO] Press Ctrl+C to stop the server.
echo.

:: Open browser after 5 seconds
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:8080"

:: Run the JAR (uses local dev profile = application.properties)
java -jar "backend\target\portfolio-backend-1.0.0.jar"
pause
