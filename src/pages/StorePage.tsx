import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiGet, useApiPost, useApiPut, useApiDelete } from '../hooks/Apis hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiX, FiShoppingCart, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/atoms/LoadingScreen';
import ErrorScreen from '../components/atoms/ErrorScreen';
import { useQueryClient } from '@tanstack/react-query';


interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  inStock: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

type ToastType = { message: string; type: 'success' | 'error' | 'warning' };
const getNumericId = (id: string) => {
  return Number(id.replace('p', ''));
};
const StorePage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log('user : ', user)
  // جلب المنتجات
  const { data, isLoading, isError, error } = useApiGet('/Store/products', {}, ['products', user?.id]);
  const productsList: Product[] =
    data?.products?.map((p: any) => ({
      id: getNumericId(p.id),
      title: p.title,
      description: p.description,
      price: p.price,
      currency: p.currency,
      imageUrl: p.imageUrl,
      inStock: p.inStock,
    })) ?? [];

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<ToastType | null>(null);

  const addToCartMutation = useApiPost(['cart'], () => { });
  const updateCartMutation = useApiPut(['cart'], () => { });
  const deleteItemMutation = useApiDelete(['cart'], () => {
    showToast('تم حذف المنتج', 'success');
  });

  // 2. Mutation لإتمام الطلب والحصول على رابط الدفع
  const orderMutation = useApiPost(
    ['orders'],
    () => { },
    false,
    () => showToast('حدث خطأ أثناء تسجيل الطلب!', 'error')
  );
  const {
    data: cartData,
    isLoading: cartLoading,
    refetch: refetchCart,
  } = useApiGet('/Store/GetCatItem', {}, ['cart', user?.id], !!user);
  const cart =
    Array.isArray(cartData)
      ? cartData.map((item: any) => ({
        id: item.id,
        productId: item.productId ?? item.id,
        title: item.title,
        price: item.price,
        currency: item.currency,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
      }))
      : [];
  const showToast = (message: string, type: ToastType['type']) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  /* ── Cart helpers ── */
  const addToCart = (product: Product) => {
    if (!user) {
      showToast('يرجى تسجيل الدخول أولاً', 'warning');
      setTimeout(() => navigate('/auth'), 1200);
      return;
    }

    const exists = cart?.find((item: any) => item.productId === product.id);

    if (exists) {
      showToast('المنتج موجود بالفعل في السلة', 'warning');
      return;
    }

    addToCartMutation.mutate({
      path: `/Store/AddToCart?productId=${product.id}&quantity=1`,
      data: {},
    }, {
      onSuccess: () => {
        showToast('تم إضافة المنتج إلى السلة', 'success');
        queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      }
    });
  };
  const increase = (item: any) => {
    updateCartMutation.mutate({
      path: `/Store/cart/${item.productId}?quantity=${item.quantity + 1}`,
      data: {}
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      }
    });
  };
  const decrease = (item: any) => {
    if (item.quantity <= 1) {
      removeItem(item.productId);
      return;
    }

    updateCartMutation.mutate({
      path: `/Store/cart/${item.productId}?quantity=${item.quantity - 1}`,
      data: {}
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      }
    });
  };
  const removeItem = (productId: number) => {
    deleteItemMutation.mutate({
      path: `/Store/cart/${productId}`,
      data: {}
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      }
    });
  };
  const totalPrice = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const checkout = () => {
    orderMutation.mutate(
      {
        path: '/Store/Checkout',
        data: {},
      },
      {
        onSuccess: (res: any) => {
          const url = res?.sessionUrl || res?.data?.sessionUrl;
          refetchCart();
          if (url) {
            window.open(url, '_blank');
          } else {
            showToast("No checkout URL returned", "error");
          }

        },
        onError: () => {
          showToast('حدث خطأ أثناء الدفع!', 'error');
        }
      }
    );
  };

  if (isLoading) return <LoadingScreen message="جاري تحميل المنتجات..." />;
  if (isError) return <ErrorScreen statusCode={(error as any)?.status} />;

  return (
    <div className="relative overflow-hidden py-24 px-6 lg:px-20 rounded-3xl bg-gradient-to-r from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800">

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-4 text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
            متجر ثانية
          </h1>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            استعرض المنتجات الطبية المتاحة داخل المتجر مع تجربة عرض احترافية وسلسة.
          </p>
          {!user && (
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              سجّل الدخول لإضافة المنتجات إلى سلة الشراء
            </p>
          )}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {productsList.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.15 } }}
              className={`bg-white/80 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${product.inStock
                ? 'hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.35)]'
                : 'hover:shadow-[0_15px_30px_-5px_rgba(239,68,68,0.25)] opacity-75'
                }`}
            >
              {/* Image */}
              <div className="h-52 bg-white/80 dark:bg-gray-900/60 flex items-center justify-center p-4">
                <motion.img
                  src={product.imageUrl}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  {product.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 flex-grow line-clamp-3">
                  {product.description}
                </p>

                <div className="mt-4 flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {product.price} {product.currency}
                  </p>
                  <div className="flex items-center gap-3">
                    {/* Add to cart */}
                    <button
                      disabled={addToCartMutation.isPending}
                      onClick={() => addToCart(product)}
                      className={`p-3 rounded-full text-white transition shadow-md ${product.inStock
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-gray-400 cursor-not-allowed'
                        } ${addToCartMutation.isPending ? 'animate-pulse' : ''}`}
                    >
                      <FiShoppingCart />
                    </button>
                    {/* View details */}
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="p-3 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-md"
                    >
                      <FiEye />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Product Detail Modal ── */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl"
              >
                <FiX />
              </button>
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className="h-56 mx-auto object-contain"
              />
              <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-4">
                {selectedProduct.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{selectedProduct.description}</p>
              <p className="mt-4 text-lg font-bold text-gray-800 dark:text-gray-200">
                {selectedProduct.price} {selectedProduct.currency}
              </p>
              <p className={`mt-2 font-semibold ${selectedProduct.inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                {selectedProduct.inStock ? 'متوفر حالياً' : 'غير متوفر'}
              </p>
              <button
                disabled={addToCartMutation.isPending}
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                className="mt-6 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition disabled:opacity-50"
              >
                {addToCartMutation.isPending ? 'جاري الإضافة...' : 'إضافة إلى السلة'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cart Drawer ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
              className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white/95 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl z-50 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">السلة</h2>
                <button onClick={() => setCartOpen(false)}>
                  <FiX size={22} className="text-gray-500 hover:text-red-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {cart.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">السلة فارغة</p>
                ) : (
                  cart.map((item: any) => (
                    <div key={item.id} className="flex gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                      <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center p-1 shadow">
                        <img src={item.imageUrl} alt={item.title} className="max-h-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.price} {item.currency}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => decrease(item)} className="p-1 bg-gray-100 dark:bg-gray-700 rounded-lg"><FiMinus size={12} /></button>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{item.quantity}</span>
                          <button onClick={() => increase(item)} className="p-1 bg-gray-100 dark:bg-gray-700 rounded-lg"><FiPlus size={12} /></button>
                          <button onClick={() => removeItem(item.productId)} className="text-red-400 ml-auto"><FiTrash2 size={14} /></button>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 self-center">
                        {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    الإجمالي: {totalPrice.toFixed(2)}
                  </p>
                  <button
                    onClick={checkout}
                    disabled={orderMutation.isPending}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl transition shadow-md"
                  >
                    {orderMutation.isPending ? 'جاري توجيهك للدفع...' : 'إتمام الشراء'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Floating Cart Button ── */}
      <AnimatePresence>
        {!cartOpen && (
          <motion.button
            onClick={() => setCartOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-50 bg-emerald-700/70 backdrop-blur-sm text-white p-3 rounded-full shadow-lg border border-emerald-400/20 hover:bg-emerald-600 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
          >
            <div className="relative">
              <FiShoppingCart size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-20 right-10 text-sm px-5 py-3 rounded-xl shadow-lg z-[60] font-medium ${toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-yellow-400 text-yellow-900'
              }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default StorePage;