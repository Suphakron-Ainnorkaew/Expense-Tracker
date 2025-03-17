import React, { useEffect, useState } from 'react';
import { DollarSign, RefreshCw, ArrowRight, Globe, AlertCircle } from 'lucide-react';

function Currency() {
  const [rates, setRates] = useState([]);
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('THB');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversionHistory, setConversionHistory] = useState([]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/currency');
        if (!response.ok) {
          throw new Error('Failed to fetch currency rates');
        }
        const data = await response.json();
        // แปลง rate_to_thb เป็น number
        const parsedData = data.map(rate => ({
          ...rate,
          rate_to_thb: parseFloat(rate.rate_to_thb)
        }));
        setRates(parsedData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const calculateConversion = () => {
    if (!amount || !rates.length) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
      setResult('Please enter a valid number');
      return;
    }

    const fromRate = rates.find(r => r.currency_code === fromCurrency)?.rate_to_thb || 1;
    const toRate = rates.find(r => r.currency_code === toCurrency)?.rate_to_thb || 1;

    const amountInTHB = amountNum * fromRate;
    const convertedAmount = amountInTHB / toRate;

    const resultText = `${amountNum.toLocaleString()} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
    setResult(resultText);
    
    const newHistory = [
      { 
        from: fromCurrency, 
        to: toCurrency, 
        amount: amountNum, 
        result: convertedAmount.toFixed(2),
        timestamp: new Date()
      },
      ...conversionHistory
    ].slice(0, 5);
    
    setConversionHistory(newHistory);
  };

  const formatDate = (dateString) => {
    const options = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Date(dateString).toLocaleTimeString('th-TH', options);
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <Globe className="w-5 h-5 mr-2 text-green-500" />
            แปลงสกุลเงิน
          </h2>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm flex items-center text-gray-600 hover:text-green-600"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            รีเฟรชอัตราแลกเปลี่ยน
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin mb-3 h-8 w-8 border-t-2 border-b-2 border-green-500 rounded-full mx-auto"></div>
            <p className="text-gray-600">กำลังโหลดอัตราแลกเปลี่ยน...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 font-medium">เกิดข้อผิดพลาด</p>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">จำนวนเงิน</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="border rounded-lg p-2 pl-8 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">จากสกุลเงิน</label>
                  <div className="relative">
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      className="border rounded-lg p-2 pl-8 w-full appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {rates.map(rate => (
                        <option key={`from-${rate.currency_code}`} value={rate.currency_code}>
                          {rate.currency_code} - {rate.currency_name || rate.currency_code}
                        </option>
                      ))}
                    </select>
                    <Globe className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center my-2">
                <button
                  onClick={handleSwapCurrencies}
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">ไปยังสกุลเงิน</label>
                  <div className="relative">
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      className="border rounded-lg p-2 pl-8 w-full appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {rates.map(rate => (
                        <option key={`to-${rate.currency_code}`} value={rate.currency_code}>
                          {rate.currency_code} - {rate.currency_name || rate.currency_code}
                        </option>
                      ))}
                    </select>
                    <Globe className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={calculateConversion}
                    className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg p-2 transition-colors flex items-center justify-center"
                    disabled={!amount}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    แปลงค่าเงิน
                  </button>
                </div>
              </div>

              {result && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 mt-4">
                  <h3 className="text-sm text-gray-600 mb-2">ผลการแปลงค่าเงิน</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold">{amount} {fromCurrency}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 mx-4" />
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold text-green-600">
                        {parseFloat(amount) * 
                          (rates.find(r => r.currency_code === fromCurrency)?.rate_to_thb || 1) / 
                          (rates.find(r => r.currency_code === toCurrency)?.rate_to_thb || 1)
                        .toFixed(2)} {toCurrency}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    อัตราแลกเปลี่ยน: 1 {fromCurrency} = {
                      ((rates.find(r => r.currency_code === fromCurrency)?.rate_to_thb || 1) / 
                      (rates.find(r => r.currency_code === toCurrency)?.rate_to_thb || 1)).toFixed(4)
                    } {toCurrency}
                  </div>
                </div>
              )}
            </div>

            {conversionHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm text-gray-600 mb-2 px-1">ประวัติการแปลงค่าเงินล่าสุด</h3>
                <div className="divide-y">
                  {conversionHistory.map((item, index) => (
                    <div key={index} className="py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="p-2 rounded-full mr-3 bg-gray-100">
                          <RefreshCw className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {item.amount.toLocaleString()} {item.from} → {item.result} {item.to}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(item.timestamp)}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setAmount(item.amount);
                          setFromCurrency(item.from);
                          setToCurrency(item.to);
                        }}
                        className="text-xs border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-100"
                      >
                        ใช้ซ้ำ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm text-gray-600 mb-3">อัตราแลกเปลี่ยนล่าสุด (เทียบกับ THB)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {rates.filter(r => r.currency_code !== 'THB').map(rate => (
                  <div key={rate.currency_code} className="border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{rate.currency_code}</div>
                      <div className="text-xs text-gray-500">{rate.currency_name || rate.currency_code}</div>
                    </div>
                    <div className="text-right">
                      {/* แปลงเป็น number ก่อนใช้ toFixed */}
                      <div className="font-medium">{parseFloat(rate.rate_to_thb).toFixed(4)}</div>
                      <div className="text-xs text-gray-500">THB</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Currency;