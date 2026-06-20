import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApiPost } from '../hooks/Apis hooks/useApi';
import { MessageIcon, UserIcon, EmailIcon, CheckCircleIcon } from '../components/atoms/icons';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const contactMutation = useApiPost(
    ['contact'],
    () => {
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    },
    false,
    () => setApiError('حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى.')
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    contactMutation.mutate({ path: '/ContactUs/send', data: formData });
  };

  return (
    <section className="relative min-h-screen py-20 px-6 lg:px-20 bg-gradient-to-r from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden rounded-3xl">

      <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <motion.div
        className="relative max-w-6xl mx-auto space-y-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Title */}
        <div className="text-center space-y-5">
          <div className="inline-flex justify-center items-center w-28 h-28 rounded-3xl bg-emerald-50 dark:bg-emerald-900/30 shadow-xl">
            <MessageIcon className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            تواصل معنا
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            نحن هنا لمساعدتك في أي استفسار. ارسل رسالتك وسنقوم بالرد عليك في أقرب وقت.
          </p>
        </div>

        {/* Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-gray-900 rounded-3xl blur-3xl opacity-60"></div>

          <motion.div
            className="relative backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-4xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >

            
            <div
              className="
                absolute inset-0
                bg-[url('/images/logos.png')]
                bg-no-repeat
                bg-center
                bg-contain
                opacity-5
                pointer-events-none
              "
            />

            {/* CONTENT */}
            <div className="relative z-10">

              {isSubmitted ? (
                <div className="text-center space-y-7 py-16">
                  <CheckCircleIcon className="h-24 w-24 mx-auto text-emerald-500 animate-pulse" />
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">شكرًا لك!</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      تم استلام رسالتك بنجاح وسنرد عليك قريبًا.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-8 py-4 rounded-xl text-lg font-bold text-emerald-900 bg-gradient-to-r from-emerald-400 to-emerald-50 hover:from-emerald-300 hover:to-emerald-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 mx-auto block"
                  >
                    تواصل مع ثانية مرة أخرى
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-9">

                  <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'الاسم الكامل', name: 'name', type: 'text', icon: UserIcon, placeholder: 'Ex: John Doe' },
                      { label: 'البريد الإلكتروني', name: 'email', type: 'email', icon: EmailIcon, placeholder: 'name@example.com' },
                    ].map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.name} className="space-y-3">
                          <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">{field.label}</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-5 text-gray-400 group-focus-within:text-emerald-500 transition">
                              <Icon className="h-5 w-5" />
                            </div>
                            <input
                              type={field.type}
                              name={field.name}
                              placeholder={field.placeholder}
                              required
                              value={(formData as any)[field.name]}
                              onChange={handleChange}
                              className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 pr-14 text-sm dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">الموضوع</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="موضوع رسالتك"
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 text-sm dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">رسالتك لثانية</label>
                    <textarea
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="اكتب رسالتك هنا..."
                      className="w-full min-h-[160px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 text-sm dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 resize-none"
                    />
                  </div>

                  {apiError && (
                    <p className="text-sm text-red-500 font-medium">{apiError}</p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={contactMutation.isPending}
                      className="px-8 py-4 rounded-xl text-lg font-bold text-emerald-900 bg-gradient-to-r from-emerald-400 to-emerald-50 hover:from-emerald-300 hover:to-emerald-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-60"
                    >
                      {contactMutation.isPending ? 'جاري الإرسال...' : 'تواصل مع ثانية'}
                    </button>
                  </div>

                </form>
              )}

            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ContactPage;