import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApiPost, useApiPut } from '../hooks/Apis hooks/useApi';
import ErrorScreen from "../components/atoms/ErrorScreen";
import LoadingScreen from "../components/atoms/LoadingScreen";
import { useAuth } from '../context/AuthContext';
import { SiSession } from 'react-icons/si';
import { Eye, EyeOff } from 'lucide-react';




/* ─── Helper function to create FormData from form object ─── */
const createFormData = (basicData: any, medicalData: any): FormData => {
  const formData = new FormData();

  // Add basic fields
  Object.entries(basicData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  // Add medical fields
  Object.entries(medicalData).forEach(([key, value]) => {
    if (key === 'MedicalImages' && Array.isArray(value)) {
      // Add each file with the same field name
      value.forEach((file: File) => {
        formData.append('MedicalImages', file);
      });
    } else if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  return formData;
};
/* ─── Types ─── */
type Mode = 'login' | 'register1' | 'register2';

interface BasicForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  gender: string;
}

interface MedicalForm {
  bloodType: string;
  chronicDiseases: string;
  allergies: string;
  currentMedication: string;
  status: string;
  weight: string;
  Summery: string;
  MedicalImages: File[];
}

/* ─── Reusable Field ─── */
const Field: React.FC<{
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string | null;
  onWheel?: React.WheelEventHandler<HTMLInputElement>;
}> = ({ label, type = 'text', value, onChange, placeholder, required, error }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 text-start ">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
      placeholder={placeholder}
      required={required}
      className={`w-full rounded-2xl border 
        ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-emerald-500'} 
        bg-white dark:bg-gray-800 px-5 py-4 text-sm outline-none 
        transition-all duration-300 hover:border-emerald-300 dark:text-white focus:ring-2 
        ${type === 'file' && "file:border file:rounded-4xl file:px-4 file:p-0.5 file:relative file:top-0.5 file:right-1.5 file:cursor-pointerfile:transition-colors file:duration-300 "}`}
    />
    {error && <p className="text-xs text-red-500 font-medium pt-0.5">{error}</p>}

  </div>
);

/* ─── File Field (for multiple files) ─── */
const FileField: React.FC<{
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  placeholder?: string;
  error?: string | null;
  accept?: string;
}> = ({ label, files, onChange, placeholder, error, accept = "image/*,.pdf,.doc,.docx" }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 text-start ">
      {label}
    </label>
    <input
      type="file"
      multiple
      accept={accept}
      onChange={(e) => onChange(Array.from(e.target.files || []))}
      placeholder={placeholder}
      className={`w-full rounded-2xl border 
        ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-emerald-500'} 
        bg-white dark:bg-gray-800 px-5 py-4 text-sm outline-none 
        transition-all duration-300 hover:border-emerald-300 dark:text-white focus:ring-2 
        file:border-0 file:bg-emerald-50 dark:file:bg-emerald-900/20 file:text-emerald-700 dark:file:text-emerald-300 file:rounded-lg file:px-4 file:py-2 file:cursor-pointer file:transition-all file:duration-300 file:hover:bg-emerald-100 dark:file:hover:bg-emerald-900/40 file:font-semibold`}
    />
    {files.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-2">
        {files.map((file, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg text-xs text-emerald-700 dark:text-emerald-300">
            <span className="truncate max-w-xs">{file.name}</span>
            <button
              type="button"
              onClick={() => onChange(files.filter((_, i) => i !== idx))}
              className="font-bold hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    )}
    {error && <p className="text-xs text-red-500 font-medium pt-0.5">{error}</p>}
  </div>
);

/* ─── Password Field with show/hide toggle ─── */
const PasswordField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string | null;
}> = ({ label, value, onChange, placeholder, required, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 text-start mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-2xl border ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-emerald-500'} bg-white dark:bg-gray-800 px-5 py-4 pr-12 text-sm outline-none transition-all duration-300 hover:border-emerald-300 dark:text-white focus:ring-2`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
          tabIndex={-1}
          aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium pt-0.5">{error}</p>
      )}
    </div>
  );
};

/* ─── Select Field ─── */
const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}> = ({ label, value, onChange, options }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-[56px] appearance-none rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 dark:text-white"    >
      <option value="">اختر...</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

/* ─── Step Indicator ─── */
const StepDot: React.FC<{ active: boolean; done: boolean; label: string }> = ({
  active,
  done,
  label,
}) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${done
        ? 'bg-emerald-500 text-white'
        : active
          ? 'bg-emerald-600 text-white ring-4 ring-emerald-200'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
        }`}
    >
      {done ? '✓' : active ? '●' : '○'}
    </div>
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
  </div>
);

/* ═══════════════════════════════════════════
   AuthPage
═══════════════════════════════════════════ */
const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, setIsLoggingOut } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("token");
  sessionStorage.setItem('targetUserId', targetUserId || '');
  const from = (location.state as any)?.from?.pathname || '/dashboard';


  const initialMode = (location.state as any)?.mode || 'login';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  /* Login state */
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  /* Register step 1 */
  const [basic, setBasic] = useState<BasicForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
    gender: '',
  });

  /* Register step 2 */
  const [medical, setMedical] = useState<MedicalForm>({
    bloodType: '',
    chronicDiseases: '',
    allergies: '',
    currentMedication: '',
    status: '',
    weight: '',
    Summery: '',
    MedicalImages: [],
  });

  const setB = (k: keyof BasicForm) => (v: string) =>
    setBasic((prev) => ({ ...prev, [k]: v }));

  const setM = (k: keyof MedicalForm) => (v: string | File[]) => {
    if (Array.isArray(v)) {
      // Handle file array (for MedicalImages)
      setMedical((prev) => ({ ...prev, [k]: v }));
    } else {
      // Handle string values
      setMedical((prev) => ({ ...prev, [k]: v }));
    }
  };

  /* ── API mutations ── */
  /* ── API mutations ── */
  const loginMutation = useApiPost(['auth']);
  const registerMutation = useApiPost(['auth']);
  const medicalMutation = useApiPut(['auth']);

  /* ── Handlers ── */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    loginMutation.mutate(
      {
        path: '/Account/Login',
        data: {
          email: loginEmail,
          password: loginPassword,
        },
      },
      {
        onSuccess: (data: any) => {
          const id = data?.data?.user?.id
          sessionStorage.setItem('id', id);
          setUser(data?.data?.user ?? data);
          setIsLoggingOut(false);
          navigate(from, { replace: true });

        },
        onError: () => {
          setError('بيانات تسجيل الدخول غير صحيحة');
        },
      }
    );
  };

  const handleRegister1 = (e: React.FormEvent) => {
    e.preventDefault();

    let valid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(basic.email)) {
      setEmailError("البريد الإلكتروني غير صحيح");
      valid = false;
    } else {
      setEmailError(null);
    }

    // Phone: optional leading "+", digits only, max 15 digits
    // Phone: optional leading "+", digits only, min 11 digits, max 15 digits
    const phoneDigits = basic.phoneNumber.replace(/^\+/, '');
    const phoneHasInvalidChars = /[^0-9]/.test(phoneDigits);

    if (
      phoneHasInvalidChars ||
      phoneDigits.length < 11 ||
      phoneDigits.length > 15
    ) {
      setPhoneError(
        "Phone number must contain only digits and be between 11 and 15 digits"
      );
      valid = false;
    } else {
      setPhoneError(null);
    }

    if (!valid) return;



    // setUser(data?.user ?? data);
    setMode('register2');
    // registerMutation.mutate(
    //   {
    //     path: '/Account/Register',
    //     data: {
    //       ...basic,
    //       bloodType: medical.bloodType,
    //       chronicDiseases: medical.chronicDiseases,
    //       allergies: medical.allergies,
    //       currentMedication: medical.currentMedication,
    //       status: medical.status,
    //     },
    //   },
    //   {
    //     onSuccess: (data: any) => {
    //       setUser(data?.user ?? data);
    //       setMode('register2'); 
    //     },
    //     onError: (err: any) => {
    //       console.log("REGISTER ERROR:", err?.response?.data || err);
    //       setError(
    //         err?.response?.data?.message ||
    //         'حدث خطأ أثناء التسجيل، تحقق من البيانات'
    //       );
    //     }
    //   }
    // );
  };

  const handleRegister2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (fileError) return;

    // Create FormData if there are files, otherwise use regular object
    const hasFiles = medical.MedicalImages && medical.MedicalImages.length > 0;
    const data = createFormData(basic, medical);

    registerMutation.mutate(
      {
        path: '/Account/Register',
        data: data,
      },
      {
        onSuccess: (data: any) => {
          const id = data?.data?.user?.id
          sessionStorage.setItem('id', id);
          setUser(data?.data?.user ?? data);
          setIsLoggingOut(false);
          navigate('/dashboard', { replace: true });
        },
        onError: (err: any) => {
          console.log("REGISTER ERROR:", registerMutation.error);
          setError(
            err?.response?.data?.message ||
            'حدث خطأ أثناء التسجيل، تحقق من البيانات'
          );
        }
      }
    );
  };

  const handleSkip = () => {
    // Create FormData if there are files, otherwise use regular object
    const hasFiles = medical.MedicalImages && medical.MedicalImages.length > 0;
    const data = createFormData(basic, medical);

    registerMutation.mutate(
      {
        path: '/Account/Register',
        data: data,
      },
      {
        onSuccess: (data: any) => {
          const id = data?.data?.user?.id
          sessionStorage.setItem('id', id);
          setUser(data?.data?.user ?? data);
          setIsLoggingOut(false);
          navigate('/dashboard', { replace: true });
        },
        onError: (err: any) => {
          console.log("REGISTER ERROR:", err?.response?.data || err);
          setError(
            err?.response?.data?.message ||
            'حدث خطأ أثناء التسجيل، تحقق من البيانات'
          );
        }
      }
    );
  };
  const isPending =
    loginMutation.isPending || registerMutation.isPending || medicalMutation.isPending;

  /* ── Animation variants ── */
  const pageVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl relative">

        {/* Glow bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 to-teal-100/30 dark:from-emerald-900/30 dark:to-gray-900 rounded-3xl blur-3xl opacity-60" />

        <div className="relative backdrop-blur-2xl bg-white/95 dark:bg-gray-800/95 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-2xl p-8 md:p-10">

          {/* Steps indicator (register only) */}
          {(mode === 'register1' || mode === 'register2') && (
            <div className="flex items-center justify-center gap-6 mb-8">
              <StepDot active={mode === 'register1'} done={mode === 'register2'} label="البيانات الأساسية" />
              <div className="w-16 h-0.5 bg-gray-200 dark:bg-gray-700 rounded" />
              <StepDot active={mode === 'register2'} done={false} label="السجل الطبي" />
            </div>
          )}

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 dark:text-white tracking-tight mb-8">
            {mode === 'login' && 'تسجيل الدخول'}
            {mode === 'register1' && 'إنشاء حساب – الخطوة الأولى'}
            {mode === 'register2' && 'البيانات الطبية'}
          </h2>

          <AnimatePresence mode="wait">

            {/* ─── LOGIN ─── */}
            {mode === 'login' && (
              <motion.form
                key="login"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-6"
              >
                <Field label="البريد الإلكتروني" type="email" value={loginEmail} onChange={setLoginEmail} placeholder=' example@example.com' required />
                <PasswordField label="كلمة المرور" value={loginPassword} onChange={setLoginPassword} placeholder='Enter your password' required />
                {/* <p className=' text-red-300 d-none '>خطأ في البريد الإلكتروني او كلمة المرور </p> */}
                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-lg font-bold shadow-xl transition-all duration-300 hover:scale-[1.01]"
                >
                  {isPending ? 'جاري الدخول...' : 'تسجيل الدخول'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  ليس لديك حساب؟{' '}
                  <button
                    type="button"
                    onClick={() => { setError(null); setMode('register1'); }}
                    className="text-emerald-600 font-semibold underline hover:opacity-80"
                  >
                    إنشاء حساب جديد
                  </button>
                </p>
              </motion.form>
            )}

            {/* ─── REGISTER STEP 1 ─── */}
            {mode === 'register1' && (
              <motion.form
                key="register1"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister1}
                className="space-y-5"
              >
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="الاسم الأول" value={basic.firstName} onChange={setB('firstName')} placeholder="أدخل الاسم الأول" required />
                  <Field label="الاسم الأخير" value={basic.lastName} onChange={setB('lastName')} placeholder="أدخل الاسم الأخير" required />
                  <Field label="البريد الإلكتروني" type="text" value={basic.email} onChange={(v) => { setB('email')(v); setEmailError(null); }} placeholder="example@example.com" required error={emailError} />
                  <PasswordField
                    label="كلمة المرور"
                    value={basic.password}
                    onChange={(v) => {
                      setB('password')(v);
                      if (v.length > 0 && v.length < 9) {
                        setPasswordError("Password must be at least 9 characters and can contain letters, numbers, or both");
                      } else {
                        setPasswordError(null);
                      }
                    }}
                    placeholder="9 أحرف أو أكثر (حروف أو أرقام أو الاثنين)"
                    required
                    error={passwordError}
                  />
                  <Field label="تاريخ الميلاد" type="date" value={basic.dateOfBirth} onChange={setB('dateOfBirth')} required />
                  <Field
                    label="رقم الهاتف"
                    type="tel"
                    value={basic.phoneNumber}
                    onChange={(v) => {
                      // Keep optional leading "+" then strip non-digit chars
                      const hasPlus = v.startsWith('+');
                      const digitsOnly = v.replace(/[^0-9]/g, '');
                      // Enforce max 15 digits
                      const trimmed = digitsOnly.slice(0, 15);
                      const finalValue = hasPlus ? '+' + trimmed : trimmed;
                      setB('phoneNumber')(finalValue);
                      // Real-time error: flag if remaining non-digit/non-plus chars were present
                      const invalidCharsPresent = /[^0-9+]/.test(v) || (v.indexOf('+') > 0);
                      if (invalidCharsPresent) {
                        setPhoneError("Phone number must contain valid digits only (maximum 15 digits)");
                      } else {
                        setPhoneError(null);
                      }
                    }}
                    placeholder="+20..."
                    required
                    error={phoneError}
                  />
                  <div className="md:col-span-2">
                    <Field label="العنوان" value={basic.address} onChange={setB('address')} placeholder="المدينة، الشارع..." required />
                  </div>
                  <SelectField
                    label="الجنس"
                    value={basic.gender}
                    onChange={setB('gender')}
                    options={[
                      { label: 'ذكر', value: 'male' },
                      { label: 'أنثى', value: 'female' },
                    ]}
                  />
                </div>

                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-lg font-bold shadow-xl transition-all duration-300 hover:scale-[1.01]"
                >
                  {isPending ? 'جاري التسجيل...' : 'التالي ←'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  لديك حساب؟{' '}
                  <button
                    type="button"
                    onClick={() => { setError(null); setMode('login'); }}
                    className="text-emerald-600 font-semibold underline hover:opacity-80"
                  >
                    تسجيل الدخول
                  </button>
                </p>
              </motion.form>
            )}

            {/* ─── REGISTER STEP 2 (Medical) ─── */}
            {mode === 'register2' && (
              <motion.form
                key="register2"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister2}
                className="space-y-5"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                  أضف بياناتك الطبية لتسهيل التعامل في حالات الطوارئ.
                  يمكنك تخطي هذه الخطوة وإكمالها لاحقاً من لوحة التحكم.
                </p>

                <div className="grid md:grid-cols-2 gap-5 ">

                  <SelectField
                    label="فصيلة الدم"
                    value={medical.bloodType}
                    onChange={setM('bloodType')}
                    options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => ({ label: b, value: b }))}
                  />
                  <Field
                    label="الوزن"
                    type="text"
                    value={medical.weight}
                    onChange={(v) => setM('weight')(v.replace(/[^0-9]/g, ''))}
                    placeholder="مثال : 70"
                  />
                  {/* <SelectField
                    label="الحالة الصحية"
                    value={medical.status}
                    onChange={setM('status')}
                    options={[
                      { label: 'مستقر', value: 'stable' },
                      { label: 'يحتاج متابعة', value: 'monitoring' },
                      { label: 'حرج', value: 'critical' },
                    ]}
                  /> */}
                  <div className="md:col-span-2">
                    <Field label="الأمراض المزمنة" value={medical.chronicDiseases} onChange={setM('chronicDiseases')} placeholder="مثال : السكري، ضغط الدم..." />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="الحساسية" value={medical.allergies} onChange={setM('allergies')} placeholder="مثال : البنسلين، الفول السوداني..." />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="الأدوية الحالية" value={medical.currentMedication} onChange={setM('currentMedication')} placeholder="مثال : ميتفورمين 500mg..." />
                  </div>
                  <div className="md:col-span-2">
                    <FileField
                      label="ملحقات طبية"
                      files={medical.MedicalImages}
                      onChange={(files) => {
                        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
                        const validFiles: File[] = [];
                        let hasInvalid = false;
                        files.forEach((file) => {
                          if (allowedTypes.includes(file.type)) {
                            validFiles.push(file);
                          } else {
                            hasInvalid = true;
                          }
                        });
                        if (hasInvalid) {
                          setFileError("Only images or PDF files are allowed");
                        } else {
                          setFileError(null);
                        }
                        setM('MedicalImages')(validFiles);
                      }}
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      error={fileError}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 text-start mb-1.5">ملخص الحالة الصحية</label>
                    <textarea
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-4 text-sm outline-none transition-all duration-300 hover:border-emerald-300 dark:text-white focus:ring-2 focus:ring-emerald-500 resize-vertical min-h-32 focus:border-emerald-500"
                      value={medical.Summery}
                      placeholder="اكتب هنا ملخص حالتك الصحية ..."
                      onChange={(e) => setM('Summery')(e.target.value)}
                    />
                  </div>

                </div>

                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setError(null); setMode('register1'); }}
                    className="py-4 px-5 rounded-2xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
                  >
                    → رجوع
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="flex-1 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    تخطي الآن
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold shadow-xl transition-all duration-300 hover:scale-[1.01]"
                  >
                    {isPending ? 'جاري الحفظ...' : 'حفظ والدخول'}
                  </button>
                </div>
              </motion.form>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;