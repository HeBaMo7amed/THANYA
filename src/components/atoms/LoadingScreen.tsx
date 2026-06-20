import React from "react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">{message || "جاري التحميل..."}</p>
    </div>
  );
};

export default LoadingScreen;
