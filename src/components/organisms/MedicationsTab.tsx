import React from 'react';
import type { Medication } from '../../types';
import { MedicationIcon } from '../atoms/icons';

interface MedicationsTabProps {
  medications: Medication[];
}

const MedicationsTab: React.FC<MedicationsTabProps> = ({ medications }) => {
  if (medications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <MedicationIcon className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">لا توجد أدوية مسجلة</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-right pb-3 font-semibold text-gray-600 dark:text-gray-300">اسم الدواء</th>
            <th className="text-right pb-3 font-semibold text-gray-600 dark:text-gray-300">الجرعة</th>
            <th className="text-right pb-3 font-semibold text-gray-600 dark:text-gray-300">التكرار</th>
            <th className="text-right pb-3 font-semibold text-gray-600 dark:text-gray-300">تاريخ البداية</th>
          </tr>
        </thead>
        <tbody>
          {medications.map((med) => (
            <tr key={med.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-4 font-medium text-gray-900 dark:text-white">{med.name}</td>
              <td className="py-4 text-gray-600 dark:text-gray-400">{med.dosage}</td>
              <td className="py-4 text-gray-600 dark:text-gray-400">{med.frequency}</td>
              <td className="py-4 text-gray-600 dark:text-gray-400">{med.startDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MedicationsTab;
