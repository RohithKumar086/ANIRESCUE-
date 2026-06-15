const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: String,
    skills: [
      {
        type: String,
        enum: [
          'Animal Handling',
          'First Aid',
          'Transportation',
          'Veterinary',
          'Photography',
          'Social Media',
          'Fundraising',
          'Foster Care',
          'Other',
        ],
      },
    ],
    availability: {
      type: String,
      enum: ['Weekdays', 'Weekends', 'Both', 'Emergency Only'],
    },
    experience: {
      type: String,
      enum: ['No Experience', '< 1 Year', '1-3 Years', '3+ Years'],
    },
    bio: String,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    totalRescues: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Volunteer', volunteerSchema);
