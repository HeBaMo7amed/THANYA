import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/molecules/Layout';
import ProtectedLayout from './components/molecules/ProtectedLayout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import DevicesPage from './pages/DevicesPage';
import SOSPage from './pages/SOSPage';
import StorePage from './pages/StorePage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import { useAuth } from './context/AuthContext';
import { useApiGet } from './hooks/Apis hooks/useApi';
import { useEffect } from 'react';
import LoadingScreen from './components/atoms/LoadingScreen';

const App: React.FC = () => {
  const { setUser, isloggingOut, setIsLoggingOut } = useAuth();
  const navigate = useNavigate();
  const {
    data: userData,isLoading
  } = useApiGet(
    "/Account/me",
    {},
    ["me"], !isloggingOut);
  console.log('userData', userData);
  // if (userData) {
  //   setUser(userData);
  //   setIsLoggingOut(false);
  // }
  // else {
  //   navigate("/auth")
  // }
  useEffect(() => {
  if (userData) {
    setUser(userData);
    setIsLoggingOut(false);
  }
}, [userData]);

if (isLoading) return <LoadingScreen/>;
return (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/store" element={<StorePage />} />

      {/* <Route element={<ProtectedLayout />}> */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/sos" element={<SOSPage />} />

      {/* </Route> */}
    </Route>
  </Routes>

);
};

export default App;
