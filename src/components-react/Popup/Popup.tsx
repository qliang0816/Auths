import React, { useState } from 'react';
import { useStyle, useMenu, useQr, useNotification } from '../../store/react';
import MainHeader from './MainHeader';
import MainBody from './MainBody';
import MenuPage from './MenuPage';
import PageHandler from './PageHandler';
import NotificationHandler from './NotificationHandler';

export default function Popup() {
  const { style } = useStyle();
  const { theme } = useMenu();
  const { qr } = useQr();
  const { notification } = useNotification();
  const [hideoutline, setHideoutline] = useState(true);

  const getThemeClass = () => {
    switch (theme) {
      case 'accessibility':
        return 'theme-accessibility';
      case 'dark':
        return 'theme-dark';
      case 'simple':
        return 'theme-simple';
      case 'compact':
        return 'theme-compact';
      case 'flat':
        return 'theme-flat';
      default:
        return 'theme-normal';
    }
  };

  const handleMouseDown = () => {
    setHideoutline(true);
  };

  const handleKeyDown = () => {
    setHideoutline(false);
  };

  const handleHideQr = () => {
    // Dispatch hideQr action
  };

  return (
    <div
      className={`${getThemeClass()} ${hideoutline ? 'hideoutline' : ''}`}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
    >
      <MainHeader />
      <div
        className={`${style.timeout && !style.isEditing ? 'timeout' : ''} ${style.isEditing ? 'edit' : ''}`}
      >
        <MainBody />
      </div>

      <div
        className={`${style.slidein ? 'slidein' : ''} ${style.slideout ? 'slideout' : ''}`}
      >
        <MenuPage />
      </div>

      <div
        className={`${style.fadein ? 'fadein' : ''} ${style.fadeout ? 'fadeout' : ''} ${style.show ? 'show' : ''}`}
      >
        <PageHandler />
      </div>

      <NotificationHandler />

      {/* EPHERMAL MESSAGE */}
      <div
        className={`notification ${style.notificationFadein ? 'fadein' : ''} ${style.notificationFadeout ? 'fadeout' : ''}`}
      >
        {notification}
      </div>

      {/* QR */}
      <div
        className={`qr ${style.qrfadein ? 'qrfadein' : ''} ${style.qrfadeout ? 'qrfadeout' : ''}`}
        style={{ backgroundImage: qr }}
        onClick={handleHideQr}
      ></div>

      {/* CLIPBOARD */}
      <input type="text" id="codeClipboard" tabIndex={-1} />
    </div>
  );
}