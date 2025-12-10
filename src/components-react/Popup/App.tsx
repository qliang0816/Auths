import { useState, useEffect } from 'react';
import './App.css';
import AddAccountModal from './AddAccountModal';
import SettingsPage from './SettingsPage';
import BackupPage from './BackupPage';
import AboutPage from './AboutPage';
import PasswordPrompt from './PasswordPrompt';
import Notification from './Notification';
import { useAuth } from './hooks/useAuth';
import { useEntries, DisplayEntry } from './hooks/useEntries';

type Page = 'main' | 'settings' | 'backup' | 'about';

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [editingEntry, setEditingEntry] = useState<DisplayEntry | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'success',
  });

  const { isLocked, hasPassword, encryption, isLoading: authLoading, unlock, lock } = useAuth();
  const {
    entries,
    loading: entriesLoading,
    error,
    addEntry,
    deleteEntry,
    togglePin,
    updateEntry,
    nextCode,
    reload: reloadEntries
  } = useEntries(encryption);

  const loading = authLoading || entriesLoading;

  const filteredEntries = entries.filter((entry) => {
    if (!searchText) return true;
    return (
      entry.issuer.toLowerCase().includes(searchText.toLowerCase()) ||
      entry.account.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const handleAddAccount = () => {
    setShowMenu(false);
    setShowAddModal(true);
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  const handleAddAccountSubmit = async (accountData: {
    issuer: string;
    account: string;
    secret: string;
    type?: string;
    period?: number;
    digits?: number;
  }) => {
    try {
      await addEntry({
        issuer: accountData.issuer,
        account: accountData.account,
        secret: accountData.secret,
        type: accountData.type ? parseInt(accountData.type) : 1,
        period: accountData.period,
        digits: accountData.digits,
      });
      setShowAddModal(false);
      showNotification('账户已添加！', 'success');
    } catch (error) {
      console.error('Failed to add account:', error);
      showNotification('添加账户失败', 'error');
    }
  };

  const navigateToPage = (page: Page) => {
    setShowMenu(false);
    setCurrentPage(page);
  };

  const handleCopyCode = async (code: string, issuer: string) => {
    try {
      if (code.startsWith('-') || code.includes('•')) {
        return; // Don't copy invalid/encrypted codes
      }
      await navigator.clipboard.writeText(code);
      showNotification(`已复制 ${issuer} 的验证码`, 'success');
    } catch (error) {
      console.error('Failed to copy code:', error);
      showNotification('复制失败', 'error');
    }
  };

  const handleDeleteEntry = async (hash: string) => {
    if (!confirm('确定要删除这个账户吗？')) {
      return;
    }
    try {
      await deleteEntry(hash);
      showNotification('账户已删除', 'success');
    } catch (error) {
      console.error('Failed to delete entry:', error);
      showNotification('删除失败', 'error');
    }
  };

  const handleTogglePin = async (hash: string) => {
    try {
      await togglePin(hash);
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      showNotification('置顶操作失败', 'error');
    }
  };

  const handleEditEntry = (entry: DisplayEntry) => {
    setEditingEntry(entry);
  };

  const handleUpdateEntry = async (issuer: string, account: string) => {
    if (!editingEntry) return;
    try {
      await updateEntry(editingEntry.hash, { issuer, account });
      setEditingEntry(null);
      showNotification('账户已更新', 'success');
    } catch (error) {
      console.error('Failed to update entry:', error);
      showNotification('更新失败', 'error');
    }
  };

  const handleNextCode = async (hash: string) => {
    try {
      await nextCode(hash);
      showNotification('已生成新代码', 'success');
    } catch (error) {
      console.error('Failed to generate next code:', error);
      showNotification('生成代码失败', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ show: true, message, type });
  };

  if (authLoading) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (isLocked) {
    return <PasswordPrompt onUnlock={unlock} />;
  }

  if (loading) {
    return (
      <div className="loading">
        <p>Loading entries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading">
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  // 渲染不同的页面
  if (currentPage === 'settings') {
    return (
      <SettingsPage
        onBack={() => setCurrentPage('main')}
        encryption={encryption}
        onLock={lock}
      />
    );
  }

  if (currentPage === 'backup') {
    return (
      <BackupPage
        onBack={() => setCurrentPage('main')}
        encryption={encryption}
        onReload={reloadEntries}
      />
    );
  }

  if (currentPage === 'about') {
    return <AboutPage onBack={() => setCurrentPage('main')} />;
  }

  // 主页面
  return (
    <div className="app">
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      <header className="header">
        <h1>Auths</h1>
        <div className="header-actions">
          {hasPassword && (
            <button className="icon-btn" title="Lock" onClick={lock}>
              🔒
            </button>
          )}
          <button className="icon-btn" title="Menu" onClick={handleMenuClick}>
            ☰
          </button>
        </div>
      </header>

      {showMenu && (
        <div className="menu-dropdown">
          <button onClick={() => navigateToPage('settings')}>⚙️ 设置</button>
          <button onClick={() => navigateToPage('backup')}>💾 备份</button>
          <button onClick={() => navigateToPage('about')}>ℹ️ 关于</button>
          {hasPassword && (
            <button onClick={lock} style={{ borderTop: '1px solid #eee' }}>
              🔒 锁定
            </button>
          )}
        </div>
      )}

      {showAddModal && (
        <AddAccountModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddAccountSubmit}
        />
      )}

      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleUpdateEntry}
        />
      )}

      {entries.length > 0 && (
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      )}

      <main className="main-content">
        {filteredEntries.length === 0 && entries.length === 0 ? (
          <div className="no-entries">
            <div className="icon">🔑</div>
            <p>
              No entries yet.{' '}
              <a
                href="https://otp.ee/quickstart"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more
              </a>
            </p>
            <button className="btn-primary" onClick={handleAddAccount}>
              Add Account
            </button>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="no-results">
            <p>No matching entries found</p>
          </div>
        ) : (
          <div className="entries-list">
            {filteredEntries.map((entry) => (
              <EntryCard
                key={entry.hash}
                entry={entry}
                onCopy={handleCopyCode}
                onDelete={handleDeleteEntry}
                onPin={handleTogglePin}
                onEdit={handleEditEntry}
                onNext={handleNextCode}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <button className="btn-add" title="Add new account" onClick={handleAddAccount}>
          + Add Account
        </button>
      </footer>
    </div>
  );
}

interface EntryCardProps {
  entry: DisplayEntry;
  onCopy: (code: string, issuer: string) => void;
  onDelete: (hash: string) => void;
  onPin: (hash: string) => void;
  onEdit: (entry: DisplayEntry) => void;
  onNext: (hash: string) => void;
}

function EntryCard({ entry, onCopy, onDelete, onPin, onEdit, onNext }: EntryCardProps) {
  const [showActions, setShowActions] = useState(false);
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

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.entry-actions')) {
      return;
    }
    onCopy(entry.code, entry.issuer);
  };

  const isHOTP = entry.type === 2 || entry.type === 6;

  return (
    <div
      className={`entry-card ${entry.pinned ? 'pinned' : ''}`}
      onClick={handleClick}
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
        <div className="entry-code">{entry.code}</div>
        {isHOTP && (
          <button
            className="btn-next"
            onClick={(e) => {
              e.stopPropagation();
              onNext(entry.hash);
            }}
            title="Generate next code"
          >
            ↻
          </button>
        )}
      </div>
      <div className="entry-actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
          className="btn-more"
          title="More actions"
        >
          ⋮
        </button>
        {showActions && (
          <div className="actions-menu">
            <button onClick={(e) => { e.stopPropagation(); onEdit(entry); setShowActions(false); }}>
              ✏️ 编辑
            </button>
            <button onClick={(e) => { e.stopPropagation(); onPin(entry.hash); setShowActions(false); }}>
              {entry.pinned ? '📌 取消置顶' : '📌 置顶'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(entry.hash); setShowActions(false); }}
              className="danger"
            >
              🗑️ 删除
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface EditEntryModalProps {
  entry: DisplayEntry;
  onClose: () => void;
  onSave: (issuer: string, account: string) => void;
}

function EditEntryModal({ entry, onClose, onSave }: EditEntryModalProps) {
  const [issuer, setIssuer] = useState(entry.issuer);
  const [account, setAccount] = useState(entry.account);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(issuer, account);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>编辑账户</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>服务商 (Issuer)</label>
            <input
              type="text"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="例如: Google, GitHub"
            />
          </div>

          <div className="form-group">
            <label>账户名 (Account)</label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="例如: user@example.com"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              取消
            </button>
            <button type="submit" className="btn-primary">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
