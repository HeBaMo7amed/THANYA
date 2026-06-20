export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  avatarUrl: string;
  contact: { phone: string; email: string; address: string; };
  primaryPhysician: string;
  insuranceProvider: string;
}

export type UserRole = 'admin' | 'user';

export interface User {
  uid: string;
  name: string;
  email: string;
  role?: UserRole;
  bandId?: string;
  dob?: string;
  gender?: string;
  height?: string;
  weight?: string;
  createdAt?: any;
}

export interface MedicalRecord {
  id?: string;
  allergies?: string[];
  bloodType?: string;
  currentMedicines?: string[];
  pastSurgeries?: string[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
}

export enum AllergySeverity { Mild = 'خفيفة', Moderate = 'متوسطة', Severe = 'شديدة' }

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: AllergySeverity;
}

export interface Vital {
  date: string;
  bloodPressure: string;
  heartRate: number;
  respiratoryRate: number;
  temperature: number;
}

export interface LabResult {
  id: string;
  testName: string;
  value: string;
  referenceRange: string;
  date: string;
  status: 'طبيعي' | 'غير طبيعي' | 'قيد الانتظار';
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  reason: string;
  status: 'مجدول' | 'مكتمل' | 'ملغي';
}

export interface Device {
  id: string;
  name: string;
  model: string;
  status: 'متصل' | 'غير متصل';
  lastSync: string;
  imageUrl: string;
}
