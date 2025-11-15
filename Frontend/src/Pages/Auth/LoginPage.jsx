import './Auth.css';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../../Modules/Services/authService';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (password.length !== 5) {
            setError('Пин-код должен содержать 5 цифр');
            return;
        }

        if (!email) {
            setError('Введите email');
            return;
        }

        setLoading(true);
        try {
            await authService.login(email, password);
            navigate("/home");
        } catch (err) {
            setError(err.message || 'Неверный email или пароль');
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="Auth--Container">
            <form className="Auth--Content" onSubmit={handleSubmit}>
                <h1>Вход</h1>
                <input 
                    type='email'
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Email"
                    className="Auth--Input"
                    required
                    disabled={loading}
                />
                <input 
                    type='password'
                    inputMode='numeric'
                    pattern='[0-9]*'
                    maxLength={5}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Пин-код (5 цифр)"
                    className="Auth--PasswordInput"
                    required
                    disabled={loading}
                />
                {error && <div style={{ color: 'red', fontSize: '14px' }}>{error}</div>}
                <button type="submit" className="Auth--Button" disabled={loading}>
                    {loading ? 'Вход...' : 'Войти'}
                </button>
                <button 
                    type="button" 
                    className="Auth--Button" 
                    onClick={() => authService.initiateGoogleLogin()}
                    style={{ marginTop: '10px', backgroundColor: '#4285f4' }}
                >
                    Войти через Google
                </button>
            </form>
        </div>
    );
}
export default LoginPage;