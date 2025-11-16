import './Auth.css';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { authService } from '../../Modules/Services/authService';
import { categoryService } from '../../Modules/Services/categoryService';
import { useRegister } from '../../Modules/hooks/useRegister.js';
import {
    Mail,
    Lock,
    User,
    Phone,
    FileText,
    Eye,
    EyeOff,
    ArrowLeft
} from "lucide-react";

const RegisterPage = () => {
    const navigate = useNavigate();
    const {
        email,
        password,
        snils,
        setSnils,
        region,
        categories,
        selectedCategories,
        loading,
        error,
        handleEmailChange,
        handlePasswordChange,
        handleCategoryToggle,
        handleSubmit
    } = useRegister();

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const formatPhoneDisplay = (digits) => {
        if (!digits || digits.length === 0) return '';
        let cleanDigits = digits.replace(/^[78]/, '');
        if (cleanDigits.length === 0) return '';
        if (cleanDigits.length <= 3) return `+7(${cleanDigits}`;
        if (cleanDigits.length <= 6) return `+7(${cleanDigits.slice(0, 3)})-${cleanDigits.slice(3)}`;
        if (cleanDigits.length <= 8) return `+7(${cleanDigits.slice(0, 3)})-${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6)}`;
        return `+7(${cleanDigits.slice(0, 3)})-${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6, 8)}-${cleanDigits.slice(8, 10)}`;
    };

    const handlePhoneChange = (e) => {
        const inputValue = e.target.value;
        const digits = inputValue.replace(/\D/g, '');
        if (digits.length <= 11) {
            const cleanDigits = digits.startsWith('7') || digits.startsWith('8') 
                ? digits.slice(1) 
                : digits;
            if (cleanDigits.length <= 10) {
                setPhone(cleanDigits);
            }
        }
    };

    const formatSnilsDisplay = (value) => {
        const digits = value.replace(/\D/g, '');
        if (digits.length === 0) return '';
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 11)}`;
    };

    return(
        <div className="Auth--Container">
            <button 
                className="Auth--BackButton" 
                onClick={() => navigate('/firstlogin')}
                type="button"
            >
                <ArrowLeft size={20} />
            </button>

            <form className="Auth--Form" onSubmit={handleSubmit}>
                <h1 className="Auth--FormTitle">Регистрация</h1>

                <div className="Auth--InputGroup">
                    <label className="Auth--InputLabel">Полное имя</label>
                    <div className="Auth--InputWrapper">
                        <User className="Auth--InputIcon" size={20} />
                        <input 
                            type='text'
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Введите ваше полное имя"
                            className="Auth--Input"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="Auth--InputGroup">
                    <label className="Auth--InputLabel">Номер телефона</label>
                    <div className="Auth--InputWrapper">
                        <Phone className="Auth--InputIcon" size={20} />
                        <input 
                            type='tel'
                            value={formatPhoneDisplay(phone)}
                            onChange={handlePhoneChange}
                            placeholder="+7(999)-999-99-99"
                            className="Auth--Input"
                            required
                            disabled={loading}
                            maxLength={18}
                        />
                    </div>
                </div>

                <div className="Auth--InputGroup">
                    <label className="Auth--InputLabel">Адрес электронной почты</label>
                    <div className="Auth--InputWrapper">
                        <Mail className="Auth--InputIcon" size={20} />
                        <input 
                            type='email'
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="example@email.com"
                            className="Auth--Input"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="Auth--InputGroup">
                    <label className="Auth--InputLabel">ПИН-код</label>
                    <div className="Auth--InputWrapper" style={{ position: 'relative' }}>
                        <Lock className="Auth--InputIcon" size={20} />
                        <input 
                            type={showPassword ? 'text' : 'password'}
                            inputMode='numeric'
                            pattern='[0-9]*'
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Введите ПИН-код"
                            className="Auth--Input"
                            maxLength={5}
                            required
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="Auth--PasswordToggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="Auth--InputGroup">
                    <label className="Auth--InputLabel">СНИЛС</label>
                    <div className="Auth--InputWrapper">
                        <FileText className="Auth--InputIcon" size={20} />
                        <input 
                            type='text'
                            value={formatSnilsDisplay(snils)}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '');
                                if (digits.length <= 11) {
                                    setSnils(digits);
                                }
                            }}
                            placeholder="123 456 789 10"
                            className="Auth--Input"
                            disabled={loading}
                        />
                    </div>
                </div>
                
                {error && <div className="Auth--Error">{error}</div>}
                
                <button type="submit" className="Auth--Button" disabled={loading}>
                    {loading ? 'Регистрация...' : 'Регистрация'}
                </button>

                <div className="Auth--FooterLink">
                    Уже есть аккаунт? <Link to="/firstlogin">Войти</Link>
                </div>
            </form>
        </div>
    );
}
export default RegisterPage;