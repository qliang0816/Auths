import React, { useState, useEffect } from 'react';
import { useAccounts, useStyle } from '../../store/react';
import ButtonInput from '../common/ButtonInput';

// Use OTPEntryInterface from global declarations
declare global {
  interface OTPEntryInterface {
    hash: string;
    issuer: string;
    account: string;
    code: string;
    period: number;
    pinned: boolean;
    type: number;
    counter: number;
    digits: number;
    secret: string | null;
  }
}

interface EntryComponentProps {
  entry: OTPEntryInterface;
  filtered?: boolean;
  notSearched?: boolean;
  tabindex?: number;
}

export default function EntryComponent({ 
  entry, 
  filtered = false, 
  notSearched = false,
  tabindex = -1
}: EntryComponentProps) {
  const { dispatch } = useAccounts();
  const { style } = useStyle();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (entry.type !== 2 && entry.type !== 6) {
      // TOTP - calculate progress
      const updateProgress = () => {
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = entry.period - (now % entry.period);
        const progressPercent = (timeLeft / entry.period) * 100;
        setProgress(progressPercent);
      };

      updateProgress();
      const interval = setInterval(updateProgress, 100);
      return () => clearInterval(interval);
    }
  }, [entry.period, entry.type]);

  const handleCopy = () => {
    if (entry.code && entry.code !== '-1' && entry.code !== '-2') {
      navigator.clipboard.writeText(entry.code);
      dispatch({ type: 'showNotification' });
    }
  };

  const handlePin = () => {
    dispatch({ type: 'pinEntry', payload: entry });
  };

  const handleDelete = () => {
    if (confirm('确定要删除这个账户吗？')) {
      dispatch({ type: 'deleteCode', payload: entry.hash });
    }
  };

  const isHOTP = entry.type === 2 || entry.type === 6;
  const isEncrypted = entry.secret === null;

  return (
    <div
      className={`entry ${filtered ? 'filtered' : ''} ${notSearched ? 'not-searched' : ''}`}
      tabIndex={tabindex}
      data-x-role="entry"
      onClick={handleCopy}
    >
      <div className="entry-info">
        <div className="entry-issuer">
          {entry.pinned && <span className="pin-indicator">📌</span>}
          {entry.issuer || 'No Issuer'}
        </div>
        <div className="entry-account">{entry.account || 'No Account'}</div>
        {!isHOTP && (
          <div className="entry-progress">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <div className="entry-right">
        <div className="entry-code">
          {isEncrypted ? '•••••••' : entry.code}
        </div>
        {isHOTP && (
          <button
            className="btn-next"
            onClick={(e) => {
              e.stopPropagation();
              // Handle next code generation
            }}
            title="Generate next code"
          >
            ↻
          </button>
        )}
      </div>
      {style.isEditing && (
        <div className="entry-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePin();
            }}
            title={entry.pinned ? '取消置顶' : '置顶'}
          >
            {entry.pinned ? '📌' : '📌'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            title="删除"
            className="danger"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}