import React from 'react'
import { motion } from 'framer-motion'
import { HiTrendingUp, HiLightBulb, HiBriefcase, HiClock } from 'react-icons/hi'

const Outcomes = () => {
  // Simple smooth line chart (months vs WPM)
  const speedData = [
    { month: 1, wpm: 200 },
    { month: 2, wpm: 600 },
    { month: 3, wpm: 1000 }
  ]

  const Chart = () => {
    const width = 600
    const height = 260
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }

    const minX = 1
    const maxX = 3
    const minY = 0
    const maxY = 1100

    const xScale = (x) => {
      return padding.left + ((x - minX) / (maxX - minX)) * (width - padding.left - padding.right)
    }

    const yScale = (y) => {
      return height - padding.bottom - ((y - minY) / (maxY - minY)) * (height - padding.top - padding.bottom)
    }

    // Smooth path using Catmull-Rom to Bezier conversion (simple approximation)
    const points = speedData.map(d => [xScale(d.month), yScale(d.wpm)])

    const pathD = () => {
      if (points.length === 0) return ''
      if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`

      const d = [`M ${points[0][0]} ${points[0][1]}`]
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? i : i - 1]
        const p1 = points[i]
        const p2 = points[i + 1]
        const p3 = points[i + 2] || p2

        const smoothing = 0.2
        const cp1x = p1[0] + (p2[0] - p0[0]) * smoothing
        const cp1y = p1[1] + (p2[1] - p0[1]) * smoothing
        const cp2x = p2[0] - (p3[0] - p1[0]) * smoothing
        const cp2y = p2[1] - (p3[1] - p1[1]) * smoothing

        d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`)
      }
      return d.join(' ')
    }

    const xTicks = [1, 2, 3]
    const yTicks = [0, 200, 400, 600, 800, 1000]

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64">
          {/* Axes */}
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#e5e7eb" strokeWidth="2" />
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#e5e7eb" strokeWidth="2" />

          {/* Grid lines */}
          {yTicks.map((t, idx) => (
            <line key={idx} x1={padding.left} y1={yScale(t)} x2={width - padding.right} y2={yScale(t)} stroke="#f3f4f6" />
          ))}

          {/* Labels */}
          {xTicks.map((t) => (
            <text key={`x-${t}`} x={xScale(t)} y={height - padding.bottom + 24} textAnchor="middle" className="fill-gray-500 text-xs">
              Tháng {t}
            </text>
          ))}
          {yTicks.map((t) => (
            <text key={`y-${t}`} x={padding.left - 10} y={yScale(t)} textAnchor="end" dominantBaseline="middle" className="fill-gray-500 text-xs">
              {t}
            </text>
          ))}

          {/* Axis titles */}
          <text x={(width - padding.left - padding.right) / 2 + padding.left} y={height - 4} textAnchor="middle" className="fill-gray-700 text-sm font-medium">
            Thời gian (tháng)
          </text>
          <text transform={`rotate(-90 ${12} ${height / 2})`} x={12} y={height / 2} textAnchor="middle" className="fill-gray-700 text-sm font-medium">
            Tốc độ đọc (WPM)
          </text>

          {/* Smooth line */}
          <path d={pathD()} fill="none" stroke="#10b981" strokeWidth="3" />

          {/* Area under curve (subtle) */}
          <path d={`${pathD()} L ${width - padding.right} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`} fill="url(#grad)" opacity="0.15" />

          {/* Gradient */}
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={4} fill="#10b981" />
              <text x={p[0]} y={p[1] - 10} textAnchor="middle" className="fill-gray-700 text-xs font-medium">
                {speedData[i].wpm}
              </text>
            </g>
          ))}
        </svg>
      </div>
    )
  }
  const outcomes = [
    {
      icon: HiTrendingUp,
      title: "Đọc 900–1000+ từ/phút",
      description: "Tăng tốc độ đọc lên 5 lần so với trước đây, giúp bạn xử lý thông tin nhanh chóng.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: HiLightBulb,
      title: "Hiểu sâu, nhớ lâu hơn",
      description: "Áp dụng kỹ thuật đọc hiệu quả giúp bạn nắm bắt và ghi nhớ thông tin tốt hơn.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: HiBriefcase,
      title: "Áp dụng cho học tập, nghiên cứu, công việc",
      description: "Kỹ năng đọc nhanh có thể sử dụng trong mọi lĩnh vực của cuộc sống.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: HiClock,
      title: "Xây dựng routine đọc cá nhân lâu dài",
      description: "Hình thành thói quen đọc hiệu quả và duy trì kỹ năng suốt đời.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    }
  ]

  return (
    <section className="section-padding gradient-bg">
      <div className="container-custom">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A66CC] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Kết quả đạt được sau khóa học
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Những lợi ích thiết thực mà bạn sẽ nhận được khi hoàn thành khóa học Kỹ Thuật Đọc Nhanh
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {outcomes.map((outcome, index) => (
            <motion.div
              key={index}
              className={`${outcome.bgColor} rounded-2xl p-8 hover:shadow-xl transition-all duration-300 card-hover`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${outcome.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <outcome.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {outcome.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {outcome.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Speed Comparison Chart */}
        <motion.div 
          className="bg-white rounded-2xl p-8 md:p-12 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            Biểu đồ tốc độ đọc trước và sau khóa học
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Before */}
            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-700 mb-4">Trước khóa học</h4>
              <div className="relative">
                <div className="w-32 h-32 mx-auto bg-red-100 rounded-full flex items-center justify-center border-8 border-red-300">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">200</div>
                    <div className="text-sm text-red-500">WPM</div>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Chậm
                </div>
              </div>
              <p className="text-gray-600 mt-4">Tốc độ đọc trung bình của người Việt Nam</p>
            </div>

            {/* After (restored) */}
            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-700 mb-4">Sau khóa học</h4>
              <div className="relative">
                <div className="w-32 h-32 mx-auto bg-green-100 rounded-full flex items-center justify-center border-8 border-green-300">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">1000+</div>
                    <div className="text-sm text-green-500">WPM</div>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Nhanh
                </div>
              </div>
              <p className="text-gray-600 mt-4">Tốc độ đọc của người đọc nhanh chuyên nghiệp</p>
            </div>
          </div>

          
        </motion.div>

        {/* Success Rate */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-6 py-3 rounded-full">
            <HiTrendingUp className="w-5 h-5" />
            <span className="font-semibold">98% học viên đạt được mục tiêu sau 6 buổi học</span>
          </div>

          {/* New graph below: Months vs WPM */}
          <div className="mt-12">
            <h4 className="text-xl font-semibold text-gray-700 mb-4 text-center">Biểu đồ tiến bộ theo thời gian</h4>
            <Chart />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Outcomes
