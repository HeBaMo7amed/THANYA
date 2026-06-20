import React from 'react';

interface State {
  hasError: boolean;
  error?: any;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State;
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="max-w-xl p-6 bg-white rounded shadow">
            <h2 className="text-lg font-bold text-red-700">حدث خطأ أثناء تشغيل التطبيق</h2>
            <pre className="mt-2 text-sm text-gray-700">{String(this.state.error)}</pre>
            <p className="mt-4 text-sm text-gray-600">راجع وحدة التحكم (Console) للمزيد من التفاصيل.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
