import React from 'react';
import { useAppContext } from '../context/AppContext.tsx';

const defaultPrivacyHtml = `
  <h2 class="text-3xl font-serif text-gray-900">Privacy Policy for Awaany</h2>
  <p class="text-lg text-gray-600">At Awaany, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Awaany and how we use it.</p>
  <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.</p>
  <h3 class="text-2xl font-serif text-gray-800 pt-4">Log Files</h3>
  <p>Awaany follows a standard procedure of using log files...</p>
`;

const PrivacyPolicyPage: React.FC = () => {
    const { siteContent } = useAppContext();
    const privacyContentHtml = siteContent.find(c => c.id === 'privacy_policy_page_content')?.data?.html || defaultPrivacyHtml;

    return (
        <div className="bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div
              className="prose prose-lg max-w-4xl mx-auto"
              dangerouslySetInnerHTML={{ __html: privacyContentHtml }}
            />
        </div>
        </div>
    );
};

export default PrivacyPolicyPage;