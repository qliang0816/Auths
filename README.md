# Auths

A modern 2-Step Verification code generator browser extension built with React and wxt framework.

## Features

- Generate 2FA/TOTP verification codes
- Support for multiple accounts
- Cloud backup (Dropbox, Google Drive, OneDrive)
- Password encryption
- Multi-language support

## Development

### Prerequisites

- Node.js 18+
- npm

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

This will start the wxt dev server and watch for changes.

3. Load the extension in your browser:
   - Chrome: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked" and select the `.output/chrome-mv3` directory
   - Firefox: Run `npm run dev:firefox` and the extension will be loaded automatically

### Build for Production

Build for Chrome:
```bash
npm run build
```

Build for Firefox:
```bash
npm run build:firefox
```

Create distribution packages:
```bash
npm run zip
npm run zip:firefox
```

## Project Structure

```
auths/
├── entrypoints/          # Extension entry points
│   ├── background.ts     # Background service worker
│   ├── popup/           # Popup UI
│   └── options/         # Options page
├── components/          # React components
│   ├── Popup/          # Popup-specific components
│   └── Options/        # Options-specific components
├── src/                 # Original source (being migrated)
│   └── models/         # Data models and utilities
├── public/             # Static assets
│   ├── images/        # Icons and images
│   ├── svg/           # SVG icons
│   └── _locales/      # i18n translations
└── wxt.config.ts      # wxt configuration
```

## Migration Status

This project has been migrated from Vue.js to React with wxt framework. The basic structure is in place:

- ✅ Project renamed to "auths"
- ✅ wxt framework configured
- ✅ React and TypeScript set up
- ✅ Basic entry points created (popup, options, background)
- ✅ Static assets migrated
- ✅ Build system working

### TODO: Complete Migration

The following components from the original Vue.js app need to be converted to React:

1. **Account Management**
   - Entry list and display
   - Add/Edit account forms
   - OTP code generation and display

2. **Authentication**
   - Password setup
   - Encryption/decryption

3. **Backup & Sync**
   - Dropbox integration
   - Google Drive integration
   - OneDrive integration

4. **Advanced Features**
   - QR code scanning
   - Account search and filtering
   - Drag-and-drop reordering
   - Import/Export

5. **State Management**
   - Migrate from Vuex to React Context/Redux/Zustand
   - Port all store modules

6. **Utilities**
   - Port remaining utility functions from `src/models/`
   - Time synchronization
   - OTP generation algorithms

## Technologies

- **Framework**: [wxt](https://wxt.dev/) - Next-gen web extension framework
- **UI**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite (via wxt)
- **Styling**: CSS

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT