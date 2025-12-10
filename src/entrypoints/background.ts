export default defineBackground(() => {
  console.log('Auths background script started');

  // Handle extension installation
  chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
    if (details.reason === 'install') {
      console.log('Extension installed');
    } else if (details.reason === 'update') {
      console.log('Extension updated');
    }
  });

  // Handle commands
  chrome.commands.onCommand.addListener((command: string) => {
    if (command === 'scan-qr') {
      // Handle QR scan command
      console.log('Scan QR command triggered');
    } else if (command === 'autofill') {
      // Handle autofill command
      console.log('Autofill command triggered');
    }
  });
});
