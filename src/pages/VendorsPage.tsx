
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import VendorMap from '@/components/Vendors/VendorMap';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MapPin,
  Filter,
  Star,
  Truck,
  Grid2X2,
  Map,
} from 'lucide-react';
import { Vendor } from '@/types';
import { supabase } from '@/lib/supabase-client';

const VendorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('map');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('verification_status', 'verified');
          
        if (error) throw error;
        
        // For demo purposes, if no vendors found, display sample data
        if (!data || data.length === 0) {
          setVendors(sampleVendors);
        } else {
          setVendors(data as Vendor[]);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setVendors(sampleVendors); // Fallback to sample data
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendors();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search: searchQuery });
    // In a real app, this would filter vendors by the search query
    // For the demo, we'll just update the URL parameter
  };

  // Filter vendors based on search query
  const filteredVendors = vendors.filter(vendor => {
    if (!searchQuery) return true;
    
    // Check if searching for a PIN code (numeric only input)
    const isPinCodeSearch = /^\d+$/.test(searchQuery);
    
    if (isPinCodeSearch) {
      // When searching for PIN code, only match exact or starting digits
      return vendor.pin_code?.startsWith(searchQuery);
    }
    
    // For text searches, use the regular includes logic
    const query = searchQuery.toLowerCase();
    return (
      vendor.name?.toLowerCase().includes(query) ||
      vendor.address?.toLowerCase().includes(query) ||
      (vendor.products && Array.isArray(vendor.products) && 
        vendor.products.some(p => p?.name?.toLowerCase().includes(query)))
    );
  });

  return (
    <MainLayout>
      <div className="bg-green-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Local Farmers</h1>
            <p className="text-gray-600">
              Discover farmers in your area offering fresh, locally grown produce
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by location, PIN code, or product"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-green-50">
                <Truck className="mr-1 h-3 w-3" /> Delivers
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                <Star className="mr-1 h-3 w-3" /> Verified
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                Organic
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                Seasonal
              </Badge>
              <div className="ml-auto flex">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-24 w-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No vendors found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : viewMode === 'map' ? (
            <VendorMap vendors={filteredVendors} height="600px" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <Card key={vendor.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <div className="h-48 bg-gray-200 relative">
                    <img 
                      src={vendor.banner_image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1932&auto=format&fit=crop"} 
                      alt={vendor.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
                        <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{vendor.name}</h3>
                    <div className="flex items-start mb-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                      <p className="text-gray-600 text-sm ml-2">
                        {vendor.address || "Farmer's Market, Delhi"}, PIN: {vendor.pin_code || "110001"}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {vendor.products.slice(0, 5).map((product, idx) => (
                        <Badge key={idx} variant="outline" className="bg-green-50">
                          {product.name}
                        </Badge>
                      ))}
                      {vendor.products.length > 5 && (
                        <Badge variant="outline">+{vendor.products.length - 5} more</Badge>
                      )}
                    </div>
                    
                    <Button variant="default" className="w-full">View Details</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

// Sample data for demo purposes
const sampleVendors: Vendor[] = [
  {
    id: '1',
    owner_id: 'user1',
    name: "Ramesh's Organic Farm",
    description: "Family-owned farm specializing in organic vegetables and fruits.",
    location: { lat: 28.6139, lng: 77.2090 },
    address: "Green Valley, Delhi",
    pin_code: "110001",
    products: [
      { id: '1', name: "Rice", description: "Organic basmati rice", price: 40, unit: "kg", stock: 100, category: "grains" },
      { id: '2', name: "Tomatoes", description: "Fresh red tomatoes", price: 30, unit: "kg", stock: 50, category: "vegetables" },
      { id: '3', name: "Spinach", description: "Leafy green spinach", price: 20, unit: "bunch", stock: 30, category: "vegetables" }
    ],
    contact_phone: "+91 98765 43210",
    contact_email: "ramesh@example.com",
    verification_status: "verified",
    created_at: new Date().toISOString(),
    banner_image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1932&auto=format&fit=crop"
  },
  {
    id: '2',
    owner_id: 'user2',
    name: "Priya's Fresh Produce",
    description: "Specializing in seasonal fruits and vegetables.",
    location: { lat: 28.5355, lng: 77.3910 },
    address: "Sunny Farms, Noida",
    pin_code: "201301",
    products: [
      { id: '4', name: "Mangoes", description: "Sweet Alphonso mangoes", price: 150, unit: "kg", stock: 75, category: "fruits" },
      { id: '5', name: "Potatoes", description: "Farm fresh potatoes", price: 25, unit: "kg", stock: 200, category: "vegetables" }
    ],
    contact_phone: "+91 87654 32109",
    contact_email: "priya@example.com",
    verification_status: "verified",
    created_at: new Date().toISOString(),
    banner_image: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: '3',
    owner_id: 'user3',
    name: "Singh Dairy Farm",
    description: "Premium dairy products from grass-fed cows.",
    location: { lat: 28.7041, lng: 77.1025 },
    address: "Green Pastures, Gurgaon",
    pin_code: "122001",
    products: [
      { id: '6', name: "Milk", description: "Fresh cow milk", price: 60, unit: "liter", stock: 100, category: "dairy" },
      { id: '7', name: "Paneer", description: "Homemade cottage cheese", price: 280, unit: "kg", stock: 30, category: "dairy" },
      { id: '8', name: "Ghee", description: "Pure desi ghee", price: 600, unit: "kg", stock: 25, category: "dairy" }
    ],
    contact_phone: "+91 76543 21098",
    contact_email: "singh@example.com",
    verification_status: "verified",
    created_at: new Date().toISOString(),
    banner_image: "https://images.unsplash.com/photo-1528496251333-312a5139332e?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '4',
    owner_id: 'user4',
    name: "Gupta's Grain Bazaar",
    description: "Specializing in high-quality grains and pulses.",
    location: { lat: 28.6304, lng: 77.2177 },
    address: "Golden Fields, Delhi",
    pin_code: "110002",
    products: [
      { id: '9', name: "Wheat", description: "Organic wheat", price: 35, unit: "kg", stock: 300, category: "grains" },
      { id: '10', name: "Lentils", description: "Mixed lentils", price: 110, unit: "kg", stock: 150, category: "pulses" },
      { id: '11', name: "Chickpeas", description: "Organic chickpeas", price: 95, unit: "kg", stock: 120, category: "pulses" }
    ],
    contact_phone: "+91 65432 10987",
    contact_email: "gupta@example.com",
    verification_status: "verified",
    created_at: new Date().toISOString(),
    banner_image: "https://images.unsplash.com/photo-1530507629858-e3759c1c046f?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '5',
    owner_id: 'user5',
    name: "Organic Harvest Collective",
    description: "Community-supported agriculture with seasonal organic produce.",
    location: { lat: 28.6802, lng: 77.1226 },
    address: "Community Farms, Delhi",
    pin_code: "110015",
    products: [
      { id: '12', name: "Mixed Vegetables", description: "Seasonal vegetable basket", price: 200, unit: "basket", stock: 20, category: "vegetables" },
      { id: '13', name: "Honey", description: "Raw wildflower honey", price: 350, unit: "500g", stock: 40, category: "misc" }
    ],
    contact_phone: "+91 54321 09876",
    contact_email: "harvest@example.com",
    verification_status: "verified",
    created_at: new Date().toISOString(),
    banner_image: "https://images.unsplash.com/photo-1551649001-7a2482d98d05?q=80&w=2070&auto=format&fit=crop"
  }
];

export default VendorsPage;
