
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { getVendors } from '@/lib/supabase-client';
import { Vendor } from '@/types';

const FeaturedVendors = () => {
  // Fetch verified vendors using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['vendors', 'featured'],
    queryFn: () => getVendors(4, 'verified'),
  });

  const vendors = data?.data || [];
  
  // No fallback to sample data, just use real vendors from database
  const displayVendors = vendors;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Vendors</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our verified vendors offering the freshest produce directly from their farms to your table.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-96">
                <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex space-x-2 mb-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayVendors.map((vendor, index) => (
              <Card key={vendor.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg card-hover animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="h-40 bg-gray-200 relative overflow-hidden">
                  <img 
                    src={vendor.banner_image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1932&auto=format&fit=crop"} 
                    alt={vendor.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
                      <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                      Verified
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg mb-2">{vendor.name}</h3>
                  
                  <div className="flex items-start mb-4">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-600 text-sm ml-2">
                      {vendor.address || "Location not specified"}, PIN: {vendor.pin_code || "N/A"}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vendor.products && vendor.products.slice(0, 3).map((product, idx) => (
                      <Badge key={idx} variant="outline" className="bg-green-50">
                        {product.name}
                      </Badge>
                    ))}
                    {vendor.products && vendor.products.length > 3 && (
                      <Badge variant="outline">+{vendor.products.length - 3} more</Badge>
                    )}
                    {(!vendor.products || vendor.products.length === 0) && (
                      <Badge variant="outline" className="bg-gray-50">No products listed</Badge>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Link to={`/vendors/${vendor.id}`} className="w-full">
                    <Button variant="default" className="w-full">
                      <span>View Details</span>
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link to="/vendors">
            <Button variant="outline" size="lg">
              View All Vendors
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVendors;
