import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Graph from './pages/Graph';
import Investor from './pages/Investor';
import Currency from './pages/Currency';
import Login from './pages/Login';
import Register from './pages/Register';
import Game from './pages/Game';
import Admin from './pages/Admin';

// สมมติว่าเราจะใช้ไอคอนจาก lucide-react
import { Home as HomeIcon, LineChart, TrendingUp, DollarSign, UserCircle, LogOut, LogIn, UserPlus } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);

  // ดึง user จาก Local Storage เมื่อ App โหลด
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ฟังก์ชัน logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user'); // ลบ user ออกจาก Local Storage
  };

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <NavBar user={user} handleLogout={handleLogout} />
        <div className="container mx-auto p-4 pt-20">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/graph" element={<Graph user={user} />} />
            <Route path="/investor" element={<Investor />} />
            <Route path="/currency" element={<Currency />} />
            <Route path="/admin" element={<Admin user={user} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// แยก NavBar เป็น Component ต่างหาก
function NavBar({ user, handleLogout }) {
  const location = useLocation();
  
  // เช็คว่าลิงค์ไหนกำลังถูกเลือกอยู่
  const isActive = (path) => {
    return location.pathname === path ? 'border-b-2 border-green-400' : '';
  };

  return (
    <nav className="fixed w-full bg-white shadow-md p-3 z-10">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo และชื่อเว็บไซต์ */}
        <div className="flex items-center">
          <div className="text-green-600 font-bold text-xl flex items-center">
            <DollarSign className="mr-2" />
            <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
              MoneyTracker
            </span>
          </div>
        </div>

        {/* เมนูหลัก */}
        <ul className="hidden md:flex space-x-1">
          <li>
            <Link 
              to="/" 
              className={`flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors ${isActive('/')}`}
            >
              <HomeIcon className="w-4 h-4 mr-1" />
              <span>หน้าหลัก</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/graph" 
              className={`flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors ${isActive('/graph')}`}
            >
              <LineChart className="w-4 h-4 mr-1" />
              <span>กราฟ</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/investor" 
              className={`flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors ${isActive('/investor')}`}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>การลงทุน</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/currency" 
              className={`flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors ${isActive('/currency')}`}
            >
              <DollarSign className="w-4 h-4 mr-1" />
              <span>อัตราแลกเปลี่ยน</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/game" 
              className={`flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors ${isActive('/currency')}`}
            >
              <DollarSign className="w-4 h-4 mr-1" />
              <span>เกมการเงิน</span>
            </Link>
          </li>
        </ul>

        {/* ส่วนของผู้ใช้ */}
        <div className="flex items-center">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-green-50 px-3 py-1 rounded-full text-green-700">
                <UserCircle className="w-5 h-5 mr-1" />
                <span>{user.username}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link 
                to="/login" 
                className="flex items-center px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
              >
                <LogIn className="w-4 h-4 mr-1" />
                <span>เข้าสู่ระบบ</span>
              </Link>
              <Link 
                to="/register" 
                className="flex items-center px-3 py-1 border border-green-500 text-green-600 hover:bg-green-50 rounded-full transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                <span>สมัครสมาชิก</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* เมนูสำหรับมือถือ (Responsive) */}
      <div className="md:hidden mt-2 border-t pt-2">
        <ul className="flex justify-between">
          <li className="text-center flex-1">
            <Link to="/" className={`flex flex-col items-center text-xs ${isActive('/') ? 'text-green-600' : 'text-gray-600'}`}>
              <HomeIcon className="w-5 h-5" />
              <span>หน้าหลัก</span>
            </Link>
          </li>
          <li className="text-center flex-1">
            <Link to="/graph" className={`flex flex-col items-center text-xs ${isActive('/graph') ? 'text-green-600' : 'text-gray-600'}`}>
              <LineChart className="w-5 h-5" />
              <span>กราฟ</span>
            </Link>
          </li>
          <li className="text-center flex-1">
            <Link to="/investor" className={`flex flex-col items-center text-xs ${isActive('/investor') ? 'text-green-600' : 'text-gray-600'}`}>
              <TrendingUp className="w-5 h-5" />
              <span>การลงทุน</span>
            </Link>
          </li>
          <li className="text-center flex-1">
            <Link to="/currency" className={`flex flex-col items-center text-xs ${isActive('/currency') ? 'text-green-600' : 'text-gray-600'}`}>
              <DollarSign className="w-5 h-5" />
              <span>แลกเปลี่ยน</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default App;