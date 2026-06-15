const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shelter name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: String,
    pincode: String,
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
    },
    email: String,
    website: String,
    operatingHours: {
      type: String,
      default: '9:00 AM - 6:00 PM',
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    capacity: Number,
    currentOccupancy: { type: Number, default: 0 },
    animalTypes: [String],
    facilities: [String],
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    image: String,
    description: String,
  },
  { timestamps: true }
);

// Virtual for distance (computed on query)
shelterSchema.virtual('occupancyPercent').get(function () {
  if (!this.capacity) return null;
  return Math.round((this.currentOccupancy / this.capacity) * 100);
});

module.exports = mongoose.model('Shelter', shelterSchema);
