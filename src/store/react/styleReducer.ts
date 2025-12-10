// Style reducer for managing UI style settings
export interface StyleState {
  info: boolean;
  menuShown: boolean;
}

export type StyleAction = 
  | { type: 'showInfo' }
  | { type: 'hideInfo' }
  | { type: 'setInfo'; payload: boolean }
  | { type: 'showMenu' }
  | { type: 'hideMenu' }
  | { type: 'setMenuShown'; payload: boolean };

const initialState: StyleState = {
  info: false,
  menuShown: false,
};

export function styleReducer(state = initialState, action: StyleAction): StyleState {
  switch (action.type) {
    case 'showInfo':
      return {
        ...state,
        info: true
      };
    
    case 'hideInfo':
      return {
        ...state,
        info: false
      };
    
    case 'setInfo':
      return {
        ...state,
        info: action.payload
      };
    
    case 'showMenu':
      return {
        ...state,
        menuShown: true
      };
    
    case 'hideMenu':
      return {
        ...state,
        menuShown: false
      };
    
    case 'setMenuShown':
      return {
        ...state,
        menuShown: action.payload
      };
    
    default:
      return state;
  }
}