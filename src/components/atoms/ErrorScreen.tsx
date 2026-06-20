import React from "react";

interface ErrorScreenProps {
  statusCode?: number;
  message?: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ statusCode, message: externalMessage }) => {
  let message = "";

  switch (statusCode) {
    case 400:
      message = "يوجد مشكلة في الطلب ، الرجاء التحقق من البيانات";
      break;
    case 401:
      message = "محتاج تسجيل دخول أو صلاحية";
      break;
    case 404:
      message = "لم يتم العثور علي البيانات المطلوبة ";
      break;
    case 500:
      message = "حدث خطأ في الخادم الرجاء المحاولة لاحقاً ";
      break;
    case 502:
      message = "استجابة غير صالحة من الخادم";
      break;
    case 503:
      message = "الخدمة غير متوفرة حاليا";
      break;
    case 504:
      message = "انتهت مهلة الخادم . حاول مرة اخري ";
      break;
    default:
      message = "حدث خطأ غير معروف الرجاء التحقق من الاتصال أو المحاولة لاحقاً";
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <p className="text-red-500 text-lg font-semibold">{externalMessage || "حدث خطأ أثناء تحميل البيانات"}</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
        رمز الخطأ: {statusCode || "Unknown"} — {message}
      </p>
    </div>
  );
};

export default ErrorScreen;
