import React, { useEffect } from 'react';
import { useNotification, useStyle } from '../../store/react';

export default function NotificationHandler() {
  const { message, messageIdle, dispatch } = useNotification();
  const { style } = useStyle();

  useEffect(() => {
    if (!messageIdle && style.notificationFadeout) {
      const timer = setTimeout(() => {
        dispatch({ type: 'closeAlert' });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [messageIdle, style.notificationFadeout, dispatch]);

  useEffect(() => {
    if (style.notificationFadein) {
      const timer = setTimeout(() => {
        dispatch({ type: 'showNotification', payload: '' });
        dispatch({ type: 'showNotification' });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [style.notificationFadein, dispatch]);

  return (
    <>
      {/* Alert Messages */}
      {message.length > 0 && (
        <div className={`alert-container ${!messageIdle ? 'active' : ''}`}>
          <div className="alert-content">
            <p>{message[0]}</p>
            <button
              onClick={() => dispatch({ type: 'closeAlert' })}
              className="alert-close"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Confirmation Messages */}
      {message.length > 1 && (
        <div className="confirm-container">
          <div className="confirm-content">
            <p>{message[1]}</p>
            <div className="confirm-buttons">
              <button
                onClick={() => {
                  // Dispatch custom event for confirmation
                  const event = new CustomEvent('confirm', { detail: true });
                  window.dispatchEvent(event);
                  dispatch({ type: 'setConfirm', payload: '' });
                }}
                className="confirm-yes"
              >
                是
              </button>
              <button
                onClick={() => {
                  const event = new CustomEvent('confirm', { detail: false });
                  window.dispatchEvent(event);
                  dispatch({ type: 'setConfirm', payload: '' });
                }}
                className="confirm-no"
              >
                否
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}