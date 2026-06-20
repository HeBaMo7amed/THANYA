import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, LogOut, Menu, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import logo from '/images/logos.png';
import { useApiGet, useApiPost } from '../../hooks/Apis hooks/useApi';

const publicLinks = [
  { path: '/store', label: 'المتجر' },
  { path: '/about', label: 'عن ثانية' },
  { path: '/contact', label: 'اتصل بنا' },
];

const protectedLinks = [
  { path: '/dashboard', label: 'لوحة التحكم' },
  { path: '/devices', label: 'الأجهزة' },
  { path: '/sos', label: 'الطوارئ' },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { setUser, user, logout, isloggingOut } = useAuth();

  const logoutMutation = useApiPost(['logout']);

  const { data: sosHistoryData } = useApiGet(
    '/sos/history',
    {},
    ['sosHistory', user?.id],
    !!user && user?.role === 'User'
  );

  const unresolvedSosCount = useMemo(() => {
    console.log('sosHistoryData1', sosHistoryData)

    if (!sosHistoryData)
      return []
    console.log('sosHistoryData2', sosHistoryData)
    const sosHistoryList = Array.isArray(sosHistoryData?.history)
      ? sosHistoryData.history
      : [sosHistoryData];

    console.log('sosHistoryList', sosHistoryList);
    return sosHistoryList.filter((item: any) => item?.resolved === false).length;


  }, [sosHistoryData])


  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenu, setAvatarMenu] = useState(false);

  const { darkMode, toggleTheme } = useTheme();

  const navButton =
    'relative px-3 py-2 text-sm font-medium transition-all duration-300 hover:text-emerald-500 dark:hover:text-emerald-400 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-500 hover:after:w-full after:transition-all';

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="backdrop-blur-2xl bg-white/70 dark:bg-gray-800/70 border-b border-white/20 shadow-xl">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-4 cursor-pointer group"
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="w-12 h-12 rounded-2xl overflow-hidden bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center"
          >
            <img
              src={logo}
              className="w-10 h-10 object-contain"
              alt="ثانية"
            />
          </motion.div>

          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ثانية
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6 text-gray-600 dark:text-gray-300">

          {/* Public Links */}
          {publicLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setAvatarMenu(false);
              }}
              className={`${navButton} ${isActive(link.path)
                ? 'text-emerald-500 after:w-full'
                : ''
                }`}
            >
              {link.label}
            </button>
          ))}

          {/* Protected Links */}
          {(user && !isloggingOut) &&
            protectedLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setAvatarMenu(false);
                }}
                className={`${navButton} ${isActive(link.path)
                  ? 'text-emerald-500 after:w-full'
                  : ''
                  }`}
              >
                {link.label}
              </button>
            ))}

          {/* Theme Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:scale-105 transition"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notification */}
          {user && user.role === 'User' && (
            < button
              type="button"
              onClick={() => {
                if (unresolvedSosCount > 0) {
                  navigate('/sos');
                }
              }}
              className="relative inline-flex items-center rounded-xl p-2 text-gray-600 hover:text-emerald-500 transition dark:text-gray-300"
            >
              <Bell size={20} />
              {unresolvedSosCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[0.65rem] font-bold text-white">
                  {unresolvedSosCount > 99 ? '99+' : unresolvedSosCount}
                </span>
              )}
            </button>
          )}
          {/* User */}
          {user ? (
            <div className="relative">

              <button
                onClick={() => setAvatarMenu(!avatarMenu)}
                className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white"
              >
                <User size={18} />
              </button>

              <AnimatePresence>
                {avatarMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-3 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-3 flex flex-col gap-2"
                  >
                    <button

                      onClick={() => {
                        logoutMutation.mutate(
                          {
                            path: '/Account/Logout',
                            data: {},
                          },
                          {
                            onSuccess: () => {
                              logout();
                              navigate('/auth');
                            },
                            onError: () => {
                              logout();
                              navigate('/auth');
                            },
                          }
                        );
                      }}
                    >
                      تسجيل الخروج
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-emerald-900 font-semibold shadow-md transition"
            >
              تسجيل الدخول
            </button>
          )}
        </div>

        {/* Mobile: Bell + Hamburger */}
        < div className="lg:hidden flex items-center gap-2">
          {user && user.role === 'User' && (
            <button
              type="button"
              onClick={() => {
                if (unresolvedSosCount > 0) {
                  navigate('/sos');
                  setMobileMenuOpen(false);
                }
              }}
              className="relative inline-flex items-center rounded-xl p-2 text-gray-600 hover:text-emerald-500 transition dark:text-gray-300"
            >
              <Bell size={20} />
              {unresolvedSosCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[0.65rem] font-bold text-white">
                  {unresolvedSosCount > 99 ? '99+' : unresolvedSosCount}
                </span>
              )}
            </button>
          )}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden px-6 pb-6 flex flex-col gap-4 text-gray-600 dark:text-gray-300 overflow-hidden"
          >

            {/* Public Links */}
            {publicLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
              >
                {link.label}
              </button>
            ))}

            {/* Protected Links */}
            {((user && !isloggingOut)) &&
              protectedLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </button>
              ))}

            {/* Theme */}
            <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} className="text-left">
              {darkMode ? 'الوضع الفاتح ☀️' : 'الوضع الداكن 🌙'}
            </button>

            {/* Auth */}
            {user ? (
              <button
                onClick={() => {
                  logoutMutation.mutate(
                    {
                      path: '/Account/Logout',
                      data: {},
                    },
                    {
                      onSuccess: () => {

                        logout();
                        navigate('/auth');
                        setMobileMenuOpen(false);
                      },
                      onError: () => {

                        logout();
                        navigate('/auth');
                        setMobileMenuOpen(false);
                      },
                    }
                  );
                }}
                className="text-red-500"
              >
                تسجيل الخروج
              </button>
            ) : (
              <button
                onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}
                className="text-emerald-600 dark:text-emerald-400 font-semibold"
              >
                تسجيل الدخول
              </button>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default Navbar;