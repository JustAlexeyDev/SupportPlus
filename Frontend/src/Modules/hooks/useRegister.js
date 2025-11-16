import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../Services/authService';
import { categoryService } from '../Services/categoryService';
import Cookies from "js-cookie";

export const useRegister = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [snils, setSnils] = useState('');
    const [region, setRegion] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        categoryService.getAllCategories()
            .then(data => setCategories(data))
            .catch(err => console.error('Failed to load categories:', err));
    }, []);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setError('');
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^[0-9]+$/.test(value)) {
            setPassword(value);
            setError('');
        }
    };

    const handleCategoryToggle = (categoryId) => {
        setSelectedCategories(prev => 
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const validateForm = () => {
        if (password.length !== 5) {
            setError('Пин-код должен содержать 5 цифр');
            return false;
        }

        if (!email) {
            setError('Введите email');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await authService.register({
                email,
                pinCode: password,
                snils: snils || undefined,
                region: region || undefined,
                beneficiaryCategoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
            });
            Cookies.set("email", email)
            navigate("/login");
        } catch (err) {
            setError(err.message || 'Ошибка регистрации. Попробуйте еще раз.');
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        snils,
        setSnils,
        region,
        setRegion,
        categories,
        selectedCategories,
        loading,
        error,
        handleEmailChange,
        handlePasswordChange,
        handleCategoryToggle,
        handleSubmit
    };
};