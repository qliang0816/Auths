import React from 'react';
import { useCurrentView, useStyle } from '../../store/react';

// Placeholder components - these will be created later
const EnterPasswordPage = () => <div>Enter Password Page</div>;
const AddAccountPage = () => <div>Add Account Page</div>;
const LoadingPage = () => <div>Loading Page</div>;
const PreferencesPage = () => <div>Preferences Page</div>;
const MenuPage = () => <div>Menu Page</div>;
const BackupPage = () => <div>Backup Page</div>;
const DropboxPage = () => <div>Dropbox Page</div>;
const DrivePage = () => <div>Drive Page</div>;
const OneDrivePage = () => <div>OneDrive Page</div>;
const SetPasswordPage = () => <div>Set Password Page</div>;
const AdvisorPage = () => <div>Advisor Page</div>;
const AdvisorInsight = () => <div>Advisor Insight</div>;

export default function PageHandler() {
  const { info } = useCurrentView();
  const { style } = useStyle();

  const renderPage = () => {
    switch (info) {
      case 'EnterPasswordPage':
        return <EnterPasswordPage />;
      case 'AddAccountPage':
        return <AddAccountPage />;
      case 'LoadingPage':
        return <LoadingPage />;
      case 'PreferencesPage':
        return <PreferencesPage />;
      case 'MenuPage':
        return <MenuPage />;
      case 'BackupPage':
        return <BackupPage />;
      case 'DropboxPage':
        return <DropboxPage />;
      case 'DrivePage':
        return <DrivePage />;
      case 'OneDrivePage':
        return <OneDrivePage />;
      case 'SetPasswordPage':
        return <SetPasswordPage />;
      case 'AdvisorPage':
        return <AdvisorPage />;
      case 'AdvisorInsight':
        return <AdvisorInsight />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`page-handler ${style.fadein ? 'fadein' : ''} ${style.fadeout ? 'fadeout' : ''} ${style.show ? 'show' : ''}`}
    >
      {renderPage()}
    </div>
  );
}