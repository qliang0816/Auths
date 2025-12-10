import React, { useState, useEffect, useRef } from 'react';
import { useAccounts, useStyle } from '../../store/react';
import EntryComponent from './EntryComponent';
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

export default function MainBody() {
  const { entries, filter, showSearch, dispatch } = useAccounts();
  const { style } = useStyle();
  const [searchText, setSearchText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredEntries = entries.filter((entry) => {
    if (searchText === '') return true;
    return (
      entry.issuer.toLowerCase().includes(searchText.toLowerCase()) ||
      entry.account.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const isMatchedEntry = (entry: OTPEntryInterface) => {
    // Simplified version - in real implementation this would use getMatchedEntriesHash
    return false;
  };

  const isEntryVisible = (entry: OTPEntryInterface) => {
    return (
      (searchText === '' || 
        entry.issuer.toLowerCase().includes(searchText.toLowerCase()) ||
        entry.account.toLowerCase().includes(searchText.toLowerCase())
      ) &&
      (entry.pinned || !filter || isMatchedEntry(entry))
    );
  };

  const handleClearFilter = () => {
    dispatch({ type: 'stopFilter' });
    if (entries.length >= 10) {
      dispatch({ type: 'showSearch' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = Array.from(container.querySelectorAll('.entry:not(.filtered):not(.not-searched)'));
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
    }
  };

  const getTabindex = (entry: OTPEntryInterface) => {
    const firstVisibleEntry = entries.find(isEntryVisible);
    return entry === firstVisibleEntry ? 0 : -1;
  };

  return (
    <div
      id="codes"
      className={`${filter && showSearch ? 'filter search' : ''}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {/* Filter */}
      {filter && (
        <div className="under-header" id="filter" onClick={handleClearFilter}>
          显示所有条目
        </div>
      )}
      
      {/* Search */}
      {showSearch && (
        <div className="under-header" id="search">
          <input
            id="searchInput"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索..."
            type="text"
            tabIndex={-1}
          />
          {searchText === '' && (
            <div id="searchHint">
              <div></div>
              <div id="searchHintBorder">/</div>
              <div></div>
            </div>
          )}
        </div>
      )}
      
      {/* Entries */}
      <div>
        {filteredEntries.length === 0 && entries.length === 0 ? (
          <div className="no-entry">
            <div className="icon">🔑</div>
            <p>
              暂无条目。{' '}
              <a
                href="https://otp.ee/quickstart"
                target="_blank"
                rel="noopener noreferrer"
              >
                了解更多
              </a>
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <EntryComponent
              key={entry.hash}
              entry={entry}
              filtered={!entry.pinned && !isMatchedEntry(entry)}
              notSearched={searchText !== '' && 
                !entry.issuer.toLowerCase().includes(searchText.toLowerCase()) &&
                !entry.account.toLowerCase().includes(searchText.toLowerCase())
              }
              tabindex={getTabindex(entry)}
            />
          ))
        )}
      </div>
    </div>
  );
}