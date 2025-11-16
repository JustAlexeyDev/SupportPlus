import { useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../Services/authService';
import Cookies from "js-cookie";

export const useLogin = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^[0-9]+$/.test(value)) {
            setPassword(value);
            setError('');
        }
    };

    const validateForm = () => {
        if (password.length !== 5) {
            setError('Пин-код должен содержать 5 цифр');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = Cookies.get("email");
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await authService.login(email, password);
            navigate("/home");
        } catch (err) {
            setError(err.message || 'Неверный пароль');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        authService.initiateGoogleLogin();
    };

    return {
        password,
        loading,
        error,
        handlePasswordChange,
        handleSubmit,
        handleGoogleLogin
    };
};