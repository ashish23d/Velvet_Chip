import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import {
    SiteSettings, ContactDetails, SiteContent, Slide,
    Announcement, EmailSettings, SeasonalEditCard,
    PaymentSettings, DeliverySettings, TaxSettings
} from '../types.ts';
import { INITIAL_SLIDES } from '../constants.ts';

interface SiteContextType {
    // Content & Appearance
    siteContent: SiteContent[];
    slides: Slide[];
    updateSiteContent: (content: SiteContent) => Promise<void>;
    updateSlides: (slides: Slide[]) => Promise<void>;
    updateAnnouncement: (announcement: Announcement) => Promise<void>;
    contactDetails: ContactDetails;
    updateContactDetails: (details: ContactDetails) => Promise<void>;

    // Settings
    siteSettings: SiteSettings | null;
    emailSettings: EmailSettings | null;
    paymentSettings: PaymentSettings | null; // Maybe keep here or move? It's settings.
    taxSettings: TaxSettings | null;
    deliverySettings: DeliverySettings | null;

    updateSiteSettings: (settings: SiteSettings) => Promise<void>;
    updateEmailSettings: (settings: EmailSettings) => Promise<void>;

    // Seasonal / Promotions (Content related)
    seasonalEditCards: SeasonalEditCard[];
    announcement: Announcement | null;

    // Admin Actions (Content)
    adminDeleteSiteAsset: (path: string) => Promise<void>;
    adminAddSeasonalCard: (card: any) => Promise<void>;
    adminUpdateSeasonalCard: (card: any) => Promise<void>;
    adminDeleteSeasonalCard: (id: string) => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- State ---
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
    const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
    const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [contactDetails, setContactDetailsState] = useState<ContactDetails>({
        address: '', phone: '', email: '', mapUrl: '',
        socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' }
    });
    const [seasonalEditCards, setSeasonalEditCards] = useState<SeasonalEditCard[]>([]);

    // TODO: Consider moving Payment/Tax/Delivery here if we want a full "SettingsContext"
    // For now, let's stick to the "Appearance/Content" focus + SiteSettings.
    // However, interface included them, so let's stub them or remove from interface if not moving yet.
    // User asked for "Appearance section not getting save", so purely content focus is safer for first step.
    // I will exclude Payment/Tax/Delivery from implementation for now to minimize risk, unless they are tightly coupled.
    // Actually, `siteSettings` often overlaps. Let's stick to the list in AppContext.

    // --- Fetchers ---
    const fetchSiteContent = async () => {
        const { data, error } = await supabase.from('site_content').select('*');
        if (error) console.error("Error fetching site content:", error);
        else {
            setSiteContent(data || []);
            // Hydrate derived state
            const settings = data?.find(c => c.id === 'site_settings')?.data;
            if (settings) setSiteSettings(settings as any);

            const contact = data?.find(c => c.id === 'contact_details')?.data;
            if (contact) setContactDetailsState(contact as any);

            const announcementData = data?.find(c => c.id === 'announcement')?.data;
            if (announcementData) setAnnouncement(announcementData as any);
        }
    };

    const fetchSlides = async () => {
        const { data } = await supabase.from('slides').select('*').order('ordering', { ascending: true });
        if (data && data.length > 0) {
            setSlides(data.map((s: any) => ({
                id: s.id,
                media: s.media || [],
                text: s.text || '',
                showText: s.show_text ?? true
            })));
        }
    };

    const fetchEmailSettings = async () => {
        const { data } = await supabase.from('email_settings').select('*').maybeSingle();
        if (data) setEmailSettings(data);
    };

    const fetchSeasonalCards = async () => {
        const { data } = await supabase.from('seasonal_edit_cards').select('*');
        if (data) setSeasonalEditCards(data);
    };

    // --- Actions ---
    const updateSiteContent = async (content: SiteContent) => {
        // Upsert to DB
        const { error } = await supabase.from('site_content').upsert({ id: content.id, data: content.data });
        if (error) throw error;

        // Update Local State
        setSiteContent(prev => {
            const exists = prev.some(c => c.id === content.id);
            if (exists) return prev.map(c => c.id === content.id ? content : c);
            return [...prev, content];
        });

        // Sync Helper States
        if (content.id === 'site_settings') setSiteSettings(content.data as any);
        if (content.id === 'contact_details') setContactDetailsState(content.data as any);
        if (content.id === 'announcement') setAnnouncement(content.data as any);
    };

