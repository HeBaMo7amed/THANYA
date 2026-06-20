import React from 'react';
import type { Vital } from '../../types';
import { VitalsIcon } from '../atoms/icons';

interface VitalsTabProps {
  vitals: Vital[];
}

const VitalsTab: React.FC<VitalsTabProps> = ({ vitals }) => {
  if (vitals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <VitalsIcon className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">لا توجد علامات حيوية مسجلة</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-right pb-3 font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
            <th className="text-right pb-3 font-semibold text-gray-600 dark:text-gray-300">ضغط الدم</th>
            <th className="text-right pb-3 font-semibold text-gray-600 dark:text-gray-300">معدل القلب</th>
            <th className="text-right pb-3 font-semibold text-gray-600 dark:text-gray-300">معدل التنفس</th>
            <th className="text-right pb-3 font-semibold text-gray-600 dark:text-gray-300">درجة الحرارة</th>
          </tr>
        </thead>
        <tbody>
          {vitals.map((vital, idx) => (
            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-4 font-medium text-gray-900 dark:text-white">{vital.date}</td>
              <td className="py-4 text-gray-600 dark:text-gray-400">{vital.bloodPressure}</td>
              <td className="py-4 text-gray-600 dark:text-gray-400">{vital.heartRate}</td>
              <td className="py-4 text-gray-600 dark:text-gray-400">{vital.respiratoryRate}</td>
              <td className="py-4 text-gray-600 dark:text-gray-400">{vital.temperature}°C</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VitalsTab;
