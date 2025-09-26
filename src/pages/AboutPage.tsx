
import { Check, Leaf, Users, Tractor, BarChart } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-green-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in">
              Supporting Indian Farmers, Building Community
            </h1>
            <p className="text-lg text-gray-700 mb-8 animate-fade-in delay-100">
              KisanKart was founded with a simple but powerful mission: to connect local farmers directly with consumers,
              eliminating middlemen and creating a sustainable ecosystem for fresh, locally-grown produce.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in delay-200">
              <Link to="/vendors">
                <Button size="lg" className="bg-primary">
                  Find Local Farmers
                </Button>
              </Link>
              <Link to="/become-vendor">
                <Button size="lg" variant="outline">
                  Join as Farmer
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#22c55e" d="M42.7,-57.2C56.9,-45.7,71,-34.6,76.3,-20.4C81.5,-6.1,78,11.3,69.8,25.9C61.7,40.5,48.9,52.3,34.4,60.1C19.9,68,3.6,71.8,-12.1,69.7C-27.8,67.5,-42.9,59.3,-53.8,47.1C-64.7,34.9,-71.3,18.5,-71.5,2.2C-71.6,-14.1,-65.4,-28.1,-55.4,-40C-45.4,-51.9,-31.5,-61.6,-16.9,-63.7C-2.3,-65.8,13,-68.3,26.7,-65.6C40.4,-62.9,52.4,-54.9,42.7,-57.2Z" transform="translate(100 100)" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-1/4 h-full opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#22c55e" d="M42.9,-62.8C52.6,-54.3,55.6,-37.8,61.5,-22.1C67.4,-6.4,76.2,8.6,74.6,22.4C73,36.2,61,48.8,47.3,56.9C33.5,65,18,68.6,1.9,66.3C-14.2,64.1,-28.4,56,-39.5,45.5C-50.6,35,-58.5,22.1,-63.2,7.2C-67.9,-7.7,-69.3,-24.7,-61.8,-35.8C-54.3,-46.9,-37.9,-52.2,-23.4,-58.3C-8.9,-64.4,3.8,-71.4,16.4,-71.2C29,-70.9,41.6,-63.4,42.9,-62.8Z" transform="translate(100 100)" />
          </svg>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Mission</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-green-50 p-6 rounded-lg hover-scale">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Support Local Agriculture</h3>
                <p className="text-gray-700">
                  We believe in creating sustainable livelihoods for local farmers by connecting them directly to consumers, ensuring fair prices and market access.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg hover-scale">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Build Communities</h3>
                <p className="text-gray-700">
                  Our platform strengthens local communities by fostering direct relationships between farmers and consumers, building trust and transparency.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg hover-scale">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                  <Tractor className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Promote Sustainability</h3>
                <p className="text-gray-700">
                  We advocate for sustainable farming practices that protect the environment and ensure long-term food security for future generations.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg hover-scale">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Boost Rural Economy</h3>
                <p className="text-gray-700">
                  By eliminating middlemen, we help farmers maximize their profits and reinvest in their farms, strengthening the rural economy of India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      {/* <section className="py-20 bg-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-4xl font-bold text-primary">2K+</p>
              <p className="text-gray-700 mt-2">Active Farmers</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-4xl font-bold text-primary">50K+</p>
              <p className="text-gray-700 mt-2">Happy Customers</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-4xl font-bold text-primary">₹15Cr+</p>
              <p className="text-gray-700 mt-2">Farmer Earnings</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-4xl font-bold text-primary">20+</p>
              <p className="text-gray-700 mt-2">States Covered</p>
            </div>
          </div>
        </div>
      </section> */}
      
      {/* Team Section */}
      {/* <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" 
                  alt="Founder" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">Aditya Sharma</h3>
              <p className="text-gray-600">Founder & CEO</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop" 
                  alt="Co-founder" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">Priya Patel</h3>
              <p className="text-gray-600">Co-founder & COO</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" 
                  alt="CTO" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">Rajesh Gupta</h3>
              <p className="text-gray-600">CTO</p>
            </div>
          </div>
        </div>
      </section> */}
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose KisanKart</h2>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Direct Farm-to-Table</h3>
                <p className="text-gray-700">
                  By connecting directly with farmers, you get the freshest produce straight from the farm to your table, often harvested just hours before delivery.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Support Local Economy</h3>
                <p className="text-gray-700">
                  Every purchase supports local farmers and their families, helping rural communities thrive and preserving traditional farming knowledge.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
                <p className="text-gray-700">
                  All vendors on our platform go through a verification process to ensure quality and reliability, giving you peace of mind about your purchases.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Transparent Pricing</h3>
                <p className="text-gray-700">
                  Fair prices that benefit both farmers and consumers, with no hidden fees or markups from middlemen in the supply chain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Support Local Farmers?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of others who are making a difference in the lives of Indian farmers and enjoying fresh, locally-grown produce.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/vendors">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Find Farmers
              </Button>
            </Link>
            <Link to="/become-vendor">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Become a Vendor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default AboutPage;
