
import { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import HeroSection from '@/components/Home/HeroSection';
import FeaturedVendors from '@/components/Home/FeaturedVendors';
import FeaturesSection from '@/components/Home/FeaturesSection';
import BecomeVendorCTA from '@/components/Home/BecomeVendorCTA';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const HomePage = () => {
  const { isPendingVendor } = useAuth();
  
  return (
    <MainLayout>
      {isPendingVendor && (
        <div className="container mx-auto px-4 py-4">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Vendor Application Under Review</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Your vendor application is currently being reviewed by our admin team. 
              You'll receive a notification once it's approved. Thank you for your patience!
            </AlertDescription>
          </Alert>
        </div>
      )}
      <HeroSection />
      <FeaturedVendors />
      <FeaturesSection />
      {!isPendingVendor && <BecomeVendorCTA />}
    </MainLayout>
  );
};

export default HomePage;
