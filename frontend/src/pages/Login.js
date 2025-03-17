import React, { useState } from 'react';
import { User, Lock, LogIn, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      console.log('Login response:', data); // Debug เพื่อดูข้อมูลจาก Backend
      
      if (response.ok) {
        const userData = { id: data.id, username: data.username, role: data.role }; // เพิ่ม role
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/');
      } else {
        setError(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (error) {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-500 p-6 text-center">
          <div className="bg-white/10 inline-block p-3 rounded-full mb-2">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ระบบบันทึกรายรับรายจ่าย</h1>
          <p className="text-green-100 mt-1">จัดการการเงินของคุณได้อย่างง่ายดาย</p>
        </div>
        
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">เข้าสู่ระบบ</h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center">
              <span className="bg-red-100 p-1 rounded-full mr-2">
                <Lock className="w-3 h-3" />
              </span>
              {error}
            </div>
          )}
          
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
            
            <div className="mb-6">
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
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ยังไม่มีบัญชีผู้ใช้? <a href="/register" className="text-green-600 hover:text-green-700 font-medium">สมัครใช้งาน</a>
            </p>
          </div>
        </div>
        
        <div className="px-6 py-3 bg-gray-50 text-center text-xs text-gray-500">
          เพื่อการจัดการรายรับรายจ่ายที่ดีขึ้น © 2025
        </div>
      </div>
    </div>
  );
}

export default Login;