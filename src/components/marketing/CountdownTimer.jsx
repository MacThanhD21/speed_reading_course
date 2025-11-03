import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiClock } from 'react-icons/hi';

const CountdownTimer = ({ endDate, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setExpired(true);
        if (onExpire) onExpire();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  if (expired) {
    return null;
  }

  const TimeUnit = ({ value, label }) => (
    <motion.div
      className="flex flex-col items-center justify-center bg-white rounded-lg px-3 py-2 md:px-4 md:py-3 min-w-[60px] md:min-w-[70px]"
      initial={{ scale: 1 }}
      animate={{ scale: timeLeft.seconds % 2 === 0 ? 1.05 : 1 }}
      transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
    >
      <span className="text-2xl md:text-3xl font-bold text-[#1A66CC]">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-xs md:text-sm text-gray-600 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {label}
      </span>
    </motion.div>
  );

  return (
    <motion.div
      className="bg-gradient-to-r from-[#1A66CC] to-[#124A9D] rounded-xl p-4 md:p-6 text-white shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <HiClock className="w-5 h-5 md:w-6 md:h-6" />
        <h3 className="text-lg md:text-xl font-bold text-center">
          Ưu đãi kết thúc sau:
        </h3>
      </div>
      
      <div className="flex items-center justify-center gap-2 md:gap-3">
        <TimeUnit value={timeLeft.days} label="Ngày" />
        <span className="text-xl font-bold">:</span>
        <TimeUnit value={timeLeft.hours} label="Giờ" />
        <span className="text-xl font-bold">:</span>
        <TimeUnit value={timeLeft.minutes} label="Phút" />
        <span className="text-xl font-bold">:</span>
        <TimeUnit value={timeLeft.seconds} label="Giây" />
      </div>

      <p className="text-center text-sm md:text-base text-blue-100 mt-3">
        ⚡ Đăng ký ngay để không bỏ lỡ ưu đãi đặc biệt này!
      </p>
    </motion.div>
  );
};

export default CountdownTimer;

