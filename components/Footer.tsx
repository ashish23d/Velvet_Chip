import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import Logo from './icons/Logo.tsx';
import FacebookIcon from './icons/FacebookIcon.tsx';
import InstagramIcon from './icons/InstagramIcon.tsx';
import TwitterIcon from './icons/TwitterIcon.tsx';
import AmazonIcon from './icons/AmazonIcon.tsx';
import FlipkartIcon from './icons/FlipkartIcon.tsx';
import MyntraIcon from './icons/MyntraIcon.tsx';
import WebsiteIcon from './icons/WebsiteIcon.tsx';
import { GooglePlayBadge, AppStoreBadge } from './icons/StoreBadges.tsx';
import SupabaseMedia from './SupabaseMedia.tsx';
import { BUCKETS } from '../constants.ts';


const Footer: React.FC = () => {
    const { addSubscriber, categories, siteContent, siteSettings } = useAppContext();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const footerDesc = siteContent.find(c => c.id === 'footer_description')?.data?.text;
    const subscribeText = siteContent.find(c => c.id === 'footer_subscribe_text')?.data?.text;
    const socialLinks = siteContent.find(c => c.id === 'social_links')?.data || {};


    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            await addSubscriber(email);
            setMessage('Thank you for subscribing!');
            setEmail('');
        } catch (error: any) {
            setMessage(error.message || 'An error occurred.');
        }
    };

    const popularCategories = categories.slice(0, 5);

    const allPlatforms = [
        { key: 'facebook', icon: <FacebookIcon className="h-5 w-5" />, label: 'Facebook' },
        { key: 'instagram', icon: <InstagramIcon className="h-5 w-5" />, label: 'Instagram' },
        { key: 'twitter', icon: <TwitterIcon className="h-5 w-5" />, label: 'Twitter' },
        { key: 'amazon', icon: <AmazonIcon className="h-5" />, label: 'Amazon' },
        { key: 'flipkart', icon: <FlipkartIcon className="h-5" />, label: 'Flipkart' },
        { key: 'myntra', icon: <MyntraIcon className="h-5 text-gray-700 dark:text-gray-300" />, label: 'Myntra' },
        { key: 'website', icon: <WebsiteIcon className="h-5 text-gray-700 dark:text-gray-300" />, label: 'Website' },
    ];

    const activeSocials = allPlatforms.filter(p => ['facebook', 'instagram', 'twitter'].includes(p.key) && socialLinks[p.key]);
    const activeMarketplaces = allPlatforms.filter(p => ['amazon', 'flipkart', 'myntra', 'website'].includes(p.key) && socialLinks[p.key]);

    // Use dynamic logo if set
    const renderLogo = () => {
        if (siteSettings?.logoType === 'text') {
            return (
                <span className="text-xl font-bold" style={{
                    fontFamily: siteSettings.fontFamily || 'sans-serif',
                    color: siteSettings.primaryColor
                }}>
                    {siteSettings.textLogo || 'Velvet Chip'}
                </span>
            );
        } else if (siteSettings?.activeLogoPath) {
            return (
                <SupabaseMedia
                    bucket={BUCKETS.SITE_ASSETS}
                    imagePath={siteSettings.activeLogoPath}
                    alt="Logo"
                    className="h-10 w-auto object-contain"
                />
            );
        }
        return <Logo className="h-10 w-auto text-primary" />;
    };

    return (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 transition-colors duration-200 pt-10 pb-6">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-8">
                    {/* Column 1: Brand & Desc */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            {renderLogo()}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
                            {footerDesc || "Experience premium shopping with our curated collection."}
                        </p>

                        <div className="pt-2 flex gap-4">
                            {activeSocials.map(p => (
                                <a key={p.key} href={socialLinks[p.key]} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                                    {p.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Links 1 */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm tracking-wide">SHOP</h4>
                        <ul className="space-y-2">
                            {popularCategories.map(cat => (
                                <li key={cat.id}><ReactRouterDOM.Link to={`/category/${cat.id}`} className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">{cat.name}</ReactRouterDOM.Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Links 2 */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm tracking-wide">SUPPORT</h4>
                        <ul className="space-y-2">
                            <li><ReactRouterDOM.Link to="/contact" className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">Contact Us</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/help-and-returns" className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">Shipping & Returns</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">Privacy Policy</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/terms-and-conditions" className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">Terms of Service</ReactRouterDOM.Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter & App */}
                    <div className="lg:col-span-1">
                        {siteSettings?.showAppSection && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm tracking-wide">DOWNLOAD OUR APP</h4>
                                <div className="space-y-3">
                                    {siteSettings.showAndroidBadge && siteSettings.androidAppLink && (
                                        <a href={siteSettings.androidAppLink} target="_blank" rel="noreferrer" className="block w-32 hover:opacity-80 transition-opacity">
                                            {siteSettings.androidBadgeImg ? (
                                                <SupabaseMedia
                                                    bucket={BUCKETS.SITE_ASSETS}
                                                    imagePath={siteSettings.androidBadgeImg}
                                                    alt="Get it on Google Play"
                                                    className="w-full h-auto"
                                                />
                                            ) : (
                                                <GooglePlayBadge className="w-full h-auto" />
                                            )}
                                        </a>
                                    )}
                                    {siteSettings.showIosBadge && siteSettings.iosAppLink && (
                                        <a href={siteSettings.iosAppLink} target="_blank" rel="noreferrer" className="block w-32 hover:opacity-80 transition-opacity">
                                            {siteSettings.iosBadgeImg ? (
                                                <SupabaseMedia
                                                    bucket={BUCKETS.SITE_ASSETS}
                                                    imagePath={siteSettings.iosBadgeImg}
                                                    alt="Download on the App Store"
                                                    className="w-full h-auto"
                                                />
                                            ) : (
                                                <AppStoreBadge className="w-full h-auto" />
                                            )}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm tracking-wide">NEWSLETTER</h4>
                            <form onSubmit={handleSubscribe} className="space-y-2">
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-1 top-1 bottom-1 px-3 bg-primary text-white text-xs font-medium rounded hover:bg-pink-700 transition-colors"
                                    >
                                        Join
                                    </button>
                                </div>
                                {message && <p className="text-xs text-primary">{message}</p>}
                            </form>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-400 text-center sm:text-left">
                        &copy; {new Date().getFullYear()} {siteSettings?.textLogo || 'Velvet Chip'}. All Rights Reserved.
                    </p>
                    <div className="flex gap-4">
                        {activeMarketplaces.length > 0 && activeMarketplaces.map(p => (
                            <a key={p.key} href={socialLinks[p.key]} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title={`Shop on ${p.label}`}>
                                {p.icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;