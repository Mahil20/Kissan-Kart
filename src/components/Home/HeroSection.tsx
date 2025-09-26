
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/vendors?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-green-50 to-white py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 hero-pattern opacity-40"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 animate-fade-in">
            Fresh From <span className="text-primary">Local Farmers</span> To Your Table
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto animate-fade-in delay-100">
            Discover and connect with local farmers in your area. Support sustainable agriculture and enjoy farm-fresh produce direct from the source.
          </p>
          
          <form 
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row w-full max-w-2xl mx-auto mt-8 gap-2 animate-fade-in delay-200"
          >
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Enter PIN code or location"
                className="w-full pl-10 py-3 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              type="submit"
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Search className="mr-2 h-5 w-5" /> Find Vendors
            </Button>
          </form>
          
          <div className="pt-6 flex justify-center gap-4 flex-wrap animate-fade-in delay-300">
            <Button variant="outline" className="animate-float">
              Fresh Vegetables
            </Button>
            <Button variant="outline" className="animate-float" style={{ animationDelay: '0.2s' }}>
              Organic Fruits
            </Button>
            <Button variant="outline" className="animate-float" style={{ animationDelay: '0.4s' }}>
              Dairy Products
            </Button>
            <Button variant="outline" className="animate-float" style={{ animationDelay: '0.6s' }}>
              Local Grains
            </Button>
          </div>
        </div>
      </div>
      
      {/* SVG Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="none">
          <path fillRule="evenodd" clipRule="evenodd" d="M0 0L60 10C120 20 240 40 360 45C480 50 600 40 720 35C840 30 960 30 1080 35C1200 40 1320 50 1380 55L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
