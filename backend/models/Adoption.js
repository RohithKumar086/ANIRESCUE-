const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema(
  {
    applicantName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: String,
    city: String,
    animalType: {
      type: String,
      enum: ['Dog', 'Cat', 'Bird', 'Other'],
      required: true,
    },
    preferredBreed: String,
    agePreference: String,

    // Readiness quiz results
    readinessScore: { type: Number, min: 0, max: 100 },
    livingSpace: String,
    familySupport: String,
    petExperience: String,
    timeAvailability: String,
    budgetCapability: String,

    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Completed'],
      default: 'Pending',
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Adoption', adoptionSchema);
