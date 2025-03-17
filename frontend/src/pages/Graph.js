import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartBarIcon, CalendarIcon, RefreshCw, FileText } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Graph({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [timeFrame, setTimeFrame] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/transactions?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transaction data');
      }
      
      const data = await response.json();
      setTransactions(data);
      
      // Calculate summary data
      const totalIncome = data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
      const totalExpense = data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
      setSummary({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      });
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, timeFrame]);

  const processData = () => {
    const incomeData = {};
    const expenseData = {};
    let labels = [];

    // Format Thai-style labels based on timeframe
    transactions.forEach(t => {
      const date = new Date(t.date);
      let key;
      
      if (timeFrame === 'day') {
        key = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
      } else if (timeFrame === 'month') {
        key = date.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
      } else if (timeFrame === 'quarter') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const year = date.getFullYear();
        key = `ไตรมาส ${quarter}/${year.toString().slice(2)}`;
      } else {
        key = date.getFullYear().toString();
      }

      if (!labels.includes(key)) labels.push(key);

      if (t.type === 'income') {
        incomeData[key] = (incomeData[key] || 0) + parseFloat(t.amount);
      } else {
        expenseData[key] = (expenseData[key] || 0) + parseFloat(t.amount);
      }
    });

    // Sort labels chronologically
    if (timeFrame === 'day') {
      labels.sort((a, b) => new Date(a) - new Date(b));
    } else if (timeFrame === 'month') {
      labels.sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        return (parseInt(yearA) - parseInt(yearB)) || (thaiMonths.indexOf(monthA) - thaiMonths.indexOf(monthB));
      });
    } else if (timeFrame === 'quarter') {
      labels.sort((a, b) => {
        const [_, qYearA] = a.split(' ');
        const [__, qYearB] = b.split(' ');
        const [quarterA, yearA] = qYearA.split('/');
        const [quarterB, yearB] = qYearB.split('/');
        return (parseInt(yearA) - parseInt(yearB)) || (parseInt(quarterA) - parseInt(quarterB));
      });
    } else {
      labels.sort();
    }

    return {
      labels,
      datasets: [
        {
          label: 'รายรับ',
          data: labels.map(label => incomeData[label] || 0),
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
        {
          label: 'รายจ่าย',
          data: labels.map(label => expenseData[label] || 0),
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getThaiTimeFrameName = () => {
    switch (timeFrame) {
      case 'day': return 'รายวัน';
      case 'month': return 'รายเดือน';
      case 'quarter': return 'รายไตรมาส';
      case 'year': return 'รายปี';
      default: return '';
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          font: {
            family: 'Kanit, sans-serif',
          }
        }
      },
      title: { 
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('th-TH', { 
                style: 'currency', 
                currency: 'THB',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Kanit, sans-serif',
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString('th-TH');
          },
          font: {
            family: 'Kanit, sans-serif',
          }
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-green-500" />
            กราฟรายรับรายจ่าย
          </h2>
          <button 
            onClick={fetchTransactions} 
            className="text-sm flex items-center text-gray-600 hover:text-green-600"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            รีเฟรชข้อมูล
          </button>
        </div>

        {!user ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">กรุณาเข้าสู่ระบบ</h2>
            <p className="text-gray-500 mb-6">เข้าสู่ระบบเพื่อดูข้อมูลกราฟรายรับรายจ่าย</p>
            <a href="/login" className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              เข้าสู่ระบบ
            </a>
          </div>
        ) : loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin mb-3 h-8 w-8 border-t-2 border-b-2 border-green-500 rounded-full mx-auto"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">เกิดข้อผิดพลาด: {error}</p>
            <button
              onClick={fetchTransactions}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              ลองอีกครั้ง
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>ยังไม่มีรายการธุรกรรม</p>
            <a href="/" className="mt-2 inline-block px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors">
              เพิ่มรายการแรกของคุณ
            </a>
          </div>
        ) : (
          <div className="p-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="text-sm text-gray-600 mb-1">รายรับทั้งหมด</div>
                <div className="text-xl font-semibold text-green-600">
                  {summary.totalIncome.toLocaleString('th-TH')} บาท
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <div className="text-sm text-gray-600 mb-1">รายจ่ายทั้งหมด</div>
                <div className="text-xl font-semibold text-red-600">
                  {summary.totalExpense.toLocaleString('th-TH')} บาท
                </div>
              </div>
              <div className={`rounded-lg p-4 border ${summary.balance >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                <div className="text-sm text-gray-600 mb-1">ยอดคงเหลือ</div>
                <div className={`text-xl font-semibold ${summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {summary.balance.toLocaleString('th-TH')} บาท
                </div>
              </div>
            </div>

            {/* Time Frame Selector */}
            <div className="mb-6">
              <div className="flex items-center mb-2 text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>ช่วงเวลา</span>
              </div>
              <div className="flex flex-wrap bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTimeFrame('day')}
                  className={`mr-1 px-4 py-2 rounded-md text-sm ${
                    timeFrame === 'day' 
                      ? 'bg-green-500 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  รายวัน
                </button>
                <button
                  onClick={() => setTimeFrame('month')}
                  className={`mr-1 px-4 py-2 rounded-md text-sm ${
                    timeFrame === 'month' 
                      ? 'bg-green-500 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  รายเดือน
                </button>
                <button
                  onClick={() => setTimeFrame('quarter')}
                  className={`mr-1 px-4 py-2 rounded-md text-sm ${
                    timeFrame === 'quarter' 
                      ? 'bg-green-500 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  รายไตรมาส
                </button>
                <button
                  onClick={() => setTimeFrame('year')}
                  className={`px-4 py-2 rounded-md text-sm ${
                    timeFrame === 'year' 
                      ? 'bg-green-500 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  รายปี
                </button>
              </div>
            </div>

            {/* Chart Title */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">
                กราฟเปรียบเทียบรายรับรายจ่าย{getThaiTimeFrameName()}
              </h3>
            </div>
            
            {/* Chart Container */}
            <div className="h-96 mb-4">
              <Bar data={processData()} options={options} />
            </div>

            {/* Chart Legend & Info */}
            <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mt-4">
              แสดงข้อมูลรายรับ (สีเขียว) และรายจ่าย (สีแดง) ตามช่วงเวลาที่เลือก
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Graph;