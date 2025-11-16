import './Auth.css';
import { useLogin } from "../../Modules/hooks/useLogin.js";
import KeyboardComponent from './Components/keyboard.components';

const LoginPage = () => {
    const {
        password,
        loading,
        error,
        handlePasswordChange,
        handleSubmit,
        handleGoogleLogin
    } = useLogin();

    return(
        <div className="Auth--Container">
            <form className="Auth--Content" onSubmit={handleSubmit}>
                <h1>Вход</h1>
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
                <KeyboardComponent />
                {error && <div style={{ color: 'red', fontSize: '14px' }}>{error}</div>}
                <button type="submit" className="Auth--Button" disabled={loading}>
                    {loading ? 'Вход...' : 'Войти'}
                </button>
                <button 
                    type="button" 
                    className="Auth--Button" 
                    onClick={handleGoogleLogin}
                    style={{ marginTop: '10px', backgroundColor: '#4285f4' }}
                >
                    Войти через Google
                </button>
            </form>
        </div>
    );
}
export default LoginPage;