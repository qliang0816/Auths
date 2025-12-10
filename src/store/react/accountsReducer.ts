// Accounts reducer for managing OTP accounts
export interface AccountsState {
  entries: any[];
  filter: string;
  showSearch: boolean;
  shouldShowPassphrase: boolean;
  defaultEncryption?: string;
  encryption: any;
  initComplete: boolean;
}

export type AccountsAction = 
  | { type: 'updateCodes' }
  | { type: 'setEntries'; payload: any[] }
  | { type: 'setFilter'; payload: string }
  | { type: 'showSearch' }
  | { type: 'hideSearch' }
  | { type: 'stopFilter' }
  | { type: 'initComplete' }
  | { type: 'setShouldShowPassphrase'; payload: boolean }
  | { type: 'setDefaultEncryption'; payload: string }
  | { type: 'setEncryption'; payload: any };

const initialState: AccountsState = {
  entries: [],
  filter: '',
  showSearch: false,
  shouldShowPassphrase: false,
  initComplete: false,
  encryption: null,
};

export function accountsReducer(state = initialState, action: AccountsAction): AccountsState {
  switch (action.type) {
    case 'updateCodes':
      // Update OTP codes for all entries
      return {
        ...state,
        entries: state.entries.map(entry => ({
          ...entry,
          code: generateOTPCode(entry) // This would be implemented
        }))
      };
    
    case 'setEntries':
      return {
        ...state,
        entries: action.payload
      };
    
    case 'setFilter':
      return {
        ...state,
        filter: action.payload
      };
    
    case 'showSearch':
      return {
        ...state,
        showSearch: true
      };
    
    case 'hideSearch':
      return {
        ...state,
        showSearch: false
      };
    
    case 'stopFilter':
      return {
        ...state,
        filter: ''
      };
    
    case 'initComplete':
      return {
        ...state,
        initComplete: true
      };
    
    case 'setShouldShowPassphrase':
      return {
        ...state,
        shouldShowPassphrase: action.payload
      };
    
    case 'setDefaultEncryption':
      return {
        ...state,
        defaultEncryption: action.payload
      };
    
    case 'setEncryption':
      return {
        ...state,
        encryption: action.payload
      };
    
    default:
      return state;
  }
}

// Helper function to generate OTP code (placeholder)
function generateOTPCode(entry: any): string {
  // This would implement the actual OTP generation logic
  return '123456';
}