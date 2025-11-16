import './Auth.css';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../../Modules/Services/authService';
import { ArrowLeft, Eye, EyeOff, User, Lock } from 'lucide-react';

const UsernameLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        setError('');
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim()) {
            setError('Введите логин');
            return;
        }

        if (!password || password.length < 5) {
            setError('Пароль должен содержать минимум 5 символов');
            return;
        }

        setLoading(true);
        try {
            await authService.loginWithUsername(username, password);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Неверный логин или пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Auth--Container">
            <button 
                className="Auth--BackButton" 
                onClick={() => navigate('/firstlogin')}
                type="button"
            >
                <ArrowLeft size={20} />
            </button>

            <form className="Auth--Form" onSubmit={handleSubmit}>
                <h1 className="Auth--FormTitle">Вход по логину</h1>

                <div className="Auth--InputGroup">
                    <label className="Auth--InputLabel">Логин</label>
                    <div className="Auth--InputWrapper">
                        <User className="Auth--InputIcon" size={20} />
                        <input
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder="Введите логин"
                            className="Auth--Input"
                            required
                            disabled={loading}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="Auth--InputGroup">
                    <label className="Auth--InputLabel">Пароль</label>
                    <div className="Auth--InputWrapper" style={{ position: 'relative' }}>
                        <Lock className="Auth--InputIcon" size={20} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Введите пароль"
                            className="Auth--Input"
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

                {error && <div className="Auth--Error">{error}</div>}
                
                <button type="submit" className="Auth--Button" disabled={loading}>
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>
        </div>
    );
};

export default UsernameLoginPage;

