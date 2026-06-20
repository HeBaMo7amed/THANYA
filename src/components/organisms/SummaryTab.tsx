import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { updateMedicalRecord } from '../../lib/firebase';
import type { Patient, Appointment } from '../../types';
import { EditIcon } from '../atoms/icons';

interface SummaryTabProps {
  patient?: Patient | null;
  appointments?: Appointment[];
}

const SummaryTab: React.FC<SummaryTabProps> = ({ patient, appointments }) => {
  const { medicalRecord, user } = useAuth();
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (field: string, currentValue: string) => {
    setEditField(field);
    setEditValue(currentValue);
  };

  const handleSave = async () => {
    if (!editField || !user) return;
    try {
      await updateMedicalRecord(user.uid, { [editField]: editValue });
      setEditField(null);
    } catch (err) {
      console.error('Error updating medical record:', err);
    }
  };

  const infoItems = [
    { label: 'فصيلة الدم', value: medicalRecord?.bloodType || 'غير محدد', field: 'bloodType' },
    { label: 'الحساسية', value: medicalRecord?.allergies?.join('، ') || 'لا يوجد', field: 'allergies' },
    { label: 'الأدوية الحالية', value: medicalRecord?.currentMedicines?.join('، ') || 'لا يوجد', field: 'currentMedicines' },
    { label: 'العمليات السابقة', value: medicalRecord?.pastSurgeries?.join('، ') || 'لا يوجد', field: 'pastSurgeries' },
  ];

  return (
    <div className="space-y-8">
      {/* Patient Basic Info */}
      {patient && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'رقم الملف', value: patient.id },
            { label: 'تاريخ الميلاد', value: patient.dateOfBirth },
            { label: 'الجنس', value: patient.gender },
            { label: 'الطبيب المعالج', value: patient.primaryPhysician },
            { label: 'التأمين', value: patient.insuranceProvider },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Medical Record */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">السجل الطبي</h3>
        <div className="space-y-3">
          {infoItems.map((item) => (
            <div key={item.field} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                {editField === item.field ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <button onClick={handleSave} className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">حفظ</button>
                    <button onClick={() => setEditField(null)} className="text-xs bg-gray-400 text-white px-2 py-1 rounded">إلغاء</button>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</p>
                )}
              </div>
              <button onClick={() => handleEdit(item.field, item.value)} className="text-gray-400 hover:text-emerald-600 transition">
                <EditIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Appointments */}
      {appointments && appointments.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">المواعيد القادمة</h3>
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div key={appt.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{appt.reason}</p>
                  <p className="text-xs text-gray-500">{appt.doctor} — {appt.date}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  appt.status === 'مؤكد' ? 'bg-emerald-100 text-emerald-700' :
                  appt.status === 'قيد الانتظار' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryTab;
