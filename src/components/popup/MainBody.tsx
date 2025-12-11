import React, { useState, useRef } from 'react';
import { useAccounts, useStyle } from '../../store';
import { useI18n } from '../../i18n';
import EntryComponent from './EntryComponent';
import AddAccountForm from './AddAccountForm';
import QRScanner from './QRScanner';

// SVG Icons
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const KeyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M11 12L21 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 5L21 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 7L18 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

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
  const { style, dispatch: styleDispatch } = useStyle();
  const { t } = useI18n();
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

  const handleToggleEdit = () => {
    styleDispatch({ type: style.isEditing ? 'stopEdit' : 'startEdit' });
  };

  return (
    <>
      {/* Search Bar */}
      <div className="search-bar">
        <div className="search-container">
          <span className="search-icon">
            <SearchIcon />
          </span>
          <input
            id="searchInput"
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t('search_accounts')}
            className="search-input"
          />
          {searchText && (
            <button
              className="clear-search"
              onClick={() => setSearchText('')}
              title={t('clear')}
              aria-label={t('clear')}
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="accounts-count">
          {filteredEntries.length} {filteredEntries.length === 1 ? t('account') : t('accounts')}
        </div>
        <button
          className={`edit-btn ${style.isEditing ? 'active' : ''}`}
          onClick={handleToggleEdit}
        >
          {style.isEditing ? t('done') : t('edit')}
        </button>
      </div>

      {/* Entries List */}
      <div
        className="entries-container"
        ref={containerRef}
        onKeyDown={handleKeyDown}
      >
        {filteredEntries.length === 0 && !entries?.length ? (
          <div className="no-entry">
            <div className="no-entry-icon">
              <KeyIcon />
            </div>
            <p className="no-entry-text">{t('no_accounts_yet')}</p>
            <p className="no-entry-hint">{t('tap_to_add')}</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="no-entry">
            <div className="no-entry-icon">
              <SearchIcon />
            </div>
            <p className="no-entry-text">{t('no_matching_accounts')}</p>
            <p className="no-entry-hint">{t('try_different_search')}</p>
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

      {/* Add Account FAB */}
      {!style.isEditing && (
        <button
          className="add-account-fab"
          onClick={() => setShowAddForm(true)}
          title={t('add_account')}
          aria-label={t('add_account')}
        >
          <PlusIcon />
        </button>
      )}

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
