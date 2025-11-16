import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { authService } from "./Modules/Services/authService";
import { userService } from "./Modules/Services/userService";
import { usePWA } from "./Modules/hooks/usePWA";

// import pages
import Home from "./Pages/Home/Home";
import LoginPage from "./Pages/Auth/LoginPage";
import RegisterPage from "./Pages/Auth/RegisterPage";
import OAuthCallback from "./Pages/Auth/OAuthCallback";
import FirstLogin from "./Pages/Auth/FirstLogin";
import PhoneLoginPage from "./Pages/Auth/PhoneLoginPage";
import UsernameLoginPage from "./Pages/Auth/UsernameLoginPage";
import PWAInstallPrompt from "./Components/PWAInstallPrompt/PWAInstallPrompt";

import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const { isStandalone } = usePWA();

    const checkAuthStatus = useCallback(async () => {
        const token = authService.getToken();
        
        if (!token) {
            setIsAuthenticated(false);
            return false;
        }

        try {
            await userService.getProfile();
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            authService.logout();
            setIsAuthenticated(false);
            return false;
        }
    }, []);

    useEffect(() => {
        checkAuthStatus().finally(() => {
            setLoading(false);
        });
    }, [checkAuthStatus]);

    useEffect(() => {
        const authPaths = ['/login', '/login/phone', '/login/username', '/register', '/firstlogin'];
        if (!loading && !authPaths.includes(location.pathname)) {
            checkAuthStatus();
        }
    }, [location.pathname, checkAuthStatus, loading]);


    if (loading) {
        return <div className="root">Loading...</div>;
    }

    const isAuthPage = ['/firstlogin', '/login', '/login/phone', '/login/username', '/register', '/auth/callback'].includes(location.pathname);

    return (
        // <div className={`App ${isStandalone ? 'standalone' : ''}`}>
            <div className="root">
                {!isAuthPage && <Header />}
                {/* <div className="main-content"> */}
                    <Routes>
                        <Route 
                            path="/firstlogin"
                            element={
                                !isAuthenticated ?
                                <FirstLogin /> :
                                <Navigate to="/home" replace />
                            }
                        />

                        <Route 
                            path="/login" 
                            element={
                                !isAuthenticated ? 
                                <FirstLogin /> : 
                                <Navigate to="/home" replace />
                            } 
                        />

                        <Route 
                            path="/login/phone" 
                            element={
                                !isAuthenticated ? 
                                <PhoneLoginPage /> : 
                                <Navigate to="/home" replace />
                            } 
                        />

                        <Route 
                            path="/login/username" 
                            element={
                                !isAuthenticated ? 
                                <UsernameLoginPage /> : 
                                <Navigate to="/home" replace />
                            } 
                        />
                        
                        <Route 
                            path="/register" 
                            element={
                                !isAuthenticated ? 
                                <RegisterPage /> : 
                                <Navigate to="/home" replace />
                            } 
                        />
                        
                        <Route 
                            path="/auth/callback" 
                            element={<OAuthCallback />} 
                        />
                        
                        <Route 
                            path="/home" 
                            element={
                                isAuthenticated ? 
                                <Home /> : 
                                <Navigate to="/login" replace />
                            } 
                        />
                        
                        <Route 
                            path="/" 
                            element={
                                isAuthenticated ? 
                                <Navigate to="/home" replace /> : 
                                <Navigate to="/login" replace />
                            } 
                        />
                        
                        <Route 
                            path="/*" 
                            element={
                                isAuthenticated ? 
                                <Home /> : 
                                <Navigate to="/login" replace />
                            } 
                        />
                    </Routes>
                    <PWAInstallPrompt />
                {/* </div> */}
                {!isAuthPage && <Footer />}
            </div>

        // </div>
    );
};

export default App;