import './Auth.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../../Modules/Services/authService';
import { categoryService } from '../../Modules/Services/categoryService';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^[0-9]+$/.test(value)) {
            setConfirmPassword(value);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError('Пин-код не совпадают');
            return;
        }

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
            await authService.register({
                email,
                pinCode: password,
                snils: snils || undefined,
                region: region || undefined,
                beneficiaryCategoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
            });
            navigate("/login");
        } catch (err) {
            setError(err.message || 'Ошибка регистрации. Попробуйте еще раз.');
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="Auth--Container">
            <form className="Auth--Content" onSubmit={handleSubmit} style={{ maxWidth: '400px', width: '90%' }}>
                <h1>Регистрация</h1>
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
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Пин-код (5 цифр)"
                    className="Auth--Input"
                    maxLength={5}
                    required
                    disabled={loading}
                />
                <input 
                    type='password'
                    inputMode='numeric'
                    pattern='[0-9]*'
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Подтвердите пин-код"
                    className="Auth--Input"
                    maxLength={5}
                    required
                    disabled={loading}
                />
                <input 
                    type='text'
                    value={snils}
                    onChange={(e => setSnils(e.target.value))}
                    placeholder="СНИЛС (необязательно)"
                    className="Auth--Input"
                    disabled={loading}
                />
                <input 
                    type='text'
                    value={region}
                    onChange={(e => setRegion(e.target.value))}
                    placeholder="Регион (необязательно)"
                    className="Auth--Input"
                    disabled={loading}
                />
                
                {categories.length > 0 && (
                    <div style={{ width: '100%', marginTop: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                            Льготные категории (необязательно):
                        </label>
                        {categories.map(cat => (
                            <label key={cat.id} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat.id)}
                                    onChange={() => handleCategoryToggle(cat.id)}
                                    disabled={loading}
                                    style={{ marginRight: '8px' }}
                                />
                                {cat.name}
                            </label>
                        ))}
                    </div>
                )}
                
                {error && <div style={{ color: 'red', fontSize: '14px', marginTop: '10px' }}>{error}</div>}
                <button type="submit" className="Auth--Button" disabled={loading}>
                    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
            </form>
        </div>
    );
}
export default RegisterPage;