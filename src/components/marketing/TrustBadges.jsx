import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaAward, FaUsers, FaLock, FaCheckCircle } from 'react-icons/fa';

const TrustBadges = () => {
  const badges = [
    {
      icon: FaShieldAlt,
      title: 'Đảm bảo hoàn tiền',
      description: 'Hoàn tiền 100% nếu không hài lòng sau buổi đầu',
      color: 'text-[#1A66CC]'
    },
    {
      icon: FaAward,
      title: 'Chứng chỉ uy tín',
      description: 'Nhận chứng chỉ hoàn thành sau khóa học',
      color: 'text-[#34D399]'
    },
    {
      icon: FaUsers,
      title: '500+ học viên',
      description: 'Hơn 500 học viên đã thành công',
      color: 'text-[#1A66CC]'
    },
    {
      icon: FaLock,
      title: 'Thanh toán an toàn',
      description: 'Bảo mật thông tin thanh toán',
      color: 'text-[#34D399]'
    },
    {
      icon: FaCheckCircle,
      title: '98% tỷ lệ thành công',
      description: 'Gần như tất cả học viên đạt mục tiêu',
      color: 'text-[#1A66CC]'
    }
  ];

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A66CC] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Tại sao chọn chúng tôi?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Cam kết chất lượng và uy tín đã được chứng minh
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 ${badge.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {badge.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {badge.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;

