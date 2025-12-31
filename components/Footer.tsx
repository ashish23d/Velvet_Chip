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


const Footer: React.FC = () => {
    const { addSubscriber, categories, siteContent } = useAppContext();
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
        { key: 'facebook', icon: <FacebookIcon className="h-6 w-6" />, label: 'Facebook' },
        { key: 'instagram', icon: <InstagramIcon className="h-6 w-6" />, label: 'Instagram' },
        { key: 'twitter', icon: <TwitterIcon className="h-6 w-6" />, label: 'Twitter' },
        { key: 'amazon', icon: <AmazonIcon className="h-6" />, label: 'Amazon' },
        { key: 'flipkart', icon: <FlipkartIcon className="h-6" />, label: 'Flipkart' },
        { key: 'myntra', icon: <MyntraIcon className="h-6 text-gray-700 dark:text-gray-300" />, label: 'Myntra' },
        { key: 'website', icon: <WebsiteIcon className="h-6 text-gray-700 dark:text-gray-300" />, label: 'Website' },
    ];

    const activeSocials = allPlatforms.filter(p => ['facebook', 'instagram', 'twitter'].includes(p.key) && socialLinks[p.key]);
    const activeMarketplaces = allPlatforms.filter(p => ['amazon', 'flipkart', 'myntra', 'website'].includes(p.key) && socialLinks[p.key]);

    return (
        <footer className="bg-gray-50 dark:bg-gray-950 border-t dark:border-gray-800 transition-colors duration-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Top Section: Newsletter and Logo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-6 border-b dark:border-gray-800">
                    <div className="md:col-span-1 space-y-4">
                        <Logo className="h-12 md:h-14 w-auto text-primary" />
                        {footerDesc ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{footerDesc}</p>
                        ) : (
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                            </div>
                        )}

                        {activeSocials.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold tracking-wider text-gray-700 dark:text-gray-300 uppercase mb-3">Follow Us</h4>
                                <div className="flex items-center gap-4">
                                    {activeSocials.map(platform => (
                                        <a key={platform.key} href={socialLinks[platform.key]} aria-label={`Awaany on ${platform.label}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:opacity-80 transition-opacity">
                                            {platform.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeMarketplaces.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold tracking-wider text-gray-700 dark:text-gray-300 uppercase mb-3">Also available on</h4>
                                <div className="flex items-center gap-4">
                                    {activeMarketplaces.map(platform => (
                                        <a key={platform.key} href={socialLinks[platform.key]} aria-label={`Awaany on ${platform.label}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:opacity-80 transition-opacity">
                                            {platform.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Stay Connected</h3>
                        {subscribeText ? (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{subscribeText}</p>
                        ) : (
                            <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                        )}
                        <form onSubmit={handleSubscribe} className="mt-4 flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                            />
                            <button type="submit" className="bg-primary text-white py-2 px-6 rounded-md font-medium hover:bg-pink-700 transition-colors">
                                Subscribe
                            </button>
                        </form>
                        {message && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>}
                    </div>
                </div>

                {/* Middle Section: Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Shop</h4>
                        <ul className="space-y-1.5">
                            {popularCategories.map(cat => (
                                <li key={cat.id}><ReactRouterDOM.Link to={`/category/${cat.id}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">{cat.name}</ReactRouterDOM.Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Company</h4>
                        <ul className="space-y-1.5">
                            <li><ReactRouterDOM.Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">About Us</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">Contact Us</ReactRouterDOM.Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Help & Support</h4>
                        <ul className="space-y-1.5">
                            <li><ReactRouterDOM.Link to="/help-and-returns" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">Shipping & Returns</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/profile" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">Track Your Order</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/coupons" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">Coupons</ReactRouterDOM.Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Legal</h4>
                        <ul className="space-y-1.5">
                            <li><ReactRouterDOM.Link to="/terms-and-conditions" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">Terms of Service</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/privacy-policy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">Privacy Policy</ReactRouterDOM.Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section: Copyright */}
                <div className="pt-6 border-t dark:border-gray-800 mt-6">
                    <p className="text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Velvet Chip. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;