'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { X, MapPin, Search } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet + Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Handles click events on the map
const ClickHandler = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocationPicker = ({ onClose, onConfirm }) => {
  const [markerPos, setMarkerPos] = useState(null);
  const [detectedState, setDetectedState] = useState('');
  const [detectedPlace, setDetectedPlace] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const mapRef = React.useRef(null);
  const debounceRef = React.useRef(null);

  const reverseGeocode = async (lat, lng) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        { headers: { Accept: 'application/json' } },
      );
      const data = await res.json();
      const state = data.address?.state || '';
      const place =
        data.address?.city ||
        data.address?.town ||
        data.address?.county ||
        data.address?.state_district ||
        '';
      setDetectedState(state);
      setDetectedPlace(place);
    } catch (err) {
      console.error('Reverse geocode failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMapSelect = (lat, lng) => {
    setMarkerPos([lat, lng]);
    reverseGeocode(lat, lng);
  };
  const handleQueryChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value,
          )}&countrycodes=in&limit=5&addressdetails=1`,
        );
        const data = await res.json();
        setSuggestions(data || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (place) => {
    const parsedLat = parseFloat(place.lat);
    const parsedLon = parseFloat(place.lon);
    handleMapSelect(parsedLat, parsedLon);
    if (mapRef.current) {
      mapRef.current.setView([parsedLat, parsedLon], 12);
    }
    setSearchQuery(place.display_name);
    setSuggestions([]);
  };
  const handleConfirm = () => {
    if (!detectedPlace) {
      alert('Please select a valid location on the map');
      return;
    }
    onConfirm({
      state: detectedPlace,
      place: detectedState,
      coords: markerPos,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <style>{`
        .location-picker-scroll::-webkit-scrollbar {
          display: none;
        }
        .location-picker-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="location-picker-scroll overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              Select Your Location
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search box with live autocomplete */}
          <div className="px-5 pt-4 relative">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search a place e.g. Calicut, Kochi..."
                value={searchQuery}
                onChange={handleQueryChange}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {searching && (
              <p className="text-xs text-gray-400 mt-1">Searching...</p>
            )}

            {suggestions.length > 0 && (
              <ul className="absolute z-[1000] left-5 right-5 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((place) => (
                  <li
                    key={place.place_id}
                    onClick={() => handleSelectSuggestion(place)}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 cursor-pointer border-b last:border-b-0 border-gray-100"
                  >
                    {place.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Map */}
          <div className="px-5 pt-4">
            <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
              <MapContainer
                center={[10.8505, 76.2711]} // Kerala default center
                zoom={7}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <ClickHandler onSelect={handleMapSelect} />
                {markerPos && <Marker position={markerPos} />}
              </MapContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click anywhere on the map to select your location, or search
              above.
            </p>
          </div>

          {/* Detected result */}
          <div className="px-5 pt-4">
            {loading ? (
              <p className="text-sm text-gray-500">Detecting location...</p>
            ) : detectedState ? (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
                <span className="text-gray-600">Detected: </span>
                <span className="font-semibold text-gray-800">
                  {detectedPlace ? `${detectedPlace}, ` : ''}
                  {detectedState}
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No location selected yet</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-5 py-4 mt-2 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!detectedPlace}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
