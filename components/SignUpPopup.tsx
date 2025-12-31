import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import Logo from './icons/Logo.tsx';
import XIcon from './icons/XIcon.tsx';

const SignUpPopup: React.FC = () => {
  const { addSubscriber } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasShown = sessionStorage.getItem('signupPopupShown');
      if (!hasShown) {
        setIsOpen(true);
        sessionStorage.setItem('signupPopupShown', 'true');
      }
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setMessage('');
    setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setMessage('');

    try {
      await addSubscriber(email);
      setStatus('success');
      setMessage('Thank you for subscribing!');
      setEmail('');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'An error occurred. Please try again.');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div
        className="relative bg-white w-full max-w-lg mx-4 rounded-xl shadow-2xl p-8 text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-1/2 -right-1/4 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl"></div>

        <div className="relative z-10">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <XIcon className="h-6 w-6" />
          </button>

          <div className="flex justify-center">
            <Logo className="h-14 w-auto text-primary" />
          </div>

          <h2 className="text-2xl font-serif font-bold text-gray-800 mt-4">
            Join Our Family
          </h2>

          <p className="text-gray-600 mt-2 text-md max-w-sm mx-auto">
            Subscribe to our newsletter for exclusive offers, new arrivals, and a touch of elegance in your inbox.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
            <button type="submit" className="bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-pink-700 transition-colors flex-shrink-0">
              Subscribe
            </button>
          </form>

          <div className="h-5 mt-2">
            {status === 'success' && <p className="text-sm text-green-600">{message}</p>}
            {status === 'error' && <p className="text-sm text-red-600">{message}</p>}
          </div>

          <button onClick={handleClose} className="mt-4 text-xs text-gray-400 hover:underline">
            No, thanks
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPopup;