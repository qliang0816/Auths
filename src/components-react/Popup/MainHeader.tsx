import React from 'react';
import { useStyle, useMenu } from '../../store/react';
import ButtonInput from '../common/ButtonInput';

interface MainHeaderProps {
  onMenuClick?: () => void;
}

export default function MainHeader({ onMenuClick }: MainHeaderProps) {
  const { style } = useStyle();
  const { theme } = useMenu();

  const getThemeClass = () => {
    switch (theme) {
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

  return (
    <header className={`main-header ${getThemeClass()}`}>
      <div className="header-content">
        <h1 className="header-title">Auths</h1>
        <div className="header-actions">
          <ButtonInput
            onClick={onMenuClick}
            className="menu-button"
            title="Menu"
          >
            ☰
          </ButtonInput>
        </div>
      </div>
    </header>
  );
}