import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        
        if (token) {
            // Store token in cookie
            Cookies.set('access_token', token, { expires: 7 });
            // Redirect to home
            navigate('/home', { replace: true });
        } else {
            // No token, redirect to login
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div className="Auth--Container">
            <div className="Auth--Content">
                <h1>Авторизация...</h1>
            </div>
        </div>
    );
};

export default OAuthCallback;








