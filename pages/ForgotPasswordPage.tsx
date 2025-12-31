
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient.ts';
import Logo from '../components/icons/Logo.tsx';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        // Use origin for redirect to avoid HashRouter duplication issues.
        // The PASSWORD_RECOVERY event in AppContext will handle the routing to /reset-password
        const redirectUrl = window.location.origin;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('If an account exists for this email, a password recovery link has been sent to your inbox.');
        }
        setIsLoading(false);
    };

    const commonInputClasses = "mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

    return (
        <div className="min-h-[calc(100vh-160px)] bg-pink-50/30 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8 sm:p-12">
                    <div className="text-center mb-6">
                        <Logo className="h-14 sm:h-16 w-auto text-primary mx-auto" />
                    </div>

                    <h2 className="text-2xl font-serif text-center text-gray-800 dark:text-white">Forgot Your Password?</h2>

                    {message ? (
                        <div className="mt-8 text-center">
                            <p className="text-green-700 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">{message}</p>
                            <Link to="/login" className="mt-6 inline-block font-medium text-primary hover:underline">
                                &larr; Back to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                                No worries! Enter your email and we'll send you a reset link.
                            </p>
                            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className={commonInputClasses} />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-pink-700 disabled:bg-gray-400 transition-colors">
                                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </form>
                            {error && <p className="mt-4 text-sm text-center text-red-600 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg">{error}</p>}
                            <div className="text-center mt-6">
                                <Link to="/login" className="text-sm font-medium text-primary hover:underline">
                                    &larr; Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
