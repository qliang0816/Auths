import React, { useState } from 'react';
import { useMenu } from '../../store';
import ImportExport from './ImportExport';

interface SettingsPageProps {
  onClose: () => void;
}

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const { menu, dispatch } = useMenu();
  const [showImportExport, setShowImportExport] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'security' | 'backup'>('general');

  const handleThemeChange = (theme: string) => {
    dispatch({ type: 'setTheme', payload: theme });
  };

  const handleAutoLockChange = (minutes: number) => {
    dispatch({ type: 'setAutolock', payload: minutes });
  };

  const handleZoomChange = (zoom: number) => {
    dispatch({ type: 'setZoom', payload: zoom });

    // Apply zoom
    if (zoom !== 100) {
      document.body.style.marginBottom = 480 * (zoom / 100 - 1) + "px";
      document.body.style.marginRight = 320 * (zoom / 100 - 1) + "px";
      document.body.style.transform = "scale(" + zoom / 100 + ")";
    } else {
      document.body.style.marginBottom = "";
      document.body.style.marginRight = "";
      document.body.style.transform = "";
    }
  };

  const handleResetPassword = () => {
    if (confirm('重置主密码将清除所有已保存的账户数据。确定要继续吗？')) {
      // Clear all data
      chrome.storage.local.clear(() => {
        alert('主密码已重置，所有数据已清除');
        window.location.reload();
      });
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="back-btn" onClick={onClose} title="返回">
          ← 返回
        </button>
        <h2>设置</h2>
      </div>

      <div className="settings-nav">
        <button
          className={`nav-item ${activeSection === 'general' ? 'active' : ''}`}
          onClick={() => setActiveSection('general')}
        >
          ⚙️ 常规
        </button>
        <button
          className={`nav-item ${activeSection === 'security' ? 'active' : ''}`}
          onClick={() => setActiveSection('security')}
        >
          🔒 安全
        </button>
        <button
          className={`nav-item ${activeSection === 'backup' ? 'active' : ''}`}
          onClick={() => setActiveSection('backup')}
        >
          💾 备份
        </button>
      </div>

      <div className="settings-content">
        {activeSection === 'general' && (
          <div className="settings-section">
            <h3>外观</h3>

            <div className="setting-item">
              <label>主题</label>
              <select
                value={menu.theme || 'normal'}
                onChange={(e) => handleThemeChange(e.target.value)}
              >
                <option value="normal">默认</option>
                <option value="dark">深色</option>
                <option value="simple">简约</option>
                <option value="compact">紧凑</option>
                <option value="flat">扁平</option>
                <option value="accessibility">高对比度</option>
              </select>
            </div>

            <div className="setting-item">
              <label>缩放比例</label>
              <select
                value={menu.zoom || 100}
                onChange={(e) => handleZoomChange(Number(e.target.value))}
              >
                <option value={80}>80%</option>
                <option value={90}>90%</option>
                <option value={100}>100%</option>
                <option value={110}>110%</option>
                <option value={120}>120%</option>
                <option value={150}>150%</option>
              </select>
            </div>

            <h3>功能</h3>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={menu.autofill || false}
                  onChange={(e) => dispatch({ type: 'setAutofill', payload: e.target.checked })}
                />
                <span>启用自动填充</span>
              </label>
              <p className="setting-description">
                自动检测并填充网页中的验证码输入框
              </p>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={menu.smartFilter || false}
                  onChange={(e) => dispatch({ type: 'setSmartFilter', payload: e.target.checked })}
                />
                <span>智能筛选</span>
              </label>
              <p className="setting-description">
                根据当前网页自动显示相关账户
              </p>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={menu.enableContextMenu || false}
                  onChange={(e) => dispatch({ type: 'setEnableContextMenu', payload: e.target.checked })}
                />
                <span>启用右键菜单</span>
              </label>
              <p className="setting-description">
                在网页上右键快速访问验证码
              </p>
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="settings-section">
            <h3>密码保护</h3>

            <div className="setting-item">
              <label>自动锁定</label>
              <select
                value={menu.autolock || 0}
                onChange={(e) => handleAutoLockChange(Number(e.target.value))}
              >
                <option value={0}>禁用</option>
                <option value={1}>1 分钟</option>
                <option value={5}>5 分钟</option>
                <option value={10}>10 分钟</option>
                <option value={30}>30 分钟</option>
                <option value={60}>1 小时</option>
              </select>
              <p className="setting-description">
                闲置指定时间后自动锁定，需重新输入主密码
              </p>
            </div>

            <div className="setting-item">
              <button className="btn-secondary" onClick={handleResetPassword}>
                重置主密码
              </button>
              <p className="setting-description warning">
                ⚠️ 重置密码将清除所有账户数据，请先导出备份
              </p>
            </div>

            <h3>隐私</h3>

            <div className="setting-item">
              <button
                className="btn-secondary"
                onClick={() => {
                  if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
                    chrome.storage.local.clear(() => {
                      alert('所有数据已清除');
                      window.location.reload();
                    });
                  }
                }}
              >
                清除所有数据
              </button>
              <p className="setting-description warning">
                ⚠️ 永久删除所有账户和设置数据
              </p>
            </div>
          </div>
        )}

        {activeSection === 'backup' && (
          <div className="settings-section">
            <h3>备份与恢复</h3>

            <div className="setting-item">
              <button
                className="btn-primary btn-full"
                onClick={() => setShowImportExport(true)}
              >
                📦 管理备份
              </button>
              <p className="setting-description">
                导出或导入您的账户数据
              </p>
            </div>

            <h3>关于</h3>

            <div className="about-info">
              <div className="info-row">
                <span>版本</span>
                <span>1.0.0</span>
              </div>
              <div className="info-row">
                <span>开发者</span>
                <span>Auths Team</span>
              </div>
              <div className="info-row">
                <span>许可证</span>
                <span>MIT</span>
              </div>
            </div>

            <div className="links">
              <a href="https://github.com/your-repo/auths" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href="https://github.com/your-repo/auths/issues" target="_blank" rel="noopener noreferrer">
                反馈问题
              </a>
              <a href="https://github.com/your-repo/auths/blob/main/README.md" target="_blank" rel="noopener noreferrer">
                使用帮助
              </a>
            </div>
          </div>
        )}
      </div>

      {showImportExport && (
        <div className="modal-overlay" onClick={() => setShowImportExport(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ImportExport onClose={() => setShowImportExport(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
