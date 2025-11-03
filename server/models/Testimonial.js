import mongoose from 'mongoose';

const testimonialSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Vui lòng nhập vai trò'],
      trim: true,
    },
    avatar: {
      type: String,
      default: '👤',
    },
    quote: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung đánh giá'],
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    improvement: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Testimonial phải có người tạo'],
    },
    createdAtBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
testimonialSchema.index({ isActive: 1, displayOrder: 1 });
testimonialSchema.index({ createdAt: -1 });
testimonialSchema.index({ user: 1 }); // For finding user's testimonials

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;

