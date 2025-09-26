
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Vendor } from '@/types';

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

// Custom marker icon for vendors
const createVendorIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="w-10 h-10 bg-primary rounded-full border-2 border-white shadow-md flex items-center justify-center animate-pulse-gentle">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
};

interface VendorMapProps {
  vendors: Vendor[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const VendorMap = ({ 
  vendors, 
  center = [28.6139, 77.2090], // Default to Delhi
  zoom = 10,
  height = '500px'
}: VendorMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const vendorIcon = createVendorIcon();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted && mapRef.current && vendors.length > 0) {
      // Create bounds from all vendor locations
      const bounds = L.latLngBounds(
        vendors.map(vendor => [vendor.location.lat, vendor.location.lng] as L.LatLngTuple)
      );
      
      // Add some padding
      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 13
      });
    }
  }, [vendors, isMounted]);

  if (!isMounted) {
    return <div style={{ height }} className="bg-gray-100 rounded-lg animate-pulse"></div>;
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden shadow-md border border-gray-200">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        ref={(map) => { mapRef.current = map; }}
        whenReady={() => {}}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {vendors.map((vendor) => (
          <Marker 
            key={vendor.id} 
            position={[vendor.location.lat, vendor.location.lng]} 
            icon={vendorIcon}
          >
            <Popup className="vendor-popup">
              <div className="p-1">
                <h3 className="font-bold text-base">{vendor.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {vendor.address || "Location not specified"}
                </p>
                
                {vendor.products && vendor.products.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500">Products:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vendor.products.slice(0, 3).map((product, idx) => (
                        <span key={idx} className="text-xs bg-green-50 text-green-800 px-1.5 py-0.5 rounded">
                          {product.name}
                        </span>
                      ))}
                      {vendor.products.length > 3 && (
                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          +{vendor.products.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <Link to={`/vendors/${vendor.id}`}>
                  <Button size="sm" variant="outline" className="w-full mt-1 text-xs h-8">
                    <span>View Details</span>
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Add the vendor marker styles */}
      <style>
        {`
        .custom-marker {
          background-color: transparent;
          border: none;
        }
        
        .vendor-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
        }
        
        .vendor-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        `}
      </style>
    </div>
  );
};

export default VendorMap;
