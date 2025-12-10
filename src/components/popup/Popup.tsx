import React, { useState, useEffect } from 'react';
import { useStyle, useMenu, useQr, useNotification } from '../../store';
import MainHeader from './MainHeader';
import MainBody from './MainBody';
import MenuPage from './MenuPage';
import PageHandler from './PageHandler';
import NotificationHandler from './NotificationHandler';
import Settings from './Settings';
import PasswordSetup from './PasswordSetup';
import PasswordUnlock from './PasswordUnlock';

export default function Popup() {
  const { style } = useStyle();
  const { menu } = useMenu();
  const { qr } = useQr();
  const { notification } = useNotification();
  const [hideoutline, setHideoutline] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  const [unlockAttempts, setUnlockAttempts] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Check if password is set on mount
  useEffect(() => {
    const checkPasswordSetup = async () => {
      const result = await chrome.storage.local.get(['hasPassword', 'isLocked']);
      if (!result.hasPassword) {
        setNeedsPasswordSetup(true);
      } else if (result.isLocked) {
        setIsLocked(true);
      }
    };
    checkPasswordSetup();
  }, []);

  // Auto-lock timer
  useEffect(() => {
    if (!menu.autolock || menu.autolock === 0 || isLocked) return;

    const checkAutoLock = () => {
      const now = Date.now();
      const idleTime = (now - lastActivity) / 1000 / 60; // minutes

      if (idleTime >= menu.autolock) {
        handleLock();
      }
    };

    const interval = setInterval(checkAutoLock, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [menu.autolock, lastActivity, isLocked]);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());

    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    return () => {
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, []);

  const getThemeClass = () => {
    switch (menu.theme) {
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
    const { dispatch } = useQr();
    dispatch({ type: 'clearQrData' });
  };

  const handlePasswordSetup = async (password: string) => {
    try {
      // Hash and store password (simplified - use proper encryption in production)
      const passwordHash = btoa(password); // Base64 encode (use proper hashing!)

      await chrome.storage.local.set({
        passwordHash,
        hasPassword: true,
        isLocked: false
      });

      setNeedsPasswordSetup(false);
      setIsLocked(false);
    } catch (err) {
      console.error('Failed to set password:', err);
      alert('密码设置失败');
    }
  };

  const handlePasswordUnlock = async (password: string) => {
    try {
      const result = await chrome.storage.local.get(['passwordHash']);
      const passwordHash = btoa(password);

      if (passwordHash === result.passwordHash) {
        await chrome.storage.local.set({ isLocked: false });
        setIsLocked(false);
        setUnlockAttempts(0);
        setLastActivity(Date.now());
      } else {
        setUnlockAttempts(prev => prev + 1);
        if (unlockAttempts >= 4) {
          alert('密码错误次数过多，请稍后重试');
        }
      }
    } catch (err) {
      console.error('Unlock failed:', err);
      setUnlockAttempts(prev => prev + 1);
    }
  };

  const handleLock = async () => {
    await chrome.storage.local.set({ isLocked: true });
    setIsLocked(true);
  };

  const handleSkipPasswordSetup = () => {
    setNeedsPasswordSetup(false);
  };

  const handleForgotPassword = () => {
    if (confirm('忘记密码将清除所有数据。确定要继续吗？')) {
      chrome.storage.local.clear(() => {
        window.location.reload();
      });
    }
  };

  // Show password setup screen
  if (needsPasswordSetup) {
    return (
      <div className={`${getThemeClass()} ${hideoutline ? 'hideoutline' : ''}`}>
        <div className="full-screen-modal">
          <PasswordSetup
            onSetPassword={handlePasswordSetup}
            onCancel={handleSkipPasswordSetup}
          />
        </div>
      </div>
    );
  }

  // Show unlock screen
  if (isLocked) {
    return (
      <div className={`${getThemeClass()} ${hideoutline ? 'hideoutline' : ''}`}>
        <div className="full-screen-modal">
          <PasswordUnlock
            onUnlock={handlePasswordUnlock}
            onForgotPassword={handleForgotPassword}
            attempts={unlockAttempts}
          />
        </div>
      </div>
    );
  }

  // Show settings page
  if (showSettings) {
    return (
      <div className={`${getThemeClass()} ${hideoutline ? 'hideoutline' : ''}`}>
        <Settings onClose={() => setShowSettings(false)} />
      </div>
    );
  }

  // Main UI
  return (
    <div
      className={`${getThemeClass()} ${hideoutline ? 'hideoutline' : ''}`}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
    >
      <MainHeader onSettingsClick={() => setShowSettings(true)} />
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
        {notification.message}
      </div>

      {/* QR */}
      <div
        className={`qr ${style.qrfadein ? 'qrfadein' : ''} ${style.qrfadeout ? 'qrfadeout' : ''}`}
        style={{ backgroundImage: qr.data }}
        onClick={handleHideQr}
      ></div>

      {/* CLIPBOARD */}
      <input type="text" id="codeClipboard" tabIndex={-1} />
    </div>
  );
}
