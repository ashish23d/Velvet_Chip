
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import Logo from '../components/icons/Logo.tsx';
import GoogleIcon from '../components/icons/GoogleIcon.tsx';
import SupabaseImage from '../components/SupabaseImage.tsx';
import { BUCKETS, SITE_ASSETS } from '../constants.ts';

const LoginPage: React.FC = () => {
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { session, siteContent } = useAppContext();
  const navigate = ReactRouterDOM.useNavigate();
  const [searchParams] = ReactRouterDOM.useSearchParams();

  useEffect(() => {
    if (session) {
      const redirectPath = searchParams.get('redirect');
      let target = redirectPath ? decodeURIComponent(redirectPath) : '/';

      // Prevent infinite redirect loops if target is the login page itself
      if (target.startsWith('/login')) {
        target = '/';
      }

      navigate(target);
    }
  }, [session, navigate, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) setError(error.message);
    setIsLoading(false);
  };

  const handleOAuthLogin = async (provider: 'google') => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const loginContent = siteContent.find(c => c.id === 'login_page_settings')?.data;
  const heroImagePath = loginContent?.imagePath || SITE_ASSETS.LOGIN_HERO;
  const heroTitle = loginContent?.title || 'Elegance in Every Thread.';
  const heroDescription = loginContent?.description || 'Join our community and discover your signature style.';

  const commonInputClasses = "mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

  return (
    <div className="min-h-[calc(100vh-160px)] bg-pink-50/30 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">

        {/* Image Column */}
        <div className="hidden md:block relative">
          <SupabaseImage
            bucket={BUCKETS.SITE_ASSETS}
            imagePath={heroImagePath}
            alt="Login Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent p-8 flex flex-col justify-end">
            <h2 className="text-white text-3xl font-serif leading-tight drop-shadow-md">
              {heroTitle}
            </h2>
            <p className="text-white/80 mt-2 drop-shadow-sm">
              {heroDescription}
            </p>
          </div>
        </div>

        {/* Form Column */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="text-center mb-6">
            <Logo className="h-14 sm:h-16 w-auto text-primary mx-auto" />
          </div>

          {isRegisterView ? (
            // --- REGISTRATION FORM ---
            <div>
              <h2 className="text-2xl font-serif text-center text-gray-800 dark:text-white">Create an Account</h2>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                Already have an account?{' '}
                <button onClick={() => setIsRegisterView(false)} className="font-medium text-primary hover:underline">
                  Login here
                </button>
              </p>
              <form onSubmit={handleRegister} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="name-reg" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <input id="name-reg" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Doe" className={commonInputClasses} />
                </div>
                <div>
                  <label htmlFor="email-reg" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input id="email-reg" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className={commonInputClasses} />
                </div>
                <div>
                  <label htmlFor="password-reg" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <input id="password-reg" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className={commonInputClasses} />
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-pink-700 disabled:bg-gray-400 transition-colors">
                  {isLoading ? 'Creating Account...' : 'Register'}
                </button>
              </form>
            </div>
          ) : (
            // --- LOGIN FORM ---
            <div>
              <h2 className="text-2xl font-serif text-center text-gray-800 dark:text-white">Welcome Back!</h2>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                New to Awaany?{' '}
                <button onClick={() => setIsRegisterView(true)} className="font-medium text-primary hover:underline">
                  Create an account
                </button>
              </p>
              <form onSubmit={handleLogin} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="email-login" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input id="email-login" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className={commonInputClasses} />
                </div>
                <div>
                  <div className="flex justify-between items-baseline">
                    <label htmlFor="password-login" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <ReactRouterDOM.Link to="/forgot-password" tabIndex={-1} className="text-sm font-medium text-primary hover:underline">Forgot password?</ReactRouterDOM.Link>
                  </div>
                  <input id="password-login" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className={commonInputClasses} />
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-pink-700 disabled:bg-gray-400 transition-colors">
                  {isLoading ? 'Logging In...' : 'Login'}
                </button>
              </form>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-center text-red-600 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg">{error}</p>}

          {/* Social Login Section */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or</span>
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              <GoogleIcon className="w-5 h-5 mr-3" />
              Continue with Google
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">By continuing, you agree to our <ReactRouterDOM.Link to="/terms-and-conditions" className="underline">Terms</ReactRouterDOM.Link> and <ReactRouterDOM.Link to="/privacy-policy" className="underline">Privacy Policy</ReactRouterDOM.Link>.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
