import React from 'react';
import { ShieldOff } from 'lucide-react';

const AccessDenied: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <ShieldOff size={64} className="text-red-400 mb-6" />
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        لا تملك صلاحية الوصول
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">
        ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع المسؤول.
      </p>
    </div>
  );
};

export default AccessDenied;
