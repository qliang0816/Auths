import React, { useState, useRef } from 'react';
import { useAccounts, useStyle } from '../../store';
import EntryComponent from './EntryComponent';
import AddAccountForm from './AddAccountForm';
import QRScanner from './QRScanner';

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

export default function MainBody() {
  const { entries, filter, showSearch, dispatch } = useAccounts();
  const { style } = useStyle();
  const [searchText, setSearchText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredEntries = entries?.filter((entry: OTPEntryInterface) => {
    if (searchText === '') return true;
    const search = searchText.toLowerCase();
    return (
      entry.issuer.toLowerCase().includes(search) ||
      (entry.account && entry.account.toLowerCase().includes(search))
    );
  }) || [];

  const handleClearFilter = () => {
    dispatch({ type: 'stopFilter' });
    if (entries?.length >= 10) {
      dispatch({ type: 'showSearch' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = Array.from(
      container.querySelectorAll('.entry:not(.filtered):not(.not-searched)')
    );
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        (focusableElements[nextIndex] as HTMLElement)?.focus();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        (focusableElements[prevIndex] as HTMLElement)?.focus();
        break;
      case '/':
        e.preventDefault();
        const searchInput = document.getElementById('searchInput') as HTMLInputElement;
        searchInput?.focus();
        break;
    }
  };

  const getTabindex = (entry: OTPEntryInterface) => {
    const firstVisibleEntry = filteredEntries[0];
    return entry === firstVisibleEntry ? 0 : -1;
  };

  const handleAddAccountSuccess = () => {
    setShowAddForm(false);
    setShowQRScanner(false);
  };

  const handleOpenQRScanner = () => {
    setShowAddForm(false);
    setShowQRScanner(true);
  };

  return (
    <>
      <div
        id="codes"
        className={`${filter && showSearch ? 'filter search' : ''} ${style.isEditing ? 'edit' : ''}`}
        ref={containerRef}
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar */}
        <div className="search-bar">
          <input
            id="searchInput"
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="🔍 搜索账户..."
            className="search-input"
          />
          {searchText && (
            <button
              className="clear-search"
              onClick={() => setSearchText('')}
              title="清除"
            >
              ✕
            </button>
          )}
        </div>

        {/* Add Account Button */}
        {!style.isEditing && (
          <button
            className="add-account-btn"
            onClick={() => setShowAddForm(true)}
          >
            <span className="plus-icon">+</span>
            添加账户
          </button>
        )}

        {/* Edit Mode Toggle */}
        <div className="action-bar">
          <button
            className={`edit-toggle-btn ${style.isEditing ? 'active' : ''}`}
            onClick={() => dispatch({ type: style.isEditing ? 'stopEdit' : 'startEdit' })}
          >
            {style.isEditing ? '完成' : '编辑'}
          </button>
        </div>

        {/* Entries List */}
        <div className="entries-container">
          {filteredEntries.length === 0 && !entries?.length ? (
            <div className="no-entry">
              <div className="no-entry-icon">🔐</div>
              <p className="no-entry-text">暂无账户</p>
              <p className="no-entry-hint">点击上方"添加账户"按钮开始</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="no-entry">
              <div className="no-entry-icon">🔍</div>
              <p className="no-entry-text">未找到匹配的账户</p>
              <p className="no-entry-hint">尝试其他搜索词</p>
            </div>
          ) : (
            filteredEntries.map((entry: OTPEntryInterface) => (
              <EntryComponent
                key={entry.hash}
                entry={entry}
                filtered={false}
                notSearched={searchText !== '' &&
                  !entry.issuer.toLowerCase().includes(searchText.toLowerCase()) &&
                  (!entry.account || !entry.account.toLowerCase().includes(searchText.toLowerCase()))
                }
                tabindex={getTabindex(entry)}
              />
            ))
          )}
        </div>
      </div>

      {/* Add Account Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AddAccountForm
              onClose={() => setShowAddForm(false)}
              onScanQR={handleOpenQRScanner}
            />
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="modal-overlay" onClick={() => setShowQRScanner(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <QRScanner
              onClose={() => setShowQRScanner(false)}
              onSuccess={handleAddAccountSuccess}
            />
          </div>
        </div>
      )}
    </>
  );
}
