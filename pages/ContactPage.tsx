
import React, { useState } from 'react';
import { BuildingOffice2Icon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../context/AppContext.tsx';
import EditableWrapper from '../components/shared/EditableWrapper';

const ContactPage: React.FC = () => {
    const { contactDetails, submitContactForm, siteContent } = useAppContext();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const pageDescription = siteContent.find(c => c.id === 'contact_page_description')?.data?.text || "We'd love to hear from you! Whether you have a question about our products, an order, or anything else, our team is ready to answer all your questions.";

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
            setMessage('Your message has been sent successfully!');
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setStatus('idle'), 4000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Failed to send message. Please try again.');
            setTimeout(() => setStatus('idle'), 4000);
        }
    };
    
    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

    return (
        <div className="bg-gray-50/70 dark:bg-gray-900/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-serif font-bold text-primary">Get In Touch</h1>
                    <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                        {pageDescription}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Information */}
                    <div className="lg:col-span-1">
                        <EditableWrapper editUrl="/admin/settings#contact-settings">
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-8 h-full">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-3">
                                        <EnvelopeIcon className="w-6 h-6 text-primary"/>
                                        Email Us
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">Our team will get back to you within 24 hours.</p>
                                    <a href={`mailto:${contactDetails.email}`} className="text-primary font-medium hover:underline">{contactDetails.email}</a>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-3">
                                        <PhoneIcon className="w-6 h-6 text-primary"/>
                                        Call Us
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">Mon-Fri from 9am to 6pm.</p>
                                    <a href={`tel:${contactDetails.phone.replace(/\s/g, '')}`} className="text-primary font-medium hover:underline">{contactDetails.phone}</a>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-3">
                                        <BuildingOffice2Icon className="w-6 h-6 text-primary"/>
                                        Main Office
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">{contactDetails.address}</p>
                                </div>
                            </div>
                        </EditableWrapper>
                    </div>


                    {/* Contact Form */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={inputClasses} />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                                <textarea id="message" name="message" rows={4} value={formData.message} onChange={handleChange} required className={inputClasses}></textarea>
                            </div>
                            <div className="text-right">
                                {status === 'success' && <p className="text-green-600 text-sm text-left mb-2">{message}</p>}
                                {status === 'error' && <p className="text-red-600 text-sm text-left mb-2">{message}</p>}
                                <button type="submit" disabled={status === 'loading'} className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-pink-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
