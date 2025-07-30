import React, { useEffect, useState, useCallback } from 'react';
import { PlusCircle, MinusCircle, Calendar, DollarSign, Tag, FileText, AlertTriangle, Edit2, Trash2, X, Utensils, Home as HomeIcon, Bus, ShoppingBag, Film, Heart, Book, Gift, Briefcase, PiggyBank, Bitcoin, Building2, Coins, Trophy, Car, Plane, Smartphone, Shirt, ShoppingCart, Banknote, Wallet, TrendingUp, Star, Check } from 'lucide-react';
import CategoryDropdown from '../components/CategoryDropdown';

function Home({ user }) {
  const [editTransactionId, setEditTransactionId] = useState(null);
  const [editTransaction, setEditTransaction] = useState(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState(null);
  const [editGoalId, setEditGoalId] = useState(null);
  const [editGoal, setEditGoal] = useState(null);
  const [deleteGoalId, setDeleteGoalId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'transaction' or 'goal'

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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'));
  const [transactionSummary, setTransactionSummary] = useState({
    income: 0,
    expense: 0,
    investor: 0,
    balance: 0,
  });
  const totalInvestor = transactionSummary.investor;
  const [savingsGoal, setSavingsGoal] = useState({ amount: '', months: '', description: '' });
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [simulatedExpense, setSimulatedExpense] = useState('');
  const [simulatedBalance, setSimulatedBalance] = useState(null);
  const [showAlert, setShowAlert] = useState(false);



  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:5000/api/transactions?userId=${user.id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      // Extract transactions from response
      const allTransactions = data.transactions || (Array.isArray(data) ? data : []);
      
      // Sort transactions by date (newest first)
      const sortedTransactions = allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(sortedTransactions);
      
      // Filter transactions by selected month
      const filteredTransactions = sortedTransactions.filter(t => {
        if (!t || !t.date) return false;
        const transactionDate = new Date(t.date);
        const selectedDate = new Date(selectedMonth + '-01');
        return transactionDate.getFullYear() === selectedDate.getFullYear() && 
               transactionDate.getMonth() === selectedDate.getMonth();
      });
      
      // Calculate summary for filtered transactions
      const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const investor = filteredTransactions.filter(t => t.type === 'investor').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const balance = income - expense - investor;
      setTransactionSummary({ income, expense, investor, balance });
      setShowAlert(expense > income);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
      console.log('ไม่สามารถดึงข้อมูลธุรกรรมได้: ' + error.message);
    }
  }, [user?.id, selectedMonth]);

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
      fetchSavingsGoals();
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
        fetchSavingsGoals();
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

  const handleEditTransaction = (t) => {
    setEditTransactionId(t.id);
    setEditTransaction({ ...t });
  };

  const handleEditTransactionSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${editTransactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTransaction),
      });
      if (response.ok) {
        setEditTransactionId(null);
        setEditTransaction(null);
        await fetchTransactions();
      } else {
        const data = await response.json();
        alert('เกิดข้อผิดพลาดในการแก้ไข: ' + (data.message || 'ลองใหม่อีกครั้ง'));
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการแก้ไข');
    }
  };

  const handleDeleteTransaction = async (id) => {
    setDeleteTransactionId(id);
    setDeleteType('transaction');
    setShowDeleteModal(true);
  };

  const handleEditGoal = (goal) => {
    setEditGoalId(goal.id);
    setEditGoal({ ...goal });
  };

  const handleEditGoalSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/savings-goals/${editGoalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editGoal),
      });
      if (response.ok) {
        setEditGoalId(null);
        setEditGoal(null);
        await fetchSavingsGoals();
      } else {
        const data = await response.json();
        alert('เกิดข้อผิดพลาดในการแก้ไข: ' + (data.message || 'ลองใหม่อีกครั้ง'));
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการแก้ไข');
    }
  };

  const handleDeleteGoal = (id) => {
    setDeleteGoalId(id);
    setDeleteType('goal');
    setShowDeleteModal(true);
  };

  const handleCompleteGoal = async (goal) => {
    if (!window.confirm('คุณต้องการทำเครื่องหมายเป้าหมายนี้ว่าสำเร็จและถอนเงินออมใช่หรือไม่?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/savings-goals/${goal.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (response.ok) {
        await fetchSavingsGoals();
        await fetchTransactions();
      } else {
        const data = await response.json();
        alert('เกิดข้อผิดพลาด: ' + (data.error || 'ลองใหม่อีกครั้ง'));
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการทำเครื่องหมายสำเร็จ');
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteType === 'transaction' && deleteTransactionId) {
        const response = await fetch(`http://localhost:5000/api/transactions/${deleteTransactionId}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchTransactions();
        } else {
          const data = await response.json();
          alert('เกิดข้อผิดพลาดในการลบ: ' + (data.message || 'ลองใหม่อีกครั้ง'));
        }
      } else if (deleteType === 'goal' && deleteGoalId) {
        const response = await fetch(`http://localhost:5000/api/transactions/savings-goals/${deleteGoalId}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchSavingsGoals();
        } else {
          const data = await response.json();
          alert('เกิดข้อผิดพลาดในการลบ: ' + (data.message || 'ลองใหม่อีกครั้ง'));
        }
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบ');
    } finally {
      setShowDeleteModal(false);
      setDeleteTransactionId(null);
      setDeleteGoalId(null);
      setDeleteType(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTransactionId(null);
    setDeleteGoalId(null);
    setDeleteType(null);
  };



  // เพิ่มหมวดหมู่ใหม่และหลากหลายขึ้น
  const categories = {
    income: [
      'เงินเดือน', 'โบนัส', 'ของขวัญ', 'เงินปันผล', 'ขายของ', 'ดอกเบี้ย', 'รางวัล', 'อื่นๆ'
    ],
    expense: [
      'อาหาร', 'ที่พัก', 'เดินทาง', 'ช้อปปิ้ง', 'บันเทิง', 'สุขภาพ', 'การศึกษา', 'ของขวัญ', 'เทคโนโลยี', 'เสื้อผ้า', 'รถยนต์', 'ท่องเที่ยว', 'มือถือ', 'อื่นๆ'
    ],
    investor: [
      'เงินออม', 'หุ้น', 'กองทุน', 'อสังหา', 'คริปโต', 'ทองคำ', 'พันธบัตร', 'อื่นๆ'
    ],
  };

  // Map category เป็นไอคอน (lucide-react)
  const categoryIcons = {
    // expense
    'อาหาร': Utensils,
    'ที่พัก': HomeIcon,
    'เดินทาง': Bus,
    'ช้อปปิ้ง': ShoppingBag,
    'บันเทิง': Film,
    'สุขภาพ': Heart,
    'การศึกษา': Book,
    'ของขวัญ': Gift,
    'เทคโนโลยี': Smartphone,
    'เสื้อผ้า': Shirt,
    'รถยนต์': Car,
    'ท่องเที่ยว': Plane,
    'มือถือ': Smartphone,
    'อื่นๆ': Star,
    // income
    'เงินเดือน': Briefcase,
    'โบนัส': Trophy,
    'เงินปันผล': Banknote,
    'ขายของ': ShoppingCart,
    'ดอกเบี้ย': PiggyBank,
    'รางวัล': Trophy,
    // investor
    'เงินออม': PiggyBank,
    'หุ้น': TrendingUp,
    'กองทุน': Wallet,
    'อสังหา': Building2,
    'คริปโต': Bitcoin,
    'ทองคำ': Coins,
    'พันธบัตร': Banknote,
  };

  const getTransactionTypeColor = (type) => {
    if (type === 'income') return 'bg-green-100 text-green-700';
    if (type === 'expense') return 'bg-red-100 text-red-700';
    if (type === 'investor') return 'bg-blue-100 text-blue-700';
    return '';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  // Filter transactions by selected month and type
  const displayTransactions = transactions.filter(t => {
    // Filter by month
    if (!t || !t.date) return false;
    const transactionDate = new Date(t.date);
    const selectedDate = new Date(selectedMonth + '-01');
    const isInSelectedMonth = transactionDate.getFullYear() === selectedDate.getFullYear() && 
                             transactionDate.getMonth() === selectedDate.getMonth();
    
    // Filter by type
    const isMatchingType = filter === 'all' || t.type === filter;
    
    return isInSelectedMonth && isMatchingType;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-4xl mx-auto pt-16 md:pt-20 px-4">
        {user ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
                <PlusCircle className="w-8 h-8 text-green-500 mb-2" />
                <span className="text-gray-500 text-sm">รายรับ</span>
                <span className="text-2xl font-bold text-green-600">{transactionSummary.income.toLocaleString()} บาท</span>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
                <MinusCircle className="w-8 h-8 text-red-500 mb-2" />
                <span className="text-gray-500 text-sm">รายจ่าย</span>
                <span className="text-2xl font-bold text-red-600">{transactionSummary.expense.toLocaleString()} บาท</span>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
                <Tag className="w-8 h-8 text-blue-500 mb-2" />
                <span className="text-gray-500 text-sm">ลงทุน</span>
                <span className="text-2xl font-bold text-blue-600">{transactionSummary.investor.toLocaleString()} บาท</span>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
                <DollarSign className={`w-8 h-8 mb-2 ${transactionSummary.balance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-gray-500 text-sm">ยอดคงเหลือ</span>
                <span className={`text-2xl font-bold ${transactionSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{transactionSummary.balance.toLocaleString()} บาท</span>
              </div>
            </div>

            {/* Alert */}
            {showAlert && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 flex items-center rounded-xl shadow">
                <AlertTriangle className="w-6 h-6 text-yellow-700 mr-2" />
                <span className="text-yellow-700 font-medium">คำเตือน: รายจ่ายมากกว่ารายรับ!</span>
              </div>
            )}



            {/* Transaction List Card */}
            <div className="bg-white rounded-2xl shadow-lg mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-6 border-b">
                <div>
                  <h2 className="text-lg font-bold mb-1">รายการธุรกรรม</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedMonth + '-01').toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-3 py-2 border rounded-xl text-sm bg-white shadow"
                    />
                  </div>
                  <select
                    className="px-3 py-2 border rounded-xl text-sm bg-white shadow"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="income">รายรับ</option>
                    <option value="expense">รายจ่าย</option>
                    <option value="investor">ลงทุน</option>
                  </select>
                  <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl flex items-center text-sm hover:bg-green-600 transition-colors shadow"
                  >
                    <PlusCircle className="w-4 h-4 mr-1" />
                    เพิ่มรายการ
                  </button>
                </div>
              </div>
              {isFormOpen && (
                <div className="p-6 bg-gray-50 border-b rounded-b-xl">
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1 font-medium">ประเภท</label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center transition-colors border ${newTransaction.type === 'income' ? 'bg-green-100 text-green-700 border-green-300 shadow' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                          onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          รายรับ
                        </button>
                        <button
                          type="button"
                          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center transition-colors border ${newTransaction.type === 'expense' ? 'bg-red-100 text-red-700 border-red-300 shadow' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                          onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                        >
                          <MinusCircle className="w-4 h-4 mr-2" />
                          รายจ่าย
                        </button>
                        <button
                          type="button"
                          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center transition-colors border ${newTransaction.type === 'investor' ? 'bg-blue-100 text-blue-700 border-blue-300 shadow' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                          onClick={() => setNewTransaction({ ...newTransaction, type: 'investor' })}
                        >
                          <Tag className="w-4 h-4 mr-2" />
                          ลงทุน
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1 font-medium">หมวดหมู่</label>
                      <CategoryDropdown
                        value={newTransaction.category}
                        onChange={cat => setNewTransaction({ ...newTransaction, category: cat })}
                        options={categories[newTransaction.type]}
                        iconMap={categoryIcons}
                        placeholder="เลือกหมวดหมู่"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1 font-medium">จำนวนเงิน</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0.00"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                          className="border rounded-xl p-2 pl-8 w-full shadow"
                          required
                        />
                        <DollarSign className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1 font-medium">สกุลเงิน</label>
                      <select
                        value={newTransaction.currency}
                        onChange={(e) => setNewTransaction({ ...newTransaction, currency: e.target.value })}
                        className="border rounded-xl p-2 shadow"
                      >
                        <option value="THB">บาท (THB)</option>
                        <option value="USD">ดอลลาร์สหรัฐ (USD)</option>
                        <option value="JPY">เยน (JPY)</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1 font-medium">วันที่</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={newTransaction.date}
                          onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                          className="border rounded-xl p-2 pl-8 w-full shadow"
                          required
                        />
                        <Calendar className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1 font-medium">รายละเอียด (ถ้ามี)</label>
                      <input
                        type="text"
                        placeholder="รายละเอียดเพิ่มเติม"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                        className="border rounded-xl p-2 shadow"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors shadow"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow"
                      >
                        บันทึกรายการ
                      </button>
                    </div>
                  </form>
                </div>
              )}
              <div className="p-6">
                {displayTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">ยังไม่มีรายการธุรกรรมในเดือนที่เลือก</p>
                    <p className="text-sm text-gray-400 mb-4">เลือกเดือนอื่นหรือเพิ่มรายการใหม่</p>
                    <button
                      onClick={() => setIsFormOpen(true)}
                      className="mt-4 px-6 py-2 bg-green-500 text-white rounded-xl text-sm hover:bg-green-600 transition-colors shadow"
                    >
                      เพิ่มรายการใหม่
                    </button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {displayTransactions.map(t => (
                      <div key={t.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 rounded-xl transition-colors px-2">
                        {editTransactionId === t.id ? (
                          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div className="flex flex-col md:flex-row gap-2 flex-1">
                              <div className="relative min-w-[120px]">
                                <CategoryDropdown
                                  value={editTransaction.category}
                                  onChange={cat => setEditTransaction({ ...editTransaction, category: cat })}
                                  options={categories[editTransaction.type || 'expense']}
                                  iconMap={categoryIcons}
                                  placeholder="เลือกหมวดหมู่"
                                />
                              </div>
                              <input className="border rounded-xl p-1 text-sm shadow" type="number" value={editTransaction.amount} onChange={e => setEditTransaction({ ...editTransaction, amount: e.target.value })} />
                              <select className="border rounded-xl p-1 text-sm shadow" value={editTransaction.currency} onChange={e => setEditTransaction({ ...editTransaction, currency: e.target.value })}>
                                <option value="THB">THB</option>
                                <option value="USD">USD</option>
                                <option value="JPY">JPY</option>
                              </select>
                              <input className="border rounded-xl p-1 text-sm shadow" type="date" value={editTransaction.date} onChange={e => setEditTransaction({ ...editTransaction, date: e.target.value })} />
                              <input className="border rounded-xl p-1 text-sm shadow" value={editTransaction.description} onChange={e => setEditTransaction({ ...editTransaction, description: e.target.value })} />
                            </div>
                            <div className="flex gap-2 mt-2 md:mt-0">
                              <button className="bg-green-500 text-white rounded-xl px-3 py-1 text-sm hover:bg-green-600 shadow" onClick={handleEditTransactionSave} type="button">บันทึก</button>
                              <button className="bg-gray-300 text-gray-700 rounded-xl px-3 py-1 text-sm hover:bg-gray-400 shadow" onClick={() => setEditTransactionId(null)} type="button">ยกเลิก</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center mb-2 sm:mb-0">
                              <div className={`p-3 rounded-full mr-3 shadow ${t.type === 'income' ? 'bg-green-100' : t.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'}`}>
                                {t.type === 'income' ? <PlusCircle className="w-6 h-6 text-green-600" /> : t.type === 'expense' ? <MinusCircle className="w-6 h-6 text-red-600" /> : <Tag className="w-6 h-6 text-blue-600" />}
                              </div>
                              <div>
                                <div className="flex items-center flex-wrap">
                                  <span className="font-medium text-base">{t.category}</span>
                                  <span className={`text-xs rounded-full px-2 py-0.5 ml-2 ${getTransactionTypeColor(t.type)} shadow`}>
                                    {t.type === 'income' ? 'รายรับ' : t.type === 'expense' ? 'รายจ่าย' : 'ลงทุน'}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500 flex items-center flex-wrap">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(t.date)}
                                  {t.description && <span className="ml-2 text-gray-400 overflow-hidden text-ellipsis">- {t.description}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end sm:space-x-2 mt-2 sm:mt-0">
                              <span className={`text-lg font-semibold ${t.type === 'income' ? 'text-green-600' : t.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>{t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''} {parseFloat(t.amount).toLocaleString()} {t.currency}</span>
                              <button
                                className="ml-2 text-blue-500 hover:text-blue-700 transition-colors rounded-full p-2 bg-blue-50 hover:bg-blue-100 shadow"
                                onClick={() => handleEditTransaction(t)}
                                type="button"
                                title="แก้ไข"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                className="ml-2 text-red-500 hover:text-red-700 transition-colors rounded-full p-2 bg-red-50 hover:bg-red-100 shadow"
                                onClick={() => handleDeleteTransaction(t.id)}
                                type="button"
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Savings Goal Card */}
            <div className="bg-white rounded-2xl shadow-lg mb-8 p-6">
              <h2 className="text-lg font-bold mb-4">ตั้งเป้าหมายการออม</h2>
              <form onSubmit={handleSavingsGoalSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1 font-medium">จำนวนเงิน (THB)</label>
                  <input
                    type="number"
                    value={savingsGoal.amount}
                    onChange={(e) => setSavingsGoal({ ...savingsGoal, amount: e.target.value })}
                    className="border rounded-xl p-2 shadow"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1 font-medium">ระยะเวลา (เดือน)</label>
                  <input
                    type="number"
                    value={savingsGoal.months}
                    onChange={(e) => setSavingsGoal({ ...savingsGoal, months: e.target.value })}
                    className="border rounded-xl p-2 shadow"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1 font-medium">คำอธิบาย</label>
                  <input
                    type="text"
                    value={savingsGoal.description}
                    onChange={(e) => setSavingsGoal({ ...savingsGoal, description: e.target.value })}
                    className="border rounded-xl p-2 shadow"
                  />
                </div>
                <button type="submit" className="md:col-span-3 bg-green-500 text-white rounded-xl p-2 hover:bg-green-600 shadow font-medium mt-2">
                  บันทึกเป้าหมาย
                </button>
              </form>

              <div className="mt-6">
                <h3 className="text-md font-semibold mb-2">เป้าหมายการออมทั้งหมด</h3>
                {savingsGoals.length === 0 ? (
                  <p className="text-sm text-gray-500">ยังไม่มีเป้าหมายการออม</p>
                ) : (
                  <div className="divide-y">
                    {savingsGoals.map(goal => (
                      <div key={goal.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 hover:bg-gray-50 rounded-xl transition-colors px-2">
                        {editGoalId === goal.id ? (
                          <div className="flex flex-col md:flex-row gap-2 flex-1">
                            <input className="border rounded-xl p-1 text-sm shadow" type="number" value={editGoal.amount} onChange={e => setEditGoal({ ...editGoal, amount: e.target.value })} />
                            <input className="border rounded-xl p-1 text-sm shadow" type="number" value={editGoal.months} onChange={e => setEditGoal({ ...editGoal, months: e.target.value })} />
                            <input className="border rounded-xl p-1 text-sm shadow" value={editGoal.description} onChange={e => setEditGoal({ ...editGoal, description: e.target.value })} />
                            <button className="bg-green-500 text-white rounded-xl px-3 py-1 text-sm hover:bg-green-600 shadow" onClick={handleEditGoalSave} type="button">บันทึก</button>
                            <button className="bg-gray-300 text-gray-700 rounded-xl px-3 py-1 text-sm hover:bg-gray-400 shadow" onClick={() => setEditGoalId(null)} type="button">ยกเลิก</button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{goal.description || 'ไม่มีคำอธิบาย'}</p>
                              <p className="text-sm text-gray-600">
                                {parseFloat(goal.amount).toLocaleString()} THB / {goal.months} เดือน ={' '}
                                {(goal.amount / goal.months).toLocaleString()} THB/เดือน
                              </p>
                              <p className="text-xs text-gray-400">บันทึกเมื่อ: {formatDate(goal.created_at)}</p>
                              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                                <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalInvestor / goal.amount) * 100)}%` }}></div>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">{Math.min(100, ((totalInvestor / goal.amount) * 100)).toFixed(2)}%</div>
                            </div>
                            <div className="flex gap-2 mt-2 md:mt-0">
                              <button
                                className="text-blue-500 hover:text-blue-700 transition-colors rounded-full p-2 bg-blue-50 hover:bg-blue-100 shadow"
                                onClick={() => handleEditGoal(goal)}
                                type="button"
                                title="แก้ไข"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                className="text-green-600 hover:text-green-800 transition-colors rounded-full p-2 bg-green-50 hover:bg-green-100 shadow"
                                onClick={() => handleCompleteGoal(goal)}
                                type="button"
                                title="สำเร็จ"
                              >
                                <Check className="w-4 h-4" /> สำเร็จ
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700 transition-colors rounded-full p-2 bg-red-50 hover:bg-red-100 shadow"
                                onClick={() => handleDeleteGoal(goal.id)}
                                type="button"
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Simulate Expense Card */}
            <div className="bg-white rounded-2xl shadow-lg mb-8 p-6">
              <h2 className="text-lg font-bold mb-4">จำลองการเพิ่มค่าใช้จ่าย</h2>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <input
                  type="number"
                  placeholder="เพิ่มค่าใช้จ่าย (THB)"
                  value={simulatedExpense}
                  onChange={(e) => setSimulatedExpense(e.target.value)}
                  className="border rounded-xl p-2 w-full md:w-1/3 shadow"
                />
                <button
                  onClick={handleSimulateExpense}
                  className="bg-blue-500 text-white rounded-xl p-2 hover:bg-blue-600 shadow font-medium"
                >
                  จำลอง
                </button>
                {simulatedBalance !== null && (
                  <p className="text-sm text-gray-600 font-medium">
                    ยอดคงเหลือหลังจำลอง: <span className="text-blue-600">{simulatedBalance.toLocaleString()} บาท</span>
                  </p>
                )}
              </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border-t-4 border-red-500">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">ยืนยันการลบ</h3>
                    <button onClick={cancelDelete} className="text-gray-400 hover:text-gray-700">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    คุณแน่ใจหรือไม่ที่จะลบ{deleteType === 'transaction' ? 'รายการธุรกรรม' : 'เป้าหมายการออม'}นี้? <br/>การดำเนินการนี้ไม่สามารถย้อนกลับได้
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelDelete}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors shadow"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow font-medium"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg mt-8">
            <DollarSign className="w-20 h-20 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">ยินดีต้อนรับสู่ระบบบันทึกรายรับรายจ่าย</h2>
            <p className="text-gray-500 mb-6">กรุณาเข้าสู่ระบบเพื่อเริ่มใช้งาน</p>
            <a href="/login" className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow font-medium">
              เข้าสู่ระบบ
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;