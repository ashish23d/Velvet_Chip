import React from 'react';

interface AdminPlaceholderPageProps {
    title: string;
}

const AdminPlaceholderPage: React.FC<AdminPlaceholderPageProps> = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-white p-12 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
            <p className="mt-2 text-lg text-gray-500">This feature is under construction.</p>
            <div className="mt-8">
                <svg className="w-24 h-24 text-primary opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            </div>
            <p className="mt-8 text-gray-400">Check back soon!</p>
        </div>
    );
};

export default AdminPlaceholderPage;
