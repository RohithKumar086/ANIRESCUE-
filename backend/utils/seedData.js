require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { Shelters, Users } = require('../config/db');

const shelters = [
  {
    name: 'Paws & Claws Animal Shelter',
    address: '12 MG Road, Indiranagar',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560038',
    contactNumber: '+91-80-2345-6789',
    email: 'info@pawsclaws.org',
    website: 'https://pawsclaws.org',
    operatingHours: '8:00 AM - 8:00 PM',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    capacity: 150, currentOccupancy: 87,
    animalTypes: ['Dog', 'Cat', 'Bird'],
    facilities: ['Veterinary Care', 'Grooming', 'Training', 'Foster Program'],
    isVerified: true, rating: 4.8, isActive: true,
    description: "One of Bangalore's premier animal shelters with state-of-the-art facilities.",
  },
  {
    name: 'Hope for Strays Foundation',
    address: '45 Anna Salai, T. Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600017',
    contactNumber: '+91-44-2345-7890',
    email: 'contact@hopeforstrays.in',
    website: 'https://hopeforstrays.in',
    operatingHours: '9:00 AM - 7:00 PM',
    coordinates: { lat: 13.0827, lng: 80.2707 },
    capacity: 200, currentOccupancy: 120,
    animalTypes: ['Dog', 'Cat', 'Cow', 'Bird'],
    facilities: ['24/7 Emergency', 'Vaccination', 'Spay/Neuter', 'Adoption Events'],
    isVerified: true, rating: 4.9, isActive: true,
    description: 'A refuge for abandoned and injured animals in Chennai, running since 2005.',
  },
  {
    name: 'Mumbai Animal Care Society',
    address: '78 Linking Road, Bandra',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    contactNumber: '+91-22-2345-6780',
    email: 'help@mumbaiacs.org',
    website: 'https://mumbaiacs.org',
    operatingHours: '7:00 AM - 9:00 PM',
    coordinates: { lat: 19.076, lng: 72.8777 },
    capacity: 300, currentOccupancy: 180,
    animalTypes: ['Dog', 'Cat', 'Bird', 'Monkey'],
    facilities: ['Emergency Surgery', 'ICU', 'Rehabilitation', 'Foster Network'],
    isVerified: true, rating: 4.7, isActive: true,
    description: "Mumbai's largest animal welfare organization with a dedicated emergency rescue team.",
  },
  {
    name: 'Delhi Animal Rescue Hub',
    address: '23 Vasant Kunj, Sector C',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110070',
    contactNumber: '+91-11-2345-6781',
    email: 'rescue@delhianimal.org',
    operatingHours: '8:00 AM - 8:00 PM',
    coordinates: { lat: 28.7041, lng: 77.1025 },
    capacity: 250, currentOccupancy: 150,
    animalTypes: ['Dog', 'Cat', 'Cow', 'Horse', 'Bird'],
    facilities: ['Mobile Rescue Unit', 'Surgical Suite', 'Quarantine Ward', 'Education Center'],
    isVerified: true, rating: 4.6, isActive: true,
    description: 'Serving the NCR region with professional rescue, treatment, and rehoming services.',
  },
  {
    name: 'Hyderabad Humane Society',
    address: '56 Jubilee Hills, Road No 36',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033',
    contactNumber: '+91-40-2345-6782',
    email: 'info@hydhumane.org',
    operatingHours: '9:00 AM - 6:00 PM',
    coordinates: { lat: 17.385, lng: 78.4867 },
    capacity: 180, currentOccupancy: 95,
    animalTypes: ['Dog', 'Cat', 'Bird'],
    facilities: ['Vet Clinic', 'Grooming Salon', 'Training Classes', 'Adoption Center'],
    isVerified: true, rating: 4.5, isActive: true,
    description: 'A welcoming shelter with modern facilities and a high adoption success rate.',
  },
  {
    name: 'Kolkata Animal Welfare Trust',
    address: '8 Park Street, Central Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700016',
    contactNumber: '+91-33-2345-6783',
    email: 'trust@kolkatawelfare.org',
    operatingHours: '8:30 AM - 7:30 PM',
    coordinates: { lat: 22.5726, lng: 88.3639 },
    capacity: 120, currentOccupancy: 70,
    animalTypes: ['Dog', 'Cat', 'Bird', 'Cow'],
    facilities: ['Rescue Team', 'Vet Care', 'Foster Program', 'Community Outreach'],
    isVerified: true, rating: 4.4, isActive: true,
    description: 'Committed to animal welfare through rescue, rehabilitation, and community education.',
  },
  {
    name: 'Pune Pet Haven',
    address: '34 FC Road, Shivajinagar',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411004',
    contactNumber: '+91-20-2345-6784',
    email: 'haven@punepets.org',
    operatingHours: '9:00 AM - 7:00 PM',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    capacity: 140, currentOccupancy: 80,
    animalTypes: ['Dog', 'Cat', 'Bird'],
    facilities: ['Microchipping', 'Vaccination Camp', 'Spay/Neuter', 'Adoption Drive'],
    isVerified: false, rating: 4.3, isActive: true,
    description: 'A loving shelter dedicated to finding forever homes for stray and abandoned animals.',
  },
  {
    name: 'Ahmedabad Animal Aid Center',
    address: '67 CG Road, Navrangpura',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380009',
    contactNumber: '+91-79-2345-6785',
    email: 'aid@ahmedabadanimals.org',
    operatingHours: '8:00 AM - 6:00 PM',
    coordinates: { lat: 23.0225, lng: 72.5714 },
    capacity: 160, currentOccupancy: 90,
    animalTypes: ['Dog', 'Cat', 'Cow', 'Bird'],
    facilities: ['Emergency Care', 'Vaccination', 'Rehabilitation', 'Community Kitchen'],
    isVerified: true, rating: 4.6, isActive: true,
    description: "Gujarat's dedicated animal rescue and care center with a strong volunteer network.",
  },
];

const seedDB = async () => {
  try {
    console.log('🌱 Starting database seed (NeDB)...');

    // Clear existing data
    await Shelters.deleteMany({});
    await Users.deleteMany({ role: 'admin' });

    // Seed shelters
    await Shelters.insertMany(shelters);
    console.log(`✅ Seeded ${shelters.length} shelters`);

    // Create admin user (password hashed)
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    await Users.create({
      name: 'Admin User',
      email: 'admin@anirescue.org',
      password: hashedPassword,
      role: 'admin',
      phone: '+91-9999999999',
      isActive: true,
    });

    console.log('✅ Admin user created');
    console.log('\n🎉 Database seeded successfully!');
    console.log('🔑 Admin Login: admin@anirescue.org | Password: Admin@123');
    console.log('📁 Data stored in: backend/data/*.db\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

// Give NeDB a moment to autoload, then seed
setTimeout(seedDB, 500);
