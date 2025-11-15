import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { authService } from "./Modules/Services/authService";
import { userService } from "./Modules/Services/userService";

// import pages
import Home from "./Pages/Home/Home";
import LoginPage from "./Pages/Auth/LoginPage";
import RegisterPage from "./Pages/Auth/RegisterPage";
import OAuthCallback from "./Pages/Auth/OAuthCallback";

import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // Check authentication status by verifying token
    const checkAuthStatus = useCallback(async () => {
        const token = authService.getToken();
        
        if (!token) {
            setIsAuthenticated(false);
            return false;
        }

        // Verify token by trying to get user profile
        try {
            await userService.getProfile();
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            // Token is invalid, clear it
            authService.logout();
            setIsAuthenticated(false);
            return false;
        }
    }, []);

    // Initialize auth status on mount
    useEffect(() => {
        checkAuthStatus().finally(() => {
            setLoading(false);
        });
    }, [checkAuthStatus]);

    // Re-check auth status when route changes
    useEffect(() => {
        if (!loading && location.pathname !== '/login' && location.pathname !== '/register') {
            checkAuthStatus();
        }
    }, [location.pathname, checkAuthStatus, loading]);


    if (loading) {
        return <div className="root">Loading...</div>;
    }

    return (
        <div className="root">
            <Header />
            <main className="main-content">
                <Routes>
                    <Route 
                        path="/login" 
                        element={
                            !isAuthenticated ? 
                            <LoginPage /> : 
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
            </main>
            <Footer />
        </div>
    );
};

export default App;