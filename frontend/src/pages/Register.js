import React, { useState } from 'react';
import { User, Lock, Mail, UserPlus, DollarSign, ArrowLeft } from 'lucide-react';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        // รีเซ็ตข้อมูลฟอร์ม
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setEmail('');
      } else {
        setError(data.error || 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* ส่วนหัว */}
        <div className="bg-green-500 p-6 text-center">
          <div className="bg-white/10 inline-block p-3 rounded-full mb-2">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ระบบบันทึกรายรับรายจ่าย</h1>
          <p className="text-green-100 mt-1">เริ่มต้นจัดการการเงินของคุณวันนี้</p>
        </div>
        
        {/* ฟอร์มลงทะเบียน */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">สมัครบัญชีผู้ใช้ใหม่</h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center">
              <span className="bg-red-100 p-1 rounded-full mr-2">
                <Lock className="w-3 h-3" />
              </span>
              {error}
            </div>
          )}
          
          {success ? (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-4 text-center">
              <div className="bg-green-100 p-2 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium mb-2">ลงทะเบียนสำเร็จ!</h3>
              <p className="mb-4">คุณสามารถเข้าสู่ระบบด้วยบัญชีใหม่ของคุณได้แล้ว</p>
              <a 
                href="/login" 
                className="inline-block bg-green-500 text-white rounded-lg py-2 px-4 font-medium hover:bg-green-600 transition-colors"
              >
                ไปยังหน้าเข้าสู่ระบบ
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm text-gray-600 mb-1">ชื่อผู้ใช้</label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    placeholder="กรอกชื่อผู้ใช้ของคุณ"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 pl-9 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm text-gray-600 mb-1">อีเมล</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 pl-9 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm text-gray-600 mb-1">รหัสผ่าน</label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    placeholder="กรอกรหัสผ่านของคุณ"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 pl-9 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <p className="text-xs text-gray-500 mt-1">รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร</p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm text-gray-600 mb-1">ยืนยันรหัสผ่าน</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 pl-9 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-green-500 text-white rounded-lg py-2 px-4 flex justify-center items-center font-medium
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-600'} transition-colors`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    กำลังลงทะเบียน...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    สมัครบัญชีผู้ใช้
                  </>
                )}
              </button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <a href="/login" className="text-sm text-gray-600 flex items-center justify-center hover:text-green-600">
              <ArrowLeft className="w-4 h-4 mr-1" />
              มีบัญชีผู้ใช้แล้ว? เข้าสู่ระบบ
            </a>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 text-center text-xs text-gray-500">
          เพื่อการจัดการรายรับรายจ่ายที่ดีขึ้น © 2025
        </div>
      </div>
    </div>
  );
}

export default Register;