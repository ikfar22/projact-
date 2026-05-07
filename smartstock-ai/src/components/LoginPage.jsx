import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(username, password, shopName);
        // After register, auto-login
        await login(username, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-600/30">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SmartStock AI</h1>
          <p className="text-slate-500 mt-1">ระบบจัดการสต็อกอัจฉริยะสำหรับ SME</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            {isRegister ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {isRegister ? 'กรอกข้อมูลเพื่อเริ่มต้นใช้งาน' : 'เข้าสู่ระบบเพื่อจัดการสต็อก'}
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-100/60 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อผู้ใช้งาน</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all pr-11"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อร้านค้า</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
                  placeholder="ร้านกาแฟสด"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'กำลังดำเนินการ...'
                : isRegister
                  ? 'สร้างบัญชี'
                  : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              {isRegister ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สร้างบัญชีใหม่'}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Package size={20} className="text-indigo-500 mb-1" />
            <p className="text-xs text-slate-500 font-medium">จัดการสต็อก</p>
          </div>
          <div className="flex flex-col items-center">
            <TrendingUp size={20} className="text-indigo-500 mb-1" />
            <p className="text-xs text-slate-500 font-medium">AI พยากรณ์</p>
          </div>
          <div className="flex flex-col items-center">
            <ShoppingCart size={20} className="text-indigo-500 mb-1" />
            <p className="text-xs text-slate-500 font-medium">บันทึกขาย</p>
          </div>
        </div>
      </div>
    </div>
  );
}
