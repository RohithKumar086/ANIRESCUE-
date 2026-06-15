import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FaSearch, FaPhone, FaGlobe, FaMapMarkerAlt, FaClock, FaStar } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CITIES = ['All Cities', 'Bangalore', 'Mumbai', 'Chennai', 'Delhi', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];

export default function FindShelters() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(5);

  useEffect(() => {
    fetchShelters();
  }, [search, selectedCity]);

  const fetchShelters = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCity !== 'All Cities') params.city = selectedCity;
      const { data } = await axios.get('/api/shelters', { params });
      setShelters(data.shelters || []);
    } catch {
      // Fallback sample data for demo
      setShelters([]);
    } finally {
      setLoading(false);
    }
  };

  const focusShelter = (shelter) => {
    setSelectedShelter(shelter);
    if (shelter.coordinates?.lat && shelter.coordinates?.lng) {
      setMapCenter([shelter.coordinates.lat, shelter.coordinates.lng]);
      setMapZoom(14);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-black text-gray-900 dark:text-white mb-3">
            Find <span className="gradient-text">Animal Shelters</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xl">
            Locate verified animal shelters across India
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shelters by name or city..."
                className="input-field pl-10"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input-field sm:w-48"
            >
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">{shelters.length}</span> shelters found
          {selectedCity !== 'All Cities' && <span>in <strong className="text-primary-600">{selectedCity}</strong></span>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shelter Cards */}
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shimmer h-40" />
              ))
            ) : shelters.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-3">🏠</p>
                <p className="font-semibold">No shelters found</p>
                <p className="text-sm">Try a different city or search term</p>
              </div>
            ) : (
              shelters.map((shelter) => (
                <button
                  key={shelter._id}
                  onClick={() => focusShelter(shelter)}
                  className={`w-full text-left bg-white dark:bg-gray-900 rounded-2xl p-5 border-2 transition-all card-hover ${
                    selectedShelter?._id === shelter._id
                      ? 'border-primary-500 shadow-md shadow-primary-100 dark:shadow-primary-900/20'
                      : 'border-gray-100 dark:border-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{shelter.name}</h3>
                        {shelter.isVerified && <MdVerified className="text-blue-500 shrink-0" size={16} title="Verified" />}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                        <FaMapMarkerAlt size={11} />
                        <span>{shelter.address}, {shelter.city}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-yellow-500 justify-end">
                        <FaStar size={12} />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{shelter.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(shelter.animalTypes || []).map((type) => (
                      <span key={type} className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <FaClock size={10} />
                      <span>{shelter.operatingHours}</span>
                    </div>
                    {shelter.capacity && (
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>Capacity</span>
                          <span>{shelter.currentOccupancy}/{shelter.capacity}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="progress-bar h-full" style={{ width: `${Math.min(100, (shelter.currentOccupancy / shelter.capacity) * 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <a href={`tel:${shelter.contactNumber}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                      <FaPhone size={10} /> Call
                    </a>
                    {shelter.website && (
                      <a href={shelter.website} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                        <FaGlobe size={10} /> Website
                      </a>
                    )}
                    {shelter.coordinates?.lat && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${shelter.coordinates.lat},${shelter.coordinates.lng}`}
                        target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">
                        <FaMapMarkerAlt size={10} /> Directions
                      </a>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Map */}
          <div className="hidden lg:block sticky top-24 h-[700px]">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-full rounded-2xl z-10"
              key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {shelters.filter(s => s.coordinates?.lat && s.coordinates?.lng).map((shelter) => (
                <Marker key={shelter._id} position={[shelter.coordinates.lat, shelter.coordinates.lng]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{shelter.name}</p>
                      <p className="text-gray-600">{shelter.city}</p>
                      <p className="text-primary-600 font-medium">{shelter.contactNumber}</p>
                      <p className="text-gray-500 text-xs">{shelter.operatingHours}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
