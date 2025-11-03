import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiCalculator, HiClock, HiCurrencyDollar, HiTrendingUp } from 'react-icons/hi';

const ROICalculator = () => {
  const [inputs, setInputs] = useState({
    currentWPM: 200,
    hoursPerDay: 2,
    daysPerWeek: 5,
    documentsPerDay: 10,
    avgDocumentPages: 5,
    avgPageTime: 5 // minutes
  });

  const calculateSavings = () => {
    const currentSpeed = inputs.currentWPM;
    const newSpeed = 1000; // Target WPM after course
    const speedImprovement = newSpeed / currentSpeed;
    
    // Time saved per document (in minutes)
    const timePerDocument = inputs.avgDocumentPages * inputs.avgPageTime;
    const newTimePerDocument = timePerDocument / speedImprovement;
    const timeSavedPerDocument = timePerDocument - newTimePerDocument;
    
    // Daily savings
    const dailySavings = timeSavedPerDocument * inputs.documentsPerDay;
    const weeklySavings = dailySavings * inputs.daysPerWeek;
    const monthlySavings = weeklySavings * 4;
    const yearlySavings = monthlySavings * 12;
    
    // Value calculation (assuming time = money)
    // Average hourly rate in Vietnam (conservative estimate)
    const hourlyRate = 50000; // VND
    const dailyValue = (dailySavings / 60) * hourlyRate;
    const monthlyValue = dailyValue * inputs.daysPerWeek * 4;
    const yearlyValue = monthlyValue * 12;
    
    // ROI: Course cost = 1,200,000 VND
    const courseCost = 1200000;
    const roiPercentage = ((yearlyValue - courseCost) / courseCost) * 100;
    const paybackMonths = courseCost / monthlyValue;

    return {
      timeSaved: {
        daily: dailySavings,
        weekly: weeklySavings,
        monthly: monthlySavings,
        yearly: yearlySavings
      },
      value: {
        daily: dailyValue,
        monthly: monthlyValue,
        yearly: yearlyValue
      },
      roi: roiPercentage,
      paybackMonths: paybackMonths,
      speedImprovement: speedImprovement.toFixed(1)
    };
  };

  const handleChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: Math.max(1, Number(value) || 0)
    }));
  };

  const savings = calculateSavings();

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours} giờ ${mins} phút`;
    }
    return `${mins} phút`;
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' VNĐ';
  };

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1A66CC] to-[#1555B0] rounded-full mb-4">
            <HiCalculator className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A66CC] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Tính toán ROI của bạn
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Xem bạn sẽ tiết kiệm bao nhiêu thời gian và tiền bạc với kỹ năng đọc nhanh
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Panel */}
            <motion.div
              className="bg-gray-50 rounded-2xl p-6 md:p-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Thông tin của bạn</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tốc độ đọc hiện tại (WPM)
                  </label>
                  <input
                    type="number"
                    value={inputs.currentWPM}
                    onChange={(e) => handleChange('currentWPM', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none"
                    min="100"
                    max="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số giờ đọc mỗi ngày
                  </label>
                  <input
                    type="number"
                    value={inputs.hoursPerDay}
                    onChange={(e) => handleChange('hoursPerDay', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none"
                    min="0.5"
                    max="8"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số ngày đọc mỗi tuần
                  </label>
                  <input
                    type="number"
                    value={inputs.daysPerWeek}
                    onChange={(e) => handleChange('daysPerWeek', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none"
                    min="1"
                    max="7"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tài liệu đọc mỗi ngày
                  </label>
                  <input
                    type="number"
                    value={inputs.documentsPerDay}
                    onChange={(e) => handleChange('documentsPerDay', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none"
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            </motion.div>

            {/* Results Panel */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {/* Time Saved */}
              <div className="bg-gradient-to-br from-[#34D399] to-[#10B981] rounded-2xl p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <HiClock className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Thời gian tiết kiệm</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold">{formatTime(savings.timeSaved.daily)}</div>
                    <div className="text-sm opacity-90">Mỗi ngày</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{formatTime(savings.timeSaved.monthly)}</div>
                    <div className="text-sm opacity-90">Mỗi tháng</div>
                  </div>
                </div>
              </div>

              {/* Value */}
              <div className="bg-gradient-to-br from-[#1A66CC] to-[#1555B0] rounded-2xl p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <HiCurrencyDollar className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Giá trị tiết kiệm</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{formatMoney(savings.value.monthly)}</div>
                    <div className="text-sm opacity-90">Mỗi tháng</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatMoney(savings.value.yearly)}</div>
                    <div className="text-sm opacity-90">Mỗi năm</div>
                  </div>
                </div>
              </div>

              {/* ROI */}
              <div className="bg-white border-2 border-[#34D399] rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <HiTrendingUp className="w-6 h-6 text-[#34D399]" />
                  <h3 className="text-xl font-bold text-gray-900">ROI & Hoàn vốn</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-3xl font-bold text-[#1A66CC]">
                      {savings.roi > 0 ? `+${savings.roi.toFixed(0)}%` : `${savings.roi.toFixed(0)}%`}
                    </div>
                    <div className="text-sm text-gray-600">ROI trong năm đầu</div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="text-2xl font-bold text-[#34D399]">
                      {savings.paybackMonths < 12 
                        ? `${savings.paybackMonths.toFixed(1)} tháng`
                        : `${(savings.paybackMonths / 12).toFixed(1)} năm`
                      }
                    </div>
                    <div className="text-sm text-gray-600">Thời gian hoàn vốn</div>
                  </div>
                </div>
              </div>

              {/* Speed Improvement */}
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Tốc độ cải thiện</div>
                <div className="text-2xl font-bold text-[#1A66CC]">
                  {savings.speedImprovement}x nhanh hơn
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;

