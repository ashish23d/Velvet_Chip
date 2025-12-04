import React from 'react';
import { User } from '../types';

interface ProfileCompletionProps {
  user: User;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ user }) => {
  const calculateCompletion = () => {
    let completedFields = 0;
    const totalFields = 5; // name, email, mobile, dob, gender

    if (user.name) completedFields++;
    if (user.email) completedFields++;
    if (user.mobile) completedFields++;
    if (user.dob) completedFields++;
    if (user.gender) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-800">Profile Completion</h3>
        <span className="text-sm font-bold text-primary">{completionPercentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProfileCompletion;