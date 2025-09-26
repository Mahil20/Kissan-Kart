
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const BecomeVendorCTA = () => {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative bg-primary rounded-2xl overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 relative">
            {/* Text content */}
            <div className="text-white space-y-6 py-6">
              <h2 className="text-3xl md:text-4xl font-bold">Are You a Farmer?</h2>
              <p className="text-white/90 text-lg">
                Join our growing network of local farmers and reach customers directly. Increase your profits by cutting out the middleman.
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Free registration and easy onboarding</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Market your products to local customers</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Set your own prices and manage your listings</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Receive direct inquiries from interested buyers</span>
                </li>
              </ul>
              
              <Link to="/become-vendor">
                <Button 
                  size="lg" 
                  className="mt-2 bg-white text-primary hover:bg-white/90"
                >
                  Become a Vendor <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {/* Image */}
            <div className="hidden md:block relative">
              <img 
                src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2071&auto=format&fit=crop" 
                alt="Indian Farmer" 
                className="rounded-lg object-cover h-full w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BecomeVendorCTA;
