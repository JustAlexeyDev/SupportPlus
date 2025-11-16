import './Auth.css';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../../Modules/Services/authService';
import { ArrowLeft, Phone, Lock } from 'lucide-react';

const PhoneLoginPage = () => {
    const [phone, setPhone] = useState('');
    const [smsCode, setSmsCode] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' or 'code'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [receivedCode, setReceivedCode] = useState('');
    const navigate = useNavigate();

    // Форматирование номера телефона с маской +7(999)-999-99-99
    const formatPhoneDisplay = (digits) => {
        if (!digits || digits.length === 0) return '';
        
        // Убираем первую 7 или 8, если есть, так как маска уже содержит +7
        let cleanDigits = digits.replace(/^[78]/, '');
        
        if (cleanDigits.length === 0) return '';
        if (cleanDigits.length <= 3) return `+7(${cleanDigits}`;
        if (cleanDigits.length <= 6) return `+7(${cleanDigits.slice(0, 3)})-${cleanDigits.slice(3)}`;
        if (cleanDigits.length <= 8) return `+7(${cleanDigits.slice(0, 3)})-${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6)}`;
        return `+7(${cleanDigits.slice(0, 3)})-${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6, 8)}-${cleanDigits.slice(8, 10)}`;
    };

    // Получение только цифр из номера
    const getPhoneDigits = (value) => {
        return value.replace(/\D/g, '');
    };

    const handlePhoneChange = (e) => {
        const inputValue = e.target.value;
        const digits = getPhoneDigits(inputValue);
        
        // Ограничиваем до 10 цифр (без +7)
        if (digits.length <= 11) {
            // Если начинается с 7 или 8, убираем первую цифру
            const cleanDigits = digits.startsWith('7') || digits.startsWith('8') 
                ? digits.slice(1) 
                : digits;
            
            if (cleanDigits.length <= 10) {
                setPhone(cleanDigits);
                setError('');
            }
        }
    };

    const formatPhone = (phone) => {
        if (!phone) return '';
        // Всегда возвращаем в формате +7XXXXXXXXXX
        return `+7${phone}`;
    };

    const handleRequestSms = async (e) => {
        e.preventDefault();
        setError('');

        if (phone.length < 10) {
            setError('Введите корректный номер телефона (10 цифр)');
            return;
        }

        setLoading(true);
        try {
            const formattedPhone = formatPhone(phone);
            const response = await authService.requestSmsCode(formattedPhone);
            setReceivedCode(response.code); // In stub mode, code is returned
            setStep('code');
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Ошибка при отправке SMS');
        } finally {
            setLoading(false);
        }
    };

    const handleSmsCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 5) {
            setSmsCode(value);
            setError('');
        }
    };

    const handleVerifySms = async (e) => {
        e.preventDefault();
        setError('');

        if (smsCode.length !== 5) {
            setError('Введите 5-значный код');
            return;
        }

        setLoading(true);
        try {
            const formattedPhone = formatPhone(phone);
            await authService.verifySmsCode(formattedPhone, smsCode);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Неверный код');
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

            <form className="Auth--Form" onSubmit={step === 'phone' ? handleRequestSms : handleVerifySms}>
                <h1 className="Auth--FormTitle">Вход по номеру телефона</h1>

                {step === 'phone' ? (
                    <>
                        <div className="Auth--InputGroup">
                            <label className="Auth--InputLabel">Номер телефона</label>
                            <div className="Auth--InputWrapper">
                                <Phone className="Auth--InputIcon" size={20} />
                                <input
                                    type="tel"
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
                        {error && <div className="Auth--Error">{error}</div>}
                        <button type="submit" className="Auth--Button" disabled={loading}>
                            {loading ? 'Отправка...' : 'Получить код'}
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666666' }}>
                            <p>Код отправлен на номер</p>
                            <p style={{ fontWeight: 'bold', color: '#000000', marginTop: '4px' }}>{formatPhoneDisplay(phone)}</p>
                            {receivedCode && (
                                <p style={{ fontSize: '12px', color: '#4CAF50', marginTop: '10px' }}>
                                    (Заглушка: код {receivedCode})
                                </p>
                            )}
                        </div>
                        <div className="Auth--InputGroup">
                            <label className="Auth--InputLabel">Код подтверждения</label>
                            <div className="Auth--InputWrapper">
                                <Lock className="Auth--InputIcon" size={20} />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={5}
                                    value={smsCode}
                                    onChange={handleSmsCodeChange}
                                    placeholder="Введите 5-значный код"
                                    className="Auth--Input"
                                    required
                                    disabled={loading}
                                    autoFocus
                                    style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '18px' }}
                                />
                            </div>
                        </div>
                        {error && <div className="Auth--Error">{error}</div>}
                        <button type="submit" className="Auth--Button" disabled={loading}>
                            {loading ? 'Проверка...' : 'Войти'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setStep('phone');
                                setSmsCode('');
                                setError('');
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#4CAF50', cursor: 'pointer', textDecoration: 'underline', marginTop: '-8px' }}
                        >
                            Изменить номер
                        </button>
                    </>
                )}
            </form>
        </div>
    );
};

export default PhoneLoginPage;

