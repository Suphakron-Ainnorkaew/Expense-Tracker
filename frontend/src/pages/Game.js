import React, { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, Trophy, RefreshCw, TrendingUp, Home, Briefcase, Heart, BookOpen } from 'lucide-react';

function Game() {
  // Game state
  const [money, setMoney] = useState(10000);
  const [wealthScore, setWealthScore] = useState(0);
  const [stage, setStage] = useState(1);
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(1);
  
  // Player stats
  const [assets, setAssets] = useState({
    stocks: 0,
    realEstate: 0,
    savings: 0,
    education: 0,
  });
  
  // Monthly expenses
  const [expenses, setExpenses] = useState({
    rent: 2000,
    food: 1000,
    utilities: 500,
    entertainment: 500,
  });
  
  // Life events (random occurrences)
  const lifeEvents = [
    { title: "โบนัสพิเศษ!", description: "คุณได้รับโบนัสพิเศษจากการทำงานหนัก", moneyChange: 5000, scoreChange: 200 },
    { title: "ค่ารักษาพยาบาล", description: "คุณป่วยและต้องเข้าโรงพยาบาล", moneyChange: -3000, scoreChange: -100 },
    { title: "ซ่อมรถ", description: "รถของคุณเสียและต้องซ่อมด่วน", moneyChange: -2000, scoreChange: -50 },
    { title: "ของขวัญจากญาติ", description: "ญาติให้เงินเป็นของขวัญวันเกิด", moneyChange: 1000, scoreChange: 50 },
    { title: "สินค้าลดราคา", description: "คุณประหยัดเงินได้จากการซื้อของลดราคา", moneyChange: 500, scoreChange: 100 },
  ];
  
  // Investment options
  const investments = [
    { name: "หุ้น", minAmount: 1000, riskLevel: "สูง", returnRate: [-0.2, 0.4] }, // -20% to +40%
    { name: "อสังหาริมทรัพย์", minAmount: 20000, riskLevel: "ปานกลาง", returnRate: [0.05, 0.15] }, // +5% to +15%
    { name: "เงินฝาก", minAmount: 500, riskLevel: "ต่ำ", returnRate: [0.01, 0.03] }, // +1% to +3%
    { name: "การศึกษา", minAmount: 5000, riskLevel: "ต่ำ", returnRate: [0.1, 0.2] }, // +10% to +20% (income boost)
  ];
  
  // Calculate total expenses
  const totalMonthlyExpenses = Object.values(expenses).reduce((sum, expense) => sum + expense, 0);
  
  // Calculate total assets value
  const calculateNetWorth = () => {
    return money + 
           (assets.stocks * (1 + getRandomReturn(investments[0].returnRate))) + 
           (assets.realEstate * (1 + getRandomReturn(investments[1].returnRate))) + 
           assets.savings * (1 + getRandomReturn(investments[2].returnRate)) +
           assets.education * 0.1; // Education gives 10% boost to wealth score
  };
  
  // Get random return based on investment type
  const getRandomReturn = (range) => {
    return Math.random() * (range[1] - range[0]) + range[0];
  };
  
  // Process monthly update
  useEffect(() => {
    if (!gameOver && stage === 'monthly') {
      // Deduct monthly expenses
      const newMoney = money - totalMonthlyExpenses;
      
      if (newMoney < 0) {
        setMessage(`เงินหมด! คุณไม่สามารถจ่ายค่าใช้จ่ายประจำเดือนได้`);
        setGameOver(true);
        return;
      }
      
      setMoney(newMoney);
      
      // Random life event (20% chance)
      if (Math.random() < 0.2) {
        const event = lifeEvents[Math.floor(Math.random() * lifeEvents.length)];
        handleLifeEvent(event);
      }
      
      // Update wealth score
      const netWorth = calculateNetWorth();
      setWealthScore(Math.floor(netWorth / 1000)); // 1 point for every 1,000 in net worth
      
      // Next month
      if (month < 12) {
        setMonth(month + 1);
      } else {
        setMonth(1);
        setYear(year + 1);
      }
      
      // Check win condition
      if (wealthScore >= 100) {
        setMessage('ยินดีด้วย! คุณสร้างความมั่งคั่งได้สำเร็จ');
        setGameOver(true);
      }
      
      setStage('action');
    }
  }, [stage]);
  
  // Handle life events
  const handleLifeEvent = (event) => {
    const newMoney = money + event.moneyChange;
    const newScore = wealthScore + event.scoreChange;
    
    setMoney(Math.max(0, newMoney));
    setWealthScore(Math.max(0, newScore));
    setMessage(`${event.title}: ${event.description} (${event.moneyChange >= 0 ? '+' : ''}${event.moneyChange.toLocaleString()} บาท)`);
  };
  
  // Handle investment
  const handleInvestment = (index, amount) => {
    const investment = investments[index];
    
    if (money < amount) {
      setMessage(`เงินไม่พอลงทุน ${investment.name}`);
      return;
    }
    
    setMoney(money - amount);
    
    // Update assets based on investment type
    switch (index) {
      case 0: // Stocks
        setAssets({...assets, stocks: assets.stocks + amount});
        break;
      case 1: // Real Estate
        setAssets({...assets, realEstate: assets.realEstate + amount});
        break;
      case 2: // Savings
        setAssets({...assets, savings: assets.savings + amount});
        break;
      case 3: // Education
        setAssets({...assets, education: assets.education + amount});
        break;
    }
    
    setMessage(`ลงทุนใน${investment.name}สำเร็จ: ${amount.toLocaleString()} บาท`);
    setStage('monthly');
  };
  
  // Handle expense adjustment
  const handleExpenseChange = (category, amount) => {
    const newExpenses = {...expenses, [category]: amount};
    setExpenses(newExpenses);
    setMessage(`ปรับค่าใช้จ่าย ${category} เป็น ${amount.toLocaleString()} บาท`);
  };
  
  // Next month button
  const nextMonth = () => {
    setStage('monthly');
  };
  
  // Reset game
  const resetGame = () => {
    setMoney(10000);
    setWealthScore(0);
    setStage('action');
    setMessage('');
    setGameOver(false);
    setMonth(1);
    setYear(1);
    setAssets({
      stocks: 0,
      realEstate: 0,
      savings: 0,
      education: 0,
    });
    setExpenses({
      rent: 2000,
      food: 1000,
      utilities: 500,
      entertainment: 500,
    });
  };

  return (
    <div className="max-w-4xl mx-auto pt-16 md:pt-20 px-4">
      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-500" />
            Wealth Builder - เกมบริหารการเงินขั้นสูง
          </h2>
          <div className="flex items-center">
            <span className="mr-4 text-gray-600">ปีที่ {year} เดือนที่ {month}</span>
            <button
              onClick={resetGame}
              className="text-sm flex items-center text-gray-600 hover:text-green-600"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              เริ่มใหม่
            </button>
          </div>
        </div>

        <div className="p-4">
          {!gameOver ? (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-md font-medium mb-2 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                    สถานะการเงิน
                  </h3>
                  <p className="text-gray-600">เงินสด: <span className="font-semibold">{money.toLocaleString()} บาท</span></p>
                  <p className="text-gray-600">คะแนนความมั่งคั่ง: <span className="font-semibold">{wealthScore}</span> / 100</p>
                  <p className="text-gray-600">ค่าใช้จ่ายต่อเดือน: <span className="font-semibold">{totalMonthlyExpenses.toLocaleString()} บาท</span></p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-md font-medium mb-2 flex items-center">
                    <Briefcase className="w-4 h-4 mr-1 text-blue-500" />
                    สินทรัพย์
                  </h3>
                  <p className="text-gray-600">หุ้น: <span className="font-semibold">{assets.stocks.toLocaleString()} บาท</span></p>
                  <p className="text-gray-600">อสังหาริมทรัพย์: <span className="font-semibold">{assets.realEstate.toLocaleString()} บาท</span></p>
                  <p className="text-gray-600">เงินฝาก: <span className="font-semibold">{assets.savings.toLocaleString()} บาท</span></p>
                  <p className="text-gray-600">การศึกษา: <span className="font-semibold">{assets.education.toLocaleString()} บาท</span></p>
                </div>
              </div>

              {message && (
                <div className="my-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-blue-600">{message}</p>
                </div>
              )}

              {stage === 'action' && (
                <div className="mt-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                      การลงทุน
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {investments.map((investment, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <h4 className="font-medium">{investment.name}</h4>
                          <p className="text-sm text-gray-600">ความเสี่ยง: {investment.riskLevel}</p>
                          <p className="text-sm text-gray-600">ผลตอบแทน: {investment.returnRate[0] * 100}% - {investment.returnRate[1] * 100}%</p>
                          <div className="mt-2 flex space-x-2">
                            <button 
                              onClick={() => handleInvestment(index, investment.minAmount)}
                              className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                              disabled={money < investment.minAmount}
                            >
                              {investment.minAmount.toLocaleString()} ฿
                            </button>
                            <button 
                              onClick={() => handleInvestment(index, investment.minAmount * 5)}
                              className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              disabled={money < investment.minAmount * 5}
                            >
                              {(investment.minAmount * 5).toLocaleString()} ฿
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <Home className="w-5 h-5 mr-2 text-orange-500" />
                      ค่าใช้จ่ายประจำเดือน
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border rounded-lg p-3">
                        <h4 className="font-medium">ค่าเช่า/ที่อยู่อาศัย</h4>
                        <div className="mt-2 flex items-center space-x-2">
                          <button 
                            onClick={() => handleExpenseChange('rent', 1000)}
                            className={`px-2 py-1 text-sm rounded ${expenses.rent === 1000 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                          >
                            ประหยัด: 1,000 ฿
                          </button>
                          <button 
                            onClick={() => handleExpenseChange('rent', 2000)}
                            className={`px-2 py-1 text-sm rounded ${expenses.rent === 2000 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                          >
                            ปานกลาง: 2,000 ฿
                          </button>
                          <button 
                            onClick={() => handleExpenseChange('rent', 4000)}
                            className={`px-2 py-1 text-sm rounded ${expenses.rent === 4000 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                          >
                            หรูหรา: 4,000 ฿
                          </button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3">
                        <h4 className="font-medium">อาหารและเครื่องดื่ม</h4>
                        <div className="mt-2 flex items-center space-x-2">
                          <button 
                            onClick={() => handleExpenseChange('food', 500)}
                            className={`px-2 py-1 text-sm rounded ${expenses.food === 500 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                          >
                            ประหยัด: 500 ฿
                          </button>
                          <button 
                            onClick={() => handleExpenseChange('food', 1000)}
                            className={`px-2 py-1 text-sm rounded ${expenses.food === 1000 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                          >
                            ปานกลาง: 1,000 ฿
                          </button>
                          <button 
                            onClick={() => handleExpenseChange('food', 2000)}
                            className={`px-2 py-1 text-sm rounded ${expenses.food === 2000 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                          >
                            หรูหรา: 2,000 ฿
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={nextMonth}
                    className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors mt-4 flex items-center justify-center"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    ดำเนินชีวิตต่อไป (ข้ามไปเดือนถัดไป)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              {wealthScore >= 100 ? (
                <>
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-green-600">ชนะแล้ว!</h3>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-red-600">เกมจบ!</h3>
                </>
              )}
              <p className="text-gray-600 mt-2">{message}</p>
              <p className="text-gray-500 mt-1">คะแนนความมั่งคั่งสุดท้าย: {wealthScore}</p>
              <p className="text-gray-500">อายุการลงทุน: {year} ปี {month} เดือน</p>
              <button
                onClick={resetGame}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                เล่นใหม่
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Game;