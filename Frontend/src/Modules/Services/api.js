import axios from 'axios';
import Cookies from 'js-cookie';

// Автоматическое определение API URL для локальной разработки
const getApiUrl = () => {
  // Если указан явный URL через переменную окружения, используем его
  if (process.env.REACT_APP_API_URL) {
    const apiUrl = process.env.REACT_APP_API_URL;
    // Проверяем, что URL не содержит 0.0.0.0
    if (apiUrl.includes('0.0.0.0')) {
      console.warn('REACT_APP_API_URL contains 0.0.0.0, using localhost instead');
      return 'http://localhost:8000';
    }
    return apiUrl;
  }
  
  // В режиме разработки определяем локальный IP
  if (process.env.NODE_ENV === 'development') {
    const hostname = window.location.hostname;
    
    // 0.0.0.0 не валиден для браузера, используем localhost
    if (hostname === '0.0.0.0' || !hostname || hostname === '' || hostname.includes('0.0.0.0')) {
      return 'http://localhost:8000';
    }
    
    // Если уже используем IP адрес (не localhost), используем его для API
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Проверяем, что это валидный IP адрес (не 0.0.0.0)
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (ipPattern.test(hostname) && hostname !== '0.0.0.0') {
        return `http://${hostname}:8000`;
      }
    }
    
    // Иначе используем localhost (для работы с компьютера)
    return 'http://localhost:8000';
  }
  
  // В production используем относительный путь или дефолтный URL
  const defaultUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  if (defaultUrl.includes('0.0.0.0')) {
    return 'http://localhost:8000';
  }
  return defaultUrl;
};

// Вычисляем базовый URL динамически при каждом запросе
const getApiBaseUrl = () => getApiUrl();

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Переопределяем baseURL для каждого запроса, чтобы он вычислялся динамически
api.interceptors.request.use(
  (config) => {
    // Пересчитываем baseURL для каждого запроса
    const baseURL = getApiBaseUrl();
    // Убеждаемся, что baseURL не содержит 0.0.0.0
    if (baseURL.includes('0.0.0.0')) {
      console.error('Detected 0.0.0.0 in baseURL, replacing with localhost');
      config.baseURL = 'http://localhost:8000';
    } else {
      config.baseURL = baseURL;
    }
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;




