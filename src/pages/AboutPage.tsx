import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Shield, Activity } from "lucide-react";

const features = [
  {
    icon: <Heart size={28} className="text-emerald-600" />,
    title: "متابعة لحظية",
    description: "متابعة حالة المرضى والمسنين بشكل مستمر وتنبيهات فورية عند الطوارئ.",
  },
  {
    icon: <Shield size={28} className="text-emerald-600" />,
    title: "أمان وخصوصية",
    description: "حماية البيانات الصحية للمستخدمين مع التزام صارم بالخصوصية.",
  },
  {
    icon: <Activity size={28} className="text-emerald-600" />,
    title: "حلول ذكية",
    description: "استخدام أحدث تقنيات الذكاء الاصطناعي لتحليل البيانات وتقديم تقارير دقيقة.",
  },
];

const AboutPage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative overflow-hidden py-24 px-6 lg:px-20 rounded-3xl bg-gradient-to-r from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div
        className="absolute top-0 left-0 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      />
      <div
        className="absolute top-1/3 right-0 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl"
        style={{ transform: `translateY(${scrollY * -0.15}px)` }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl"
        style={{ transform: `translateY(${scrollY * 0.25}px)` }}
      />

      <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-800 dark:text-white leading-tight">
            عن منصة <span className="text-emerald-600">ثانية</span>
          </h1>

          <p className="mt-6 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            منصة "ثانية" هي نظام ذكي لمتابعة المرضى وكبار السن عن بعد، حيث تساعد الأطباء والعائلات على مراقبة الحالة الصحية بسهولة وإرسال تنبيهات فورية في حالات الطوارئ.
          </p>

          <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            نحن فريق من المبتكرين في مجال التكنولوجيا الصحية، ملتزمون بتقديم حلول ذكية تجعل الرعاية الصحية أكثر شفافية، أمانًا وكفاءة للجميع.
          </p>
        </motion.div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1 }}
          whileHover={{ scale: 1.07, y: -5 }}
        >
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop"
            alt="Healthcare illustration"
            className="w-full max-w-[600px] rounded-xl drop-shadow-2xl transition-transform duration-500"
            style={{ transform: `translateY(${scrollY * -0.05}px)` }}
          />
        </motion.div>
      </div>

      <motion.div
        className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.2 } },
        }}
      >
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg flex gap-4 items-start cursor-pointer hover:scale-105 hover:shadow-2xl transition-transform duration-300"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div className="flex-shrink-0">{f.icon}</div>
            <div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">{f.title}</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">{f.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default AboutPage;
