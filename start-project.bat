@echo off
echo Starting Kisan Kart Connect with Smart Fallback System...
echo Project will open in your default browser at http://localhost:5173
echo.
echo SIGNUP FULLY FIXED! Features:
echo - Cross-browser compatible UUID generation
echo - If Supabase is available: Uses real backend
echo - If Supabase fails: Uses offline mock authentication  
echo - Either way, you can sign up and test the app!
echo.
echo Available pages:
echo - Home: http://localhost:5173/
echo - Authentication: http://localhost:5173/auth  
echo - Test Page: http://localhost:5173/test (test connection)
echo.
echo Press Ctrl+C to stop the server
echo.
npm run dev
pause
