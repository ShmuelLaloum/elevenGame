import { create } from 'zustand';

interface UIStore {
  isNavbarVisible: boolean;
  setNavbarVisible: (visible: boolean) => void;
  shouldRestartMatchmaking: boolean;
  setShouldRestartMatchmaking: (should: boolean) => void;
  
  purchaseModal: {
    isOpen: boolean;
    item: any | null;
    onConfirm: (() => void) | null;
  };
  openPurchaseModal: (item: any, onConfirm: () => void) => void;
  closePurchaseModal: () => void;
  
  alertModal: {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info';
  };
  openAlertModal: (title: string, message: string, type?: 'error' | 'warning' | 'info') => void;
  closeAlertModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isNavbarVisible: true,
  setNavbarVisible: (visible) => set({ isNavbarVisible: visible }),
  shouldRestartMatchmaking: false,
  setShouldRestartMatchmaking: (should) => set({ shouldRestartMatchmaking: should }),
  
  purchaseModal: {
    isOpen: false,
    item: null,
    onConfirm: null,
  },
  openPurchaseModal: (item, onConfirm) => set({
    purchaseModal: { isOpen: true, item, onConfirm }
  }),
  closePurchaseModal: () => set({
    purchaseModal: { isOpen: false, item: null, onConfirm: null }
  }),
  
  alertModal: {
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  },
  openAlertModal: (title, message, type = 'info') => set({
    alertModal: { isOpen: true, title, message, type }
  }),
  closeAlertModal: () => set({
    alertModal: { isOpen: false, title: '', message: '', type: 'info' }
  }),
}));
