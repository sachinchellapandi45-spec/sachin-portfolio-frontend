@echo off
title Sync Frontend to Backend Static Resources
color 0a

echo ============================================================
echo   SYNC: Frontend files → Spring Boot Static Resources
echo ============================================================
echo.

set STATIC=backend\src\main\resources\static

echo [1/4] Syncing root files...
copy /Y "index.html"  "%STATIC%\index.html"  >nul
copy /Y "style.css"   "%STATIC%\style.css"   >nul
copy /Y "script.js"   "%STATIC%\script.js"   >nul
copy /Y "config.js"   "%STATIC%\config.js"   >nul
echo     index.html, style.css, script.js, config.js ✓

echo [2/4] Syncing admin HTML pages...
copy /Y "admin\dashboard.html"  "%STATIC%\admin\dashboard.html"  >nul
copy /Y "admin\contacts.html"   "%STATIC%\admin\contacts.html"   >nul
copy /Y "admin\projects.html"   "%STATIC%\admin\projects.html"   >nul
copy /Y "admin\skills.html"     "%STATIC%\admin\skills.html"     >nul
copy /Y "admin\visitors.html"   "%STATIC%\admin\visitors.html"   >nul
echo     All admin HTML pages ✓

echo [3/4] Syncing admin CSS...
copy /Y "admin\css\admin.css"   "%STATIC%\admin\css\admin.css"   >nul
echo     admin.css ✓

echo [4/4] Syncing admin JS files...
copy /Y "admin\js\api.js"        "%STATIC%\admin\js\api.js"        >nul
copy /Y "admin\js\contacts.js"   "%STATIC%\admin\js\contacts.js"   >nul
copy /Y "admin\js\dashboard.js"  "%STATIC%\admin\js\dashboard.js"  >nul
copy /Y "admin\js\projects.js"   "%STATIC%\admin\js\projects.js"   >nul
copy /Y "admin\js\skills.js"     "%STATIC%\admin\js\skills.js"     >nul
copy /Y "admin\js\visitors.js"   "%STATIC%\admin\js\visitors.js"   >nul
echo     All admin JS files ✓

echo.
echo ============================================================
echo   ✅ Sync complete! All frontend files updated.
echo   Run start_portfolio.bat to launch the server.
echo ============================================================
echo.
