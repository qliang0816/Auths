import React, { useState, useEffect } from 'react';
import { useAccounts, useStyle } from '../../store';
import { KeyUtilities } from '../../models/key-utilities';

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
  const [code, setCode] = useState(entry.code);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(100);
  const [copied, setCopied] = useState(false);

  // Generate TOTP code
  useEffect(() => {
    const generateCode = () => {
      if (!entry.secret || entry.type !== 1) {
        setCode(entry.code);
        return;
      }

      try {
        const now = Math.floor(Date.now() / 1000);
        const epoch = Math.floor(now / entry.period);
        const newCode = KeyUtilities.generate(
          entry.secret,
          epoch,
          entry.digits || 6
        );
        setCode(newCode);
      } catch (err) {
        console.error('Failed to generate TOTP:', err);
        setCode('ERROR');
      }
    };

    generateCode();

    // Update code when period changes
    const interval = setInterval(generateCode, 1000);
    return () => clearInterval(interval);
  }, [entry.secret, entry.period, entry.digits, entry.type]);

  // Update progress and time left
  useEffect(() => {
    if (entry.type !== 1) return; // Only for TOTP

    const updateProgress = () => {
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = entry.period - (now % entry.period);
      const progressPercent = (secondsLeft / entry.period) * 100;

      setTimeLeft(secondsLeft);
      setProgress(progressPercent);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [entry.period, entry.type]);

  const handleCopy = async () => {
    if (!code || code === 'ERROR' || code.includes('•')) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'pinEntry', payload: entry.hash });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除账户 "${entry.issuer}" 吗？`)) {
      dispatch({ type: 'deleteCode', payload: entry.hash });
    }
  };

  const isHOTP = entry.type === 2;
  const isEncrypted = entry.secret === null;
  const isLowTime = timeLeft <= 5 && entry.type === 1;

  return (
    <div
      className={`entry ${entry.pinned ? 'pinned' : ''} ${filtered ? 'filtered' : ''} ${notSearched ? 'not-searched' : ''} ${isLowTime ? 'timeout' : ''}`}
      tabIndex={tabindex}
      onClick={handleCopy}
      style={{ cursor: 'pointer' }}
    >
      {/* Account Info */}
      <div className="issuer">
        {entry.pinned && <span className="pin-icon">📌</span>}
        {entry.issuer || 'Unknown'}
      </div>

      {entry.account && (
        <div className="account">{entry.account}</div>
      )}

      {/* Code Display */}
      <div className={`code ${isEncrypted ? 'encrypted' : ''}`}>
        {isEncrypted ? '••••••' : code}
      </div>

      {/* Progress Bar and Timer (TOTP only) */}
      {entry.type === 1 && !isEncrypted && (
        <div className="code-footer">
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{
                width: `${progress}%`,
                backgroundColor: isLowTime ? '#dd4b39' : '#08c'
              }}
            />
          </div>
          <div className="time-left">{timeLeft}s</div>
        </div>
      )}

      {/* HOTP Counter */}
      {isHOTP && (
        <div className="hotp-counter">
          Counter: {entry.counter}
        </div>
      )}

      {/* Copy Indicator */}
      {copied && (
        <div className="copy-indicator">
          ✓ 已复制
        </div>
      )}

      {/* Edit Mode Actions */}
      {style.isEditing && (
        <div className="entry-actions">
          <button
            className="action-btn pin-btn"
            onClick={handlePin}
            title={entry.pinned ? '取消置顶' : '置顶'}
          >
            📌
          </button>
          <button
            className="action-btn delete-btn"
            onClick={handleDelete}
            title="删除"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}
