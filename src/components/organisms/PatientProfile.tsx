import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Patient, Medication, Allergy, Vital, LabResult, Appointment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import PatientHeader from '../molecules/PatientHeader';
import TabNavigation from '../molecules/TabNavigation';
import SummaryTab from './SummaryTab';
import MedicationsTab from './MedicationsTab';
import AllergiesTab from './AllergiesTab';
import VitalsTab from './VitalsTab';
import { SummaryIcon, MedicationIcon, AllergyIcon, VitalsIcon, ArrowRightIcon } from '../atoms/icons';

interface PatientProfileProps {
  patient?: Patient | null;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patient }) => {
  const navigate = useNavigate();
  const { medicalRecord } = useAuth();

  const [activeTab, setActiveTab] = useState('summary');

  const medications: Medication[] = [];
  const allergies: Allergy[] = [];
  const vitals: Vital[] = [];
  const labResults: LabResult[] = [];
  const appointments: Appointment[] = [];

  const tabs = useMemo(() => [
    { id: 'summary', label: 'الملخص', icon: SummaryIcon },
    { id: 'medications', label: 'الأدوية', icon: MedicationIcon },
    { id: 'allergies', label: 'الحساسية', icon: AllergyIcon },
    { id: 'vitals', label: 'العلامات الحيوية', icon: VitalsIcon },
  ], []);

  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <SummaryTab
            patient={patient}
            appointments={appointments.slice(0, 2)}
          />
        );
      case 'medications':
        return <MedicationsTab medications={medications} />;
      case 'allergies':
        return <AllergiesTab allergies={allergies} />;
      case 'vitals':
        return <VitalsTab vitals={vitals} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-14 text-sm text-gray-400">
            اختر تبويبًا لعرض التفاصيل الطبية
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-10 py-8 space-y-8">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition"
        >
          <ArrowRightIcon className="w-5 h-5" />
          العودة إلى لوحة التحكم
        </button>
      </div>

      {patient ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 overflow-hidden transition">
          <PatientHeader patient={patient} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
            ملفي الطبي
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl leading-relaxed">
            عرض وتحديث السجلات الطبية الشخصية والتحكم في المعلومات الصحية بسهولة وأمان.
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition">
        <div className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60 backdrop-blur-xl">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        <div className="p-6 sm:p-8 lg:p-10 min-h-[280px] transition-all duration-300">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
