import React, { useEffect, useState, useCallback } from 'react';
import { PlusCircle, MinusCircle, Calendar, DollarSign, Tag, FileText, RefreshCw, AlertTriangle } from 'lucide-react';

function Home({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    category: '',
    amount: '',
    currency: 'THB',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [transactionSummary, setTransactionSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const [summaryCurrency, setSummaryCurrency] = useState('THB');
  const [savingsGoal, setSavingsGoal] = useState({ amount: '', months: '', description: '' });
  const [savingsGoals, setSavingsGoals] = useState([]); // เพิ่ม state สำหรับเก็บเป้าหมายทั้งหมด
  const [simulatedExpense, setSimulatedExpense] = useState('');
  const [simulatedBalance, setSimulatedBalance] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const exchangeRates = { THB: 1, USD: 33.5, JPY: 0.23 };

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:5000/api/transactions?userId=${user.id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTransactions(data || []);

      const income = data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (parseFloat(t.amount || 0) * exchangeRates[t.currency || 'THB']) / exchangeRates[summaryCurrency], 0);
      const expense = data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (parseFloat(t.amount || 0) * exchangeRates[t.currency || 'THB']) / exchangeRates[summaryCurrency], 0);
      
      setTransactionSummary({ income, expense, balance: income - expense });
      setShowAlert(expense > income);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
      console.log('ไม่สามารถดึงข้อมูลธุรกรรมได้: ' + error.message);
    }
  }, [user?.id, summaryCurrency]);

  // ฟังก์ชันดึงเป้าหมายการออม
  const fetchSavingsGoals = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/savings-goals?userId=${user.id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSavingsGoals(data || []);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      setSavingsGoals([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchSavingsGoals(); // ดึงเป้าหมายเมื่อโหลดหน้า
    }
  }, [fetchTransactions, fetchSavingsGoals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTransaction, user_id: user.id }),
      });
      const data = await response.json();
      if (response.ok) {
        setNewTransaction({
          type: 'expense',
          category: '',
          amount: '',
          currency: 'THB',
          description: '',
          date: new Date().toISOString().split('T')[0],
        });
        setIsFormOpen(false);
        fetchTransactions();
        setShowAlert(data.alert);
        console.log('บันทึกสำเร็จ!');
      } else {
        console.log('เกิดข้อผิดพลาด: ' + (data.message || 'ลองใหม่อีกครั้ง'));
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      console.log('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  const handleConvert = async (id, newCurrency) => {
    if (!newCurrency) return;
    try {
      await fetch('http://localhost:5000/api/transactions/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id, newCurrency }),
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error converting currency:', error);
    }
  };

  const handleSavingsGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/transactions/savings-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...savingsGoal, user_id: user.id }),
      });
      if (response.ok) {
        setSavingsGoal({ amount: '', months: '', description: '' });
        fetchSavingsGoals(); // รีเฟรชเป้าหมายหลังบันทึก
        console.log("บันทึกสำเร็จ");
      } else {
        console.log("เกิดข้อผิดพลาดในการตั้งเป้าหมาย");
      }
    } catch (error) {
      console.error('Error saving goal:', error);
      console.log('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  const handleSimulateExpense = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/transactions/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, newExpense: simulatedExpense }),
      });
      const data = await response.json();
      if (response.ok) {
        setSimulatedBalance(data.simulatedBalance);
        setShowAlert(data.alert);
      } else {
        console.log('เกิดข้อผิดพลาดในการจำลอง');
      }
    } catch (error) {
      console.error('Error simulating expense:', error);
      console.log('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filter);

  const categories = {
    income: ['เงินเดือน', 'โบนัส', 'ของขวัญ', 'เงินปันผล', 'อื่นๆ'],
    expense: ['อาหาร', 'ที่พัก', 'เดินทาง', 'ช้อปปิ้ง', 'บันเทิง', 'สุขภาพ', 'การศึกษา', 'อื่นๆ'],
  };

  const getTransactionTypeColor = (type) => {
    return type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  return (
    <div className="max-w-4xl mx-auto pt-16 md:pt-20 px-4">
      {user ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-4">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col">
              <span className="text-sm text-gray-500 mb-1">รายรับทั้งหมด</span>
              <div className="flex items-center text-green-600">
                <PlusCircle className="w-5 h-5 mr-2" />
                <span className="text-xl font-semibold">{transactionSummary.income.toLocaleString()} {summaryCurrency}</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col">
              <span className="text-sm text-gray-500 mb-1">รายจ่ายทั้งหมด</span>
              <div className="flex items-center text-red-600">
                <MinusCircle className="w-5 h-5 mr-2" />
                <span className="text-xl font-semibold">{transactionSummary.expense.toLocaleString()} {summaryCurrency}</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col">
              <span className="text-sm text-gray-500 mb-1">ยอดคงเหลือ</span>
              <div className={`flex items-center ${transactionSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <DollarSign className="w-5 h-5 mr-2" />
                <span className="text-xl font-semibold">{transactionSummary.balance.toLocaleString()} {summaryCurrency}</span>
              </div>
            </div>
          </div>

          {showAlert && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 text-yellow-700 mr-2" />
              <span className="text-yellow-700">คำเตือน: รายจ่ายมากกว่ารายรับ!</span>
            </div>
          )}

          <div className="mb-6 flex justify-end">
            <select value={summaryCurrency} onChange={(e) => setSummaryCurrency(e.target.value)} className="border rounded-lg p-2 text-sm">
              <option value="THB">THB</option>
              <option value="USD">USD</option>
              <option value="JPY">JPY</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-b">
              <h2 className="text-lg font-semibold mb-2 sm:mb-0">รายการธุรกรรม</h2>
              <div className="flex flex-wrap gap-2">
                <select
                  className="px-3 py-2 border rounded-lg text-sm bg-white flex-grow sm:flex-grow-0"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="income">รายรับ</option>
                  <option value="expense">รายจ่าย</option>
                </select>
                <button
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center text-sm hover:bg-green-600 transition-colors flex-grow sm:flex-grow-0"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  เพิ่มรายการ
                </button>
              </div>
            </div>
            {isFormOpen && (
              <div className="p-4 bg-gray-50 border-b">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">ประเภท</label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center ${newTransaction.type === 'income' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
                        onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        รายรับ
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center ${newTransaction.type === 'expense' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
                        onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                      >
                        <MinusCircle className="w-4 h-4 mr-2" />
                        รายจ่าย
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">หมวดหมู่</label>
                    <select
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                      className="border rounded-lg p-2"
                      required
                    >
                      <option value="">เลือกหมวดหมู่</option>
                      {categories[newTransaction.type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">จำนวนเงิน</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                        className="border rounded-lg p-2 pl-8 w-full"
                        required
                      />
                      <DollarSign className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">สกุลเงิน</label>
                    <select
                      value={newTransaction.currency}
                      onChange={(e) => setNewTransaction({ ...newTransaction, currency: e.target.value })}
                      className="border rounded-lg p-2"
                    >
                      <option value="THB">บาท (THB)</option>
                      <option value="USD">ดอลลาร์สหรัฐ (USD)</option>
                      <option value="JPY">เยน (JPY)</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">วันที่</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                        className="border rounded-lg p-2 pl-8 w-full"
                        required
                      />
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">รายละเอียด (ถ้ามี)</label>
                    <input
                      type="text"
                      placeholder="รายละเอียดเพิ่มเติม"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                      className="border rounded-lg p-2"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end space-x-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      บันทึกรายการ
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div className="p-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>ยังไม่มีรายการธุรกรรม</p>
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                  >
                    เพิ่มรายการแรกของคุณ
                  </button>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredTransactions.map(t => (
                    <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <div className={`p-2 rounded-full mr-3 ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {t.type === 'income' ? <PlusCircle className="w-5 h-5 text-green-600" /> : <MinusCircle className="w-5 h-5 text-red-600" />}
                        </div>
                        <div>
                          <div className="flex items-center flex-wrap">
                            <span className="font-medium">{t.category}</span>
                            <span className={`text-xs rounded-full px-2 py-0.5 ml-2 ${getTransactionTypeColor(t.type)}`}>
                              {t.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center flex-wrap">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(t.date)}
                            {t.description && <span className="ml-2 text-gray-400 overflow-hidden text-ellipsis">- {t.description}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                        <span className={`text-lg font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'income' ? '+' : '-'} {parseFloat(t.amount).toLocaleString()} {t.currency}
                        </span>
                        <div className="relative group">
                          <select
                            onChange={(e) => handleConvert(t.id, e.target.value)}
                            className="text-xs border rounded-full py-1 pl-6 pr-2 bg-white text-gray-600 appearance-none cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>แปลงสกุลเงิน</option>
                            <option value="THB" disabled={t.currency === 'THB'}>THB</option>
                            <option value="USD" disabled={t.currency === 'USD'}>USD</option>
                            <option value="JPY" disabled={t.currency === 'JPY'}>JPY</option>
                          </select>
                          <RefreshCw className="w-3 h-3 absolute left-2 top-1.5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow mt-4">
          <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">ยินดีต้อนรับสู่ระบบบันทึกรายรับรายจ่าย</h2>
          <p className="text-gray-500 mb-6">กรุณาเข้าสู่ระบบเพื่อเริ่มใช้งาน</p>
          <a href="/login" className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            เข้าสู่ระบบ
          </a>
        </div>
      )}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
            <h2 className="text-lg font-semibold mb-4">ตั้งเป้าหมายการออม</h2>
            <form onSubmit={handleSavingsGoalSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">จำนวนเงิน (THB)</label>
                <input
                  type="number"
                  value={savingsGoal.amount}
                  onChange={(e) => setSavingsGoal({ ...savingsGoal, amount: e.target.value })}
                  className="border rounded-lg p-2"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">ระยะเวลา (เดือน)</label>
                <input
                  type="number"
                  value={savingsGoal.months}
                  onChange={(e) => setSavingsGoal({ ...savingsGoal, months: e.target.value })}
                  className="border rounded-lg p-2"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">คำอธิบาย</label>
                <input
                  type="text"
                  value={savingsGoal.description}
                  onChange={(e) => setSavingsGoal({ ...savingsGoal, description: e.target.value })}
                  className="border rounded-lg p-2"
                />
              </div>
              <button type="submit" className="md:col-span-3 bg-green-500 text-white rounded-lg p-2 hover:bg-green-600">
                บันทึกเป้าหมาย
              </button>
            </form>

            {/* แสดงรายการเป้าหมายการออม */}
            <div className="mt-4">
              <h3 className="text-md font-semibold mb-2">เป้าหมายการออมทั้งหมด</h3>
              {savingsGoals.length === 0 ? (
                <p className="text-sm text-gray-500">ยังไม่มีเป้าหมายการออม</p>
              ) : (
                <div className="divide-y">
                  {savingsGoals.map(goal => (
                    <div key={goal.id} className="py-2 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{goal.description || 'ไม่มีคำอธิบาย'}</p>
                        <p className="text-sm text-gray-600">
                          {parseFloat(goal.amount).toLocaleString()} THB / {goal.months} เดือน ={' '}
                          {(goal.amount / goal.months).toLocaleString()} THB/เดือน
                        </p>
                        <p className="text-xs text-gray-400">บันทึกเมื่อ: {formatDate(goal.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <h2 className="text-lg font-semibold mb-4">จำลองการเพิ่มค่าใช้จ่าย</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="number"
                placeholder="เพิ่มค่าใช้จ่าย (THB)"
                value={simulatedExpense}
                onChange={(e) => setSimulatedExpense(e.target.value)}
                className="border rounded-lg p-2 w-full md:w-1/3"
              />
              <button
                onClick={handleSimulateExpense}
                className="bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600"
              >
                จำลอง
              </button>
              {simulatedBalance !== null && (
                <p className="text-sm text-gray-600">
                  ยอดคงเหลือหลังจำลอง: {simulatedBalance.toLocaleString()} {summaryCurrency}
                </p>
              )}
            </div>
          </div>
    </div>
  );
}

export default Home;