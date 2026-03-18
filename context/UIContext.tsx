import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types.ts';

interface UIContextType {
    // Offer Modal
    isOfferModalOpen: boolean;
    openOfferModal: () => void;
    closeOfferModal: () => void;

    // Cart Animation
    isCartShaking: boolean;
    setIsCartShaking: (shaking: boolean) => void;
    flyToCartItem: { product: Product; startRect: DOMRect } | null;
    triggerFlyToCartAnimation: (product: Product, startElement: HTMLElement) => void;
    setAnimationItem: (item: any) => void;

    // Confirmation Modal
    confirmationState: {
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        isDestructive: boolean;
        isConfirming: boolean;
        onConfirm: () => void;
    };
    showConfirmationModal: (options: {
        title: string;
        message: string;
        confirmText?: string;
        isDestructive?: boolean;
        onConfirm: () => void;
    }) => void;
    closeConfirmationModal: () => void;

    // Review Modal
    reviewModalState: { isOpen: boolean; product: Product | null };
    openReviewModal: (product: Product) => void;
    closeReviewModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- Offer Modal ---
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    // --- Cart Animation ---
    const [isCartShaking, setIsCartShaking] = useState(false);
    const [flyToCartItem, setFlyToCartItem] = useState<{ product: Product; startRect: DOMRect } | null>(null);

    const triggerFlyToCartAnimation = (product: Product, startElement: HTMLElement) => {
        const rect = startElement.getBoundingClientRect();
        setFlyToCartItem({ product, startRect: rect });
        setIsCartShaking(true);
        setTimeout(() => setIsCartShaking(false), 1000);
    };

    // --- Confirmation Modal ---
    const [confirmationState, setConfirmationState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        isDestructive: false,
        isConfirming: false,
        onConfirm: () => { }
    });

    const showConfirmationModal = (options: any) => {
        setConfirmationState({
            ...confirmationState,
            ...options,
            isOpen: true,
            isConfirming: false
        });
    };

    const closeConfirmationModal = () => {
        setConfirmationState(prev => ({ ...prev, isOpen: false }));
    };

    // --- Review Modal ---
    const [reviewModalState, setReviewModalState] = useState<{ isOpen: boolean; product: Product | null }>({
        isOpen: false,
        product: null
    });

    const openReviewModal = (product: Product) => setReviewModalState({ isOpen: true, product });
    const closeReviewModal = () => setReviewModalState({ isOpen: false, product: null });


    const value = {
        isOfferModalOpen,
        openOfferModal: () => setIsOfferModalOpen(true),
        closeOfferModal: () => setIsOfferModalOpen(false),

        isCartShaking,
        setIsCartShaking,
        flyToCartItem,
        setAnimationItem: setFlyToCartItem,
        triggerFlyToCartAnimation,

        confirmationState,
        showConfirmationModal,
        closeConfirmationModal,

        reviewModalState,
        openReviewModal,
        closeReviewModal
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
