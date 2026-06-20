import React from 'react';
import type { Allergy } from '../../types';
import { AllergyIcon } from '../atoms/icons';

interface AllergiesTabProps {
  allergies: Allergy[];
}

const AllergiesTab: React.FC<AllergiesTabProps> = ({ allergies }) => {
  if (allergies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <AllergyIcon className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">لا توجد حساسية مسجلة</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {allergies.map((allergy) => {
        const severityColor =
          allergy.severity === 'شديدة'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            : allergy.severity === 'متوسطة'
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';

        return (
          <div key={allergy.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-start">
              <p className="font-semibold text-gray-900 dark:text-white">{allergy.allergen}</p>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${severityColor}`}>
                {allergy.severity}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{allergy.reaction}</p>
          </div>
        );
      })}
    </div>
  );
};

export default AllergiesTab;
