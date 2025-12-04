
import React from 'react';
import ArrowTrendingUpIcon from '../icons/ArrowTrendingUpIcon.tsx';
import { ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface MetricCardProps {
    title: string;
    value: string;
    change: number; // e.g., 5.4 for +5.4% or -3.1 for -3.1%
    icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon }) => {
    const isPositive = change >= 0;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
                 <div className="flex items-center mt-2">
                    <span className={`flex items-center text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />}
                        <span className="ml-1">{Math.abs(change)}%</span>
                    </span>
                    <span className="text-xs text-gray-400 ml-2">vs last month</span>
                 </div>
            </div>
            <div className="bg-primary/10 text-primary p-3 rounded-full">
                {icon}
            </div>
        </div>
    );
};

export default MetricCard;