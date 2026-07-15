@echo on
chcp 65001 > nul
cd /d "%~dp0"

echo.
echo === Step 1: Current folder ===
cd
pause

echo.
echo === Step 2: Check git ===
where git
git --version
pause

echo.
echo === Step 3: Remove stale lock if exists ===
if exist ".git\index.lock" (
    echo Found stale lock, removing...
    del /f /q ".git\index.lock"
    if exist ".git\index.lock" (
        echo WARNING: lock file still exists. May need manual removal.
    ) else (
        echo Lock removed.
    )
) else (
    echo No stale lock. Good.
)
pause

echo.
echo === Step 4: git status ===
git status
pause

echo.
echo === Step 5: git add yojijukugo.json ===
git add src/data/gendaibun/questions_yojijukugo.json
echo Exit code: %errorlevel%
pause

echo.
echo === Step 6: git commit ===
git commit -m "Update yojijukugo: 50 to 80 questions"
echo Exit code: %errorlevel%
pause

echo.
echo === Step 7: git push ===
git push origin main
echo Exit code: %errorlevel%
pause

echo.
echo === All done ===
pause
