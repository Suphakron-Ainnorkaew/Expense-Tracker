import React, { useEffect, useState } from 'react';
import { User, AlertTriangle } from 'lucide-react';

function Admin({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log('User object:', user);

  // ดึงข้อมูลสมาชิกจาก Backend
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setUsers(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') { // ตรวจสอบว่าเป็นแอดมิน
      fetchUsers();
    }
  }, [user]);

  // ตรวจสอบว่าเป็นแอดมินหรือไม่
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto pt-16 md:pt-20 px-4 text-center py-12 bg-white rounded-lg shadow mt-4">
        <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-gray-500">เฉพาะแอดมินเท่านั้นที่สามารถเข้าถึงหน้านี้ได้</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-16 md:pt-20 px-4">
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <h2 className="text-lg font-semibold mb-4">รายชื่อสมาชิกในระบบ</h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
            <p>เกิดข้อผิดพลาด: {error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>ยังไม่มีสมาชิกในระบบ</p>
          </div>
        ) : (
          <div className="divide-y">
            {users.map((member) => (
              <div key={member.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <span className="font-medium">{member.username}</span>
                    <p className="text-sm text-gray-500">ID: {member.id}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  เข้าร่วม: {new Date(member.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;