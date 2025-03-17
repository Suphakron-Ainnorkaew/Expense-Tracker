import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, PieChart, RefreshCw, ArrowUpRight, Info } from 'lucide-react';

function Investor() {
  const [cryptoData, setCryptoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [riskLevel, setRiskLevel] = useState('all');

  // ข้อมูล static สำหรับการแนะนำการลงทุน
  const investmentOptions = [
    {
      title: 'หุ้น (Stocks)',
      description: 'การลงทุนในหุ้นของบริษัทต่างๆ มีโอกาสได้ผลตอบแทนสูงแต่ก็มีความเสี่ยงตามภาวะตลาด',
      pros: 'ผลตอบแทนสูง, สภาพคล่องดี',
      cons: 'ความผันผวนสูง, ต้องใช้ความรู้',
      riskLevel: 'medium',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'บิทคอยน์ (Bitcoin)',
      description: 'สกุลเงินดิจิทัลที่ได้รับความนิยมสูงสุด ราคามีความผันผวนมาก',
      pros: 'เติบโตสูงในระยะยาว, ไม่ขึ้นกับรัฐบาล',
      cons: 'ความเสี่ยงสูง, ต้องมี wallet',
      riskLevel: 'high',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'กองทุนรวม (Mutual Funds)',
      description: 'การลงทุนที่รวมเงินจากหลายคนไปบริหารโดยผู้เชี่ยวชาญ',
      pros: 'กระจายความเสี่ยง, เหมาะสำหรับมือใหม่',
      cons: 'ค่าธรรมเนียม, ผลตอบแทนปานกลาง',
      riskLevel: 'low',
      icon: <PieChart className="w-5 h-5" />,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'ฟอเร็กซ์ (Forex)',
      description: 'การซื้อขายสกุลเงินต่างประเทศ เน้นเก็งกำไรจากอัตราแลกเปลี่ยน',
      pros: 'สภาพคล่องสูง, เปิด 24 ชม.',
      cons: 'ความเสี่ยงสูง, ต้องมีความชำนาญ',
      riskLevel: 'high',
      icon: <RefreshCw className="w-5 h-5" />,
      color: 'bg-orange-100 text-orange-600'
    },
  ];

  // ดึงข้อมูลราคา Bitcoin จาก API ภายนอก
  useEffect(() => {
    const fetchCryptoData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin&vs_currencies=thb,usd&include_24hr_change=true'
        );
        const data = await response.json();
        setCryptoData(data);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCryptoData();
    // ตั้งเวลาดึงข้อมูลทุก 5 นาที
    const interval = setInterval(fetchCryptoData, 300000);
    
    return () => clearInterval(interval);
  }, []);

  // กรองตัวเลือกการลงทุนตามระดับความเสี่ยง
  const filteredOptions = riskLevel === 'all' 
    ? investmentOptions 
    : investmentOptions.filter(option => option.riskLevel === riskLevel);

  // สร้างฟังก์ชันสำหรับแสดงสีตามการเปลี่ยนแปลงของราคา
  const getPriceChangeColor = (change) => {
    if (!change) return "text-gray-500";
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h1 className="text-xl font-semibold">ทางเลือกการลงทุน</h1>
          <div className="flex space-x-2">
            <select
              className="px-3 py-2 border rounded-lg text-sm bg-white"
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
            >
              <option value="all">ทุกระดับความเสี่ยง</option>
              <option value="low">ความเสี่ยงต่ำ</option>
              <option value="medium">ความเสี่ยงปานกลาง</option>
              <option value="high">ความเสี่ยงสูง</option>
            </select>
          </div>
        </div>

        {/* แสดงข้อมูล Cryptocurrency จาก API */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <ArrowUpRight className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-lg font-semibold">ราคา Cryptocurrency (แบบเรียลไทม์)</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" />
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cryptoData && cryptoData.bitcoin && (
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Bitcoin (BTC)</span>
                    <div className="p-1 rounded-full bg-amber-200">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>
                  <div className="text-lg font-semibold">{cryptoData.bitcoin.thb.toLocaleString()} บาท</div>
                  <div className="text-sm text-gray-600">${cryptoData.bitcoin.usd.toLocaleString()}</div>
                  {cryptoData.bitcoin.usd_24h_change && (
                    <div className={`text-sm mt-1 ${getPriceChangeColor(cryptoData.bitcoin.usd_24h_change)}`}>
                      {cryptoData.bitcoin.usd_24h_change.toFixed(2)}% (24h)
                    </div>
                  )}
                </div>
              )}
              
              {cryptoData && cryptoData.ethereum && (
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Ethereum (ETH)</span>
                    <div className="p-1 rounded-full bg-indigo-200">
                      <DollarSign className="w-4 h-4 text-indigo-600" />
                    </div>
                  </div>
                  <div className="text-lg font-semibold">{cryptoData.ethereum.thb.toLocaleString()} บาท</div>
                  <div className="text-sm text-gray-600">${cryptoData.ethereum.usd.toLocaleString()}</div>
                  {cryptoData.ethereum.usd_24h_change && (
                    <div className={`text-sm mt-1 ${getPriceChangeColor(cryptoData.ethereum.usd_24h_change)}`}>
                      {cryptoData.ethereum.usd_24h_change.toFixed(2)}% (24h)
                    </div>
                  )}
                </div>
              )}
              
              {cryptoData && cryptoData.binancecoin && (
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Binance Coin (BNB)</span>
                    <div className="p-1 rounded-full bg-yellow-200">
                      <DollarSign className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                  <div className="text-lg font-semibold">{cryptoData.binancecoin.thb.toLocaleString()} บาท</div>
                  <div className="text-sm text-gray-600">${cryptoData.binancecoin.usd.toLocaleString()}</div>
                  {cryptoData.binancecoin.usd_24h_change && (
                    <div className={`text-sm mt-1 ${getPriceChangeColor(cryptoData.binancecoin.usd_24h_change)}`}>
                      {cryptoData.binancecoin.usd_24h_change.toFixed(2)}% (24h)
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <Info className="w-3 h-3 mr-1" />
            ราคาอัปเดตทุก 5 นาที จาก CoinGecko API
          </div>
        </div>

        {/* ข้อมูลการลงทุนแบบ static */}
        <div>
          <div className="flex items-center mb-3">
            <PieChart className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-lg font-semibold">ทางเลือกการลงทุน</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOptions.map((option, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${selectedOption === index ? 'ring-2 ring-blue-400' : ''}`}
                onClick={() => setSelectedOption(selectedOption === index ? null : index)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${option.color}`}>
                      {option.icon}
                    </div>
                    <h2 className="text-lg font-semibold">{option.title}</h2>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full 
                    ${option.riskLevel === 'low' ? 'bg-green-100 text-green-700' : 
                      option.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'}`}>
                    {option.riskLevel === 'low' ? 'ความเสี่ยงต่ำ' : 
                     option.riskLevel === 'medium' ? 'ความเสี่ยงปานกลาง' : 
                     'ความเสี่ยงสูง'}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">{option.description}</p>
                
                {selectedOption === index && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-green-800 mb-1">ข้อดี</div>
                        <div className="text-sm text-gray-600">{option.pros}</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-red-800 mb-1">ข้อเสีย</div>
                        <div className="text-sm text-gray-600">{option.cons}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
                      <span>การลงทุนมีความเสี่ยง ควรศึกษาข้อมูลก่อนตัดสินใจลงทุน</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* ข้อความแนะนำการลงทุน */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <Info className="w-5 h-5 mr-3 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">คำแนะนำการลงทุน</h3>
              <p className="text-sm text-gray-600">
                การลงทุนมีความเสี่ยง ควรกระจายการลงทุนในหลายประเภทสินทรัพย์ ศึกษาข้อมูลให้ดีก่อนตัดสินใจ 
                และลงทุนด้วยเงินที่พร้อมรับความเสี่ยงได้เท่านั้น
              </p>
              <p className="mt-1 text-sm text-gray-600">
                ควรปรึกษาผู้เชี่ยวชาญทางการเงินเพื่อวางแผนการลงทุนที่เหมาะสมกับเป้าหมายและความเสี่ยงที่ยอมรับได้
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Investor;