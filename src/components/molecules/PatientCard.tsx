import React from 'react';
import type { Patient } from '../../types';

interface PatientCardProps {
  patient: Patient;
  onSelect?: (patient: Patient) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onSelect }) => {
  const getAge = (dob: string) => {
    const birth = new Date(dob);
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / 31557600000);
  };

  return (
    <div
      onClick={() => onSelect?.(patient)}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <img
          src={patient.avatarUrl || '/images/default-avatar.png'}
          alt={patient.name}
          className="w-14 h-14 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{patient.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getAge(patient.dateOfBirth)} years old
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;
