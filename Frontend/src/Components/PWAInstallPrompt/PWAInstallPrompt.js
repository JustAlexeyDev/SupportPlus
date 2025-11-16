import React from 'react';
import { usePWA } from '../../Modules/hooks/usePWA';
import './PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable) return null;

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-content">
        <h3>Установить приложение?</h3>
        <p>Установите наше приложение для быстрого доступа и работы оффлайн</p>
        <div className="pwa-install-buttons">
          <button 
            className="pwa-install-btn primary"
            onClick={installApp}
          >
            Установить
          </button>
          <button 
            className="pwa-install-btn secondary"
            onClick={() => window.location.reload()}
          >
            Позже
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;