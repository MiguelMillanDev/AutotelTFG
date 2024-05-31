import { create } from 'zustand';

export interface SearchQuery {
    country?: string;
    checkIn?: Date;
    checkOut?: Date;
    numSpaces?: number;
    vehicleType?: string;
    features?: string[];
    category?: string;
    title?: string; // Agregar el campo title
}

interface SearchModalStore {
    isOpen: boolean;
    step: 'location' | 'checkin' | 'checkout' | 'details';
    query: SearchQuery;
    open: (step: 'location' | 'checkin' | 'checkout' | 'details') => void;
    close: () => void;
    setQuery: (query: SearchQuery) => void;
}

const useSearchModal = create<SearchModalStore>((set) => ({
    isOpen: false,
    step: 'location',
    query: {},
    open: (step) => set({ isOpen: true, step }),
    close: () => set({ isOpen: false }),
    setQuery: (query) => set({ query })
}));

export default useSearchModal;
