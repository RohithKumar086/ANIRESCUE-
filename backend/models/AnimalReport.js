const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const animalReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
      default: () => 'RPT-' + uuidv4().split('-')[0].toUpperCase(),
    },
    animalType: {
      type: String,
      required: [true, 'Animal type is required'],
      enum: ['Dog', 'Cat', 'Bird', 'Cow', 'Horse', 'Monkey', 'Snake', 'Other'],
    },
    injuryDescription: {
      type: String,
      required: [true, 'Injury description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    location: {
      address: { type: String, required: true },
      city: String,
      state: String,
      pincode: String,
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
    },
    photo: String, // file path
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Rescued', 'Completed'],
      default: 'Pending',
    },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    adminNotes: String,
  },
  { timestamps: true }
);

// Auto-add status to history on status change
animalReportSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({ status: this.status });
  }
  next();
});

module.exports = mongoose.model('AnimalReport', animalReportSchema);
