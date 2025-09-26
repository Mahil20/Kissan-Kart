
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, Mail, Clock, Star, ChevronDown, Heart } from 'lucide-react';
import { getVendorById } from '@/lib/supabase-client';
import MainLayout from '@/components/Layout/MainLayout';
import VendorMap from '@/components/Vendors/VendorMap';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Vendor } from '@/types';
import { toast } from 'sonner';

const VendorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [isInFavorites, setIsInFavorites] = useState(false);
  
  const { data: vendor, isLoading, error } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => getVendorById(id!).then(res => res.data),
    enabled: !!id
  });

  useEffect(() => {
    // Check if vendor is in favorites (could be done via Supabase in a real app)
    const checkFavorites = async () => {
      // For demo purposes, we're simulating this check
      setIsInFavorites(false);
    };
    
    if (vendor) {
      checkFavorites();
    }
  }, [vendor]);

  const handleToggleFavorite = async () => {
    // Toggle favorite status
    setIsInFavorites(prev => !prev);
    
    // Show toast notification
    toast.success(isInFavorites ? 'Removed from favorites' : 'Added to favorites', {
      description: isInFavorites ? 'Vendor removed from your favorites list' : 'Vendor added to your favorites list',
    });
    
    // In a real app, we would update this in Supabase
  };

  if (isLoading) return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3 space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <div className="md:w-1/3 space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </MainLayout>
  );

  if (error || !vendor) return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Vendor not found</h2>
        <p className="mt-4 text-gray-600">
          We couldn't find the vendor you're looking for. Please try again or explore other vendors.
        </p>
        <Button className="mt-6" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
          <img 
            src={vendor.banner_image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1932&auto=format&fit=crop"} 
            alt={vendor.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex justify-between items-end">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    <Star className="h-3 w-3 mr-1 fill-white" />
                    Verified
                  </Badge>
                  <span className="text-sm opacity-90">ID: {vendor.id}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">{vendor.name}</h1>
              </div>
              <Button 
                variant="outline" 
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                onClick={handleToggleFavorite}
              >
                <Heart className={`h-5 w-5 mr-2 ${isInFavorites ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                {isInFavorites ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Vendor Info */}
          <div className="lg:w-2/3 space-y-8">
            {/* About Section */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-700">{vendor.description || "No description provided."}</p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-600">{vendor.address || "Location not specified"}</p>
                    <p className="text-gray-600">PIN: {vendor.pin_code || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">{vendor.contact_phone || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{vendor.contact_email || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Joined</p>
                    <p className="text-gray-600">{new Date(vendor.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Products Section */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <Tabs defaultValue="all">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Products</h2>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="vegetables">Vegetables</TabsTrigger>
                    <TabsTrigger value="fruits">Fruits</TabsTrigger>
                    <TabsTrigger value="grains">Grains</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="all" className="space-y-0">
                  {vendor.products && vendor.products.length > 0 ? (
                    <div className="divide-y">
                      {vendor.products.map((product, idx) => (
                        <div key={idx} className="py-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.description}</p>
                            <Badge variant="outline" className="mt-2 bg-green-50">
                              {product.category}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">₹{product.price}/{product.unit}</p>
                            <p className="text-sm text-gray-600">Stock: {product.stock} {product.unit}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <p>No products available</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="vegetables" className="space-y-0">
                  {vendor.products && vendor.products.filter(p => p.category === 'vegetables').length > 0 ? (
                    <div className="divide-y">
                      {vendor.products
                        .filter(p => p.category === 'vegetables')
                        .map((product, idx) => (
                          <div key={idx} className="py-4 flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{product.name}</h3>
                              <p className="text-sm text-gray-600">{product.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">₹{product.price}/{product.unit}</p>
                              <p className="text-sm text-gray-600">Stock: {product.stock} {product.unit}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <p>No vegetables available</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="fruits" className="space-y-0">
                  {vendor.products && vendor.products.filter(p => p.category === 'fruits').length > 0 ? (
                    <div className="divide-y">
                      {vendor.products
                        .filter(p => p.category === 'fruits')
                        .map((product, idx) => (
                          <div key={idx} className="py-4 flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{product.name}</h3>
                              <p className="text-sm text-gray-600">{product.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">₹{product.price}/{product.unit}</p>
                              <p className="text-sm text-gray-600">Stock: {product.stock} {product.unit}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <p>No fruits available</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="grains" className="space-y-0">
                  {vendor.products && vendor.products.filter(p => p.category === 'grains' || p.category === 'pulses').length > 0 ? (
                    <div className="divide-y">
                      {vendor.products
                        .filter(p => p.category === 'grains' || p.category === 'pulses')
                        .map((product, idx) => (
                          <div key={idx} className="py-4 flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{product.name}</h3>
                              <p className="text-sm text-gray-600">{product.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">₹{product.price}/{product.unit}</p>
                              <p className="text-sm text-gray-600">Stock: {product.stock} {product.unit}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <p>No grains available</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </section>
          </div>
          
          {/* Right Column - Map and Contact */}
          <div className="lg:w-1/3 space-y-6">
            {/* Map */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="h-64 rounded-lg overflow-hidden">
                {vendor.location && (
                  <VendorMap 
                    vendors={[vendor]} 
                    center={[vendor.location.lat, vendor.location.lng]} 
                    zoom={14}
                    height="100%"
                  />
                )}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {vendor.address || "Location address not specified"}
              </p>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Vendor</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Write your message or inquiry here..."
                  ></textarea>
                </div>
                <Button className="w-full">Send Message</Button>
              </form>
              <Separator className="my-6" />
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Prefer direct contact?</p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VendorProfilePage;
