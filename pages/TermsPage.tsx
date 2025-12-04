import React from 'react';
import { useAppContext } from '../context/AppContext.tsx';

const defaultTermsHtml = `
  <h2 class="text-3xl font-serif text-gray-900">Terms and Conditions</h2>
  <p class="text-lg text-gray-600">Welcome to Awaany! These terms and conditions outline the rules and regulations for the use of Awaany's Website.</p>

  <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Awaany if you do not agree to take all of the terms and conditions stated on this page.</p>

  <h3 class="text-2xl font-serif text-gray-800 pt-4">Cookies</h3>
  <p>We employ the use of cookies. By accessing Awaany, you agreed to use cookies in agreement with the Awaany's Privacy Policy.</p>
  <p>Most interactive websites use cookies to let us retrieve the user’s details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.</p>

  <h3 class="text-2xl font-serif text-gray-800 pt-4">License</h3>
  <p>Unless otherwise stated, Awaany and/or its licensors own the intellectual property rights for all material on Awaany. All intellectual property rights are reserved. You may access this from Awaany for your own personal use subjected to restrictions set in these terms and conditions.</p>
  <p><b>You must not:</b></p>
  <ul class="list-disc list-inside space-y-1 pl-4">
      <li>Republish material from Awaany</li>
      <li>Sell, rent or sub-license material from Awaany</li>
      <li>Reproduce, duplicate or copy material from Awaany</li>
      <li>Redistribute content from Awaany</li>
  </ul>
`;

const TermsPage: React.FC = () => {
  const { siteContent } = useAppContext();
  const termsContentHtml = siteContent.find(c => c.id === 'terms_page_content')?.data?.html || defaultTermsHtml;

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="prose prose-lg max-w-4xl mx-auto"
          dangerouslySetInnerHTML={{ __html: termsContentHtml }}
        />
      </div>
    </div>
  );
};

export default TermsPage;