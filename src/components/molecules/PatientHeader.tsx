import React from 'react';
import type { Patient } from '../../types';
import { PhoneIcon, EmailIcon, LocationIcon } from '../atoms/icons';

interface PatientHeaderProps {
  patient: Patient;
}

const PatientHeader: React.FC<PatientHeaderProps> = ({ patient }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-6 p-6">
      <img
        src={patient.avatarUrl || '/images/default-avatar.png'}
        alt={patient.name}
        className="w-24 h-24 rounded-2xl object-cover shadow-md"
      />
      <div className="flex-1 space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.name}</h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <PhoneIcon className="w-4 h-4" /> {patient.contact.phone}
          </span>
          <span className="flex items-center gap-1">
            <EmailIcon className="w-4 h-4" /> {patient.contact.email}
          </span>
          <span className="flex items-center gap-1">
            <LocationIcon className="w-4 h-4" /> {patient.contact.address}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          الطبيب المعالج: {patient.primaryPhysician}
        </p>
      </div>
    </div>
  );
};

export default PatientHeader;
