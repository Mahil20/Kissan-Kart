import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  initialLocation: { lat: number; lng: number };
  onLocationChange: (location: { lat: number; lng: number }) => void;
  height?: string;
}

// Component to handle map clicks
const MapClickHandler = ({ onLocationChange }: { onLocationChange: (location: { lat: number; lng: number }) => void }) => {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationChange({ lat, lng });
    },
  });
  return null;
};

const LocationPicker = ({ 
  initialLocation, 
  onLocationChange,
  height = '400px'
}: LocationPickerProps) => {
  const [location, setLocation] = useState(initialLocation);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleLocationChange = (newLocation: { lat: number; lng: number }) => {
    setLocation(newLocation);
    onLocationChange(newLocation);
  };

  if (!isMounted) {
    return <div style={{ height }} className="bg-gray-100 rounded-lg animate-pulse"></div>;
  }

  return (
    <div className="space-y-2">
      <div style={{ height }} className="rounded-lg overflow-hidden shadow-md border border-gray-200">
        <MapContainer 
          center={[location.lat, location.lng]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Marker position={[location.lat, location.lng]} />
          <MapClickHandler onLocationChange={handleLocationChange} />
        </MapContainer>
      </div>
      <p className="text-sm text-gray-500 italic">Click anywhere on the map to set your location</p>
      <div className="flex gap-2 text-sm">
        <div className="bg-gray-100 p-2 rounded flex-1">
          <span className="font-medium">Latitude:</span> {location.lat.toFixed(6)}
        </div>
        <div className="bg-gray-100 p-2 rounded flex-1">
          <span className="font-medium">Longitude:</span> {location.lng.toFixed(6)}
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