    const updateSiteSettings = async (settings: SiteSettings) => {
        await updateSiteContent({ id: 'site_settings', data: settings });
    };

    const updateContactDetails = async (details: ContactDetails) => {
        await updateSiteContent({ id: 'contact_details', data: details });
    };

    const updateAnnouncement = async (announce: Announcement) => {
        await updateSiteContent({ id: 'announcement', data: announce });
    };

    const updateEmailSettings = async (settings: EmailSettings) => {
        const { error } = await supabase.from('email_settings').upsert({ ...settings, id: 1 });
        if (error) throw error;
        setEmailSettings(settings);
    };

    const updateSlides = async (newSlides: Slide[]) => {
        // 1. Delete existing (safe replacement strategy)
        const { data: existingData } = await supabase.from('slides').select('id');
        if (existingData && existingData.length > 0) {
            const ids = existingData.map(r => r.id);
            await supabase.from('slides').delete().in('id', ids);
        }

        // 2. Insert new
        if (newSlides.length > 0) {
            const { error } = await supabase.from('slides').insert(
                newSlides.map((s) => ({
                    id: s.id,
                    media: s.media,
                    text: s.text,
                    show_text: s.showText,
                }))
            );
            if (error) throw error;
        }
        setSlides(newSlides);
    };

    const adminDeleteSiteAsset = async (path: string) => {
        const { error } = await supabase.storage.from('site-assets').remove([path]);
        if (error) throw error;
    };

    const adminAddSeasonalCard = async (card: any) => {
        const { data, error } = await supabase.from('seasonal_edit_cards').insert(card).select().single();
        if (error) throw error;
        setSeasonalEditCards(prev => [...prev, data]);
    };

    const adminUpdateSeasonalCard = async (card: any) => {
        const { error } = await supabase.from('seasonal_edit_cards').update(card).eq('id', card.id);
        if (error) throw error;
        setSeasonalEditCards(prev => prev.map(c => c.id === card.id ? { ...c, ...card } : c));
    };

    const adminDeleteSeasonalCard = async (id: string) => {
        const { error } = await supabase.from('seasonal_edit_cards').delete().eq('id', id);
        if (error) throw error;
        setSeasonalEditCards(prev => prev.filter(c => c.id !== id));
    };

    // --- Effects ---
    useEffect(() => {
        const initSite = async () => {
            console.log('[Site] Initializing site data...');
            try {
                // Fire all fetches in parallel with individual catch blocks
                await Promise.all([
                    fetchSiteContent().catch(e => console.error('[Site] Content fetch failed:', e)),
                    fetchSlides().catch(e => console.error('[Site] Slides fetch failed:', e)),
                    fetchEmailSettings().catch(e => console.error('[Site] Email settings fetch failed:', e)),
                    fetchSeasonalCards().catch(e => console.error('[Site] Seasonal cards fetch failed:', e))
                ]);
                console.log('[Site] Site data initialization complete');
            } catch (e) {
                console.error('[Site] Global init error:', e);
            }
        };

        initSite();
    }, []);

    const value = {
        siteContent,
        slides,
        updateSiteContent,
        updateSlides,
        updateAnnouncement,
        contactDetails,
        updateContactDetails,
        siteSettings,
        emailSettings,
        paymentSettings: null, // Placeholder if needed
        taxSettings: null,     // Placeholder
        deliverySettings: null,// Placeholder
        updateSiteSettings,
        updateEmailSettings,
        seasonalEditCards,
        announcement,
        adminDeleteSiteAsset,
        adminAddSeasonalCard,
        adminUpdateSeasonalCard,
        adminDeleteSeasonalCard
    };

    return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export const useSite = () => {
    const context = useContext(SiteContext);
    if (!context) {
        throw new Error('useSite must be used within a SiteProvider');
    }
    return context;
};
