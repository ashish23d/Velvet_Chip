
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient.ts';
import Logo from '../components/icons/Logo.tsx';
import { useAppContext } from '../context/AppContext.tsx';

const ResetPasswordPage: React.FC = () => {
    const { session, isLoading: isAppLoading } = useAppContext();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // This page is only accessible when the user has a temporary session from the recovery link.
    // If there's no session, redirect to the forgot password page.
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!session) {
                console.log("No session found for password recovery, redirecting.");
                navigate('/forgot-password');
            }
        }, 1500); // Give context a moment to load the session

        return () => clearTimeout(timer);
    }, [session, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password should be at least 6 characters long.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setMessage(null);

        // This updates the password and elevates the temporary session to a full, permanent session.
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
            setIsLoading(false); // Only stop loading on error
        } else {
            setMessage('Your password has been updated successfully! Redirecting to login page...');

            // Sign out the user so they can log in with their new password
            await supabase.auth.signOut();

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    };

    const commonInputClasses = "mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

    if (isAppLoading || !session) {
        return (
            <div className="flex h-screen items-center justify-center bg-pink-50/30 dark:bg-gray-900">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 font-medium text-gray-600 dark:text-gray-400">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-160px)] bg-pink-50/30 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8 sm:p-12">
                    <div className="text-center mb-6">
                        <Logo className="h-14 sm:h-16 w-auto text-primary mx-auto" />
                    </div>

                    <h2 className="text-2xl font-serif text-center text-gray-800 dark:text-white">Set a New Password</h2>

                    {message ? (
                        <div className="mt-8 text-center">
                            <p className="text-green-700 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">{message}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className={commonInputClasses} />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                                <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" className={commonInputClasses} />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-pink-700 disabled:bg-gray-400 transition-colors">
                                {isLoading ? 'Saving...' : 'Set New Password'}
                            </button>
                        </form>
                    )}
                    {error && <p className="mt-4 text-sm text-center text-red-600 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
