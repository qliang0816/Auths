import React, { useState } from 'react';
import { useAccounts } from '../../store';

interface AddAccountFormProps {
  onClose: () => void;
  onScanQR: () => void;
}

export default function AddAccountForm({ onClose, onScanQR }: AddAccountFormProps) {
  const [issuer, setIssuer] = useState('');
  const [account, setAccount] = useState('');
  const [secret, setSecret] = useState('');
  const [period, setPeriod] = useState(30);
  const [digits, setDigits] = useState(6);
  const [error, setError] = useState('');
  const { dispatch } = useAccounts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!issuer.trim()) {
      setError('请输入账户名称');
      return;
    }

    if (!secret.trim()) {
      setError('请输入密钥');
      return;
    }

    // Validate Base32 secret
    const base32Regex = /^[A-Z2-7]+=*$/i;
    if (!base32Regex.test(secret.trim())) {
      setError('密钥格式不正确（应为Base32编码）');
      return;
    }

    // Add account
    dispatch({
      type: 'addCode',
      payload: {
        issuer: issuer.trim(),
        account: account.trim() || '',
        secret: secret.trim().toUpperCase(),
        type: 1, // TOTP
        period,
        digits,
        algorithm: 1, // SHA1
      }
    });

    onClose();
  };

  return (
    <div className="add-account-form">
      <div className="form-header">
        <h2>添加账户</h2>
        <button className="close-btn" onClick={onClose} title="关闭">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="issuer">账户名称 *</label>
          <input
            type="text"
            id="issuer"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="例如：Google、GitHub"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="account">用户名（可选）</label>
          <input
            type="text"
            id="account"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="例如：user@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="secret">密钥 (Base32) *</label>
          <input
            type="text"
            id="secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value.toUpperCase())}
            placeholder="JBSWY3DPEHPK3PXP"
            required
            style={{ fontFamily: 'monospace' }}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="period">刷新周期（秒）</label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
            >
              <option value={30}>30秒</option>
              <option value={60}>60秒</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="digits">验证码位数</label>
            <select
              id="digits"
              value={digits}
              onChange={(e) => setDigits(Number(e.target.value))}
            >
              <option value={6}>6位</option>
              <option value={8}>8位</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onScanQR}>
            扫描二维码
          </button>
          <button type="submit" className="btn-primary">
            添加
          </button>
        </div>
      </form>
    </div>
  );
}
