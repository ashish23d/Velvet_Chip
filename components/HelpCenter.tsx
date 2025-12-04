
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';

const faqs = [
    {
        q: "How do I track my order?",
        a: "You can track your order from the 'My Orders' section in your profile. Click on the order you want to track to see its current status and location."
    },
    {
        q: "What is your return policy?",
        a: "We offer a 7-day return policy for most items. The item must be unused, in its original packaging, and with all tags intact. You can initiate a return from the 'My Orders' section."
    },
    {
        q: "How can I change my shipping address?",
        a: "You can manage your shipping addresses in the 'My Addresses' section of your profile. Please note that you cannot change the shipping address for an order that has already been shipped."
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept all major credit/debit cards, UPI, various digital wallets, and Net Banking. Cash on Delivery (COD) is also available for most locations."
    }
];

const HelpCenter: React.FC = () => {
    const { currentUser, submitContactForm } = useAppContext();
    const [formData, setFormData] = useState({ 
        name: currentUser?.name || '', 
        email: currentUser?.email || '', 
        message: '' 
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');
        try {
            await submitContactForm(formData);
            setStatus('success');
            setMessage('Your message has been sent! We will get back to you shortly.');
            setFormData(prev => ({ ...prev, message: '' }));
            setTimeout(() => setStatus('idle'), 4000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Failed to send message. Please try again.');
        }
    };
    
    const inputClasses = "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-primary sm:text-sm placeholder-gray-400 dark:placeholder-gray-500";

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Frequently Asked Questions</h2>
                </div>
                <div className="p-6 space-y-4">
                    {faqs.map((faq, index) => (
                        <details key={index} className="group border-b dark:border-gray-700 last:border-b-0 pb-4">
                            <summary className="flex justify-between items-center cursor-pointer list-none">
                                <span className="font-medium text-gray-800 dark:text-white">{faq.q}</span>
                                <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform" />
                            </summary>
                            <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">{faq.a}</p>
                        </details>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Still Need Help?</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Send us a message and we'll get back to you.</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={inputClasses} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="message-help" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Message</label>
                        <textarea id="message-help" name="message" rows={4} value={formData.message} onChange={handleChange} required className={inputClasses}></textarea>
                    </div>
                    <div className="flex justify-end items-center gap-4">
                        {status === 'success' && <p className="text-sm text-green-600">{message}</p>}
                        {status === 'error' && <p className="text-sm text-red-600">{message}</p>}
                        <button type="submit" disabled={status === 'loading'} className="bg-primary text-white py-2 px-6 rounded-md text-sm font-medium hover:bg-pink-700 disabled:bg-gray-400 transition-colors">
                            {status === 'loading' ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HelpCenter;
