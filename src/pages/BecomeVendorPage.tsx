
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, FileText, Check, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { supabase, createAdminNotification, uploadImage } from '@/lib/supabase-client';
import { toast } from 'sonner';

// Interactive location picker component
import LocationPicker from '@/components/Vendors/LocationPicker';

const BecomeVendorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [vendorName, setVendorName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
  const [products, setProducts] = useState([
    { name: '', description: '', price: '', unit: 'kg', category: 'vegetables' }
  ]);
  
  // File upload states
  const [farmPhotoFile, setFarmPhotoFile] = useState<File | null>(null);
  const [identityProofFile, setIdentityProofFile] = useState<File | null>(null);
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const [businessProofFile, setBusinessProofFile] = useState<File | null>(null);
  
  const handleAddProduct = () => {
    setProducts([
      ...products, 
      { name: '', description: '', price: '', unit: 'kg', category: 'vegetables' }
    ]);
  };
  
  const handleProductChange = (index: number, field: string, value: string) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setProducts(updatedProducts);
  };
  
  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };
  
  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!vendorName || !description || !address || !pinCode || !phone || !email) {
        toast.error('Please fill all required fields');
        return;
      }
    } else if (currentStep === 2) {
      // Validate products
      const hasEmptyProduct = products.some(p => !p.name || !p.price);
      if (hasEmptyProduct) {
        toast.error('Please fill all product details');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };
  
  // Set email from user profile if available
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Show immediate feedback to user
      toast.loading('Submitting your application...', { id: 'vendor-submission' });
      console.log('Starting vendor application submission process');
      
      // Format products data - optimize by using a single loop
      // Use proper UUIDs for product IDs
      const formattedProducts = products.map((product) => ({
        id: uuidv4(),
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        unit: product.unit,
        stock: 100, // Default stock
        category: product.category
      }));
      
      const userId = user?.id;
      console.log('Current user ID:', userId);
      
      if (!userId) {
        toast.error('You must be logged in to submit a vendor application');
        navigate('/auth');
        return;
      }
      
      // Generate a proper UUID for vendor ID to match database expectations
      const vendorId = uuidv4();
      
      // Upload farm photo if provided (optional)
      let farmPhotoUrl = null;
      if (farmPhotoFile) {
        const filePath = `vendor-documents/${userId}/${vendorId}/farm-photo-${farmPhotoFile.name}`;
        try {
          const { url, error: uploadError } = await uploadImage(filePath, farmPhotoFile);
          
          if (uploadError) {
            console.error('Error uploading farm photo:', uploadError);
            toast.warning('Failed to upload farm photo, but continuing with application');
          } else {
            farmPhotoUrl = url;
            console.log('Farm photo uploaded successfully:', url);
          }
        } catch (uploadErr) {
          console.error('Exception during farm photo upload:', uploadErr);
          toast.warning('Failed to upload farm photo, but continuing with application');
          // Farm photo is optional, so we continue with the application
        }
      }
      
      // Prepare all data objects before making any API calls
      const vendorData = {
        id: vendorId,
        owner_id: userId,
        name: vendorName,
        description,
        address,
        pin_code: pinCode,
        contact_phone: phone,
        contact_email: email,
        location: { lat: location.lat, lng: location.lng },
        verification_status: 'pending', // Require admin verification
        created_at: new Date().toISOString(),
        banner_image: farmPhotoUrl || null
      };
      
      // Execute database operations sequentially to avoid potential race conditions
      // First save vendor data
      console.log('Inserting vendor data:', vendorData);
      const { data: insertedVendor, error: vendorError } = await supabase
        .from('vendors')
        .insert(vendorData)
        .select();
      
      if (vendorError) {
        console.error('Vendor data insertion error:', vendorError);
        throw new Error(`Failed to insert vendor: ${vendorError.message}`);
      }
      
      console.log('Vendor data inserted successfully:', insertedVendor);
      
      // Now save products to a separate products table
      if (formattedProducts.length > 0) {
        // Map products to include the vendor ID
        const productsWithVendorId = formattedProducts.map(product => ({
          ...product,
          id: uuidv4(), // Ensure each product has a valid UUID
          vendor_id: vendorId,
          created_at: new Date().toISOString()
        }));
        
        console.log('Inserting products:', productsWithVendorId);
        
        // Insert products into the products table
        const { data: insertedProducts, error: productsError } = await supabase
          .from('products')
          .insert(productsWithVendorId)
          .select();
        
        if (productsError) {
          console.error('Products insertion error:', productsError);
          // Continue even if products insertion fails
          // We don't want to block the vendor creation
        } else {
          console.log('Products inserted successfully:', insertedProducts);
        }
      } else {
        console.log('No products to save');
      }
      
      // Update user role in profiles table to 'pending_vendor'
    console.log('Updating user profile role to pending_vendor');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: 'pending_vendor',
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId);
    
    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't throw the error, just log it and continue
      // The vendor data is already saved, so we can proceed
      toast.warning('Could not update profile status, but vendor application was submitted');
    } else {
      console.log('Profile updated successfully to pending_vendor');
    }

      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { role: 'pending_vendor' }
      });
      
      if (authError) throw authError;
      
      // Create admin notification with detailed information for review
      console.log('Creating admin notification for new vendor application');
      try {
        const notificationResult = await createAdminNotification(
          'vendor_application',
          `New vendor application from ${vendorName}`,
          { 
            vendorId, 
            userId, 
            vendorName, 
            email, 
            phone,
            address,
            pinCode,
            productsCount: formattedProducts.length,
            applicationDate: new Date().toISOString(),
            farmPhotoUrl
          }
        );
        console.log('Admin notification created:', notificationResult);
      } catch (error) {
        console.error('Error notifying admins:', error);
        // Non-critical error, doesn't affect user flow
      }
      
      // Update toast to success
      toast.success('Application submitted successfully!', {
        id: 'vendor-submission',
        description: 'Your application has been sent for review. An admin will verify your account soon.'
      });
      
      // Redirect to home page instead of vendor dashboard since they're not a vendor yet
      navigate('/');
    } catch (error: unknown) {
      console.error('Error submitting application:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to submit application';
      
      if (error instanceof Error && error.message) {
        if (error.message.includes('duplicate')) {
          errorMessage = 'A vendor with this information already exists';
        } else if (error.message.includes('permission')) {
          errorMessage = 'You don\'t have permission to perform this action';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection';
        } else {
          // Include part of the actual error message for debugging
          errorMessage = `Submission failed: ${error.message.substring(0, 50)}`;
        }
      }
      
      toast.error(errorMessage, { id: 'vendor-submission' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Become a Vendor on KisanKart
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our platform to connect directly with consumers, get better prices for your produce, and grow your farming business.
            </p>
          </div>
          
          {/* Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <span className="text-sm mt-2">Basic Info</span>
              </div>
              <div className={`h-1 flex-1 mx-2 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <span className="text-sm mt-2">Products</span>
              </div>
              <div className={`h-1 flex-1 mx-2 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                  3
                </div>
                <span className="text-sm mt-2">Verification</span>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="vendorName">Vendor/Farm Name*</Label>
                      <Input 
                        id="vendorName" 
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        placeholder="e.g., Sharma Organic Farm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pinCode">PIN Code*</Label>
                      <Input 
                        id="pinCode" 
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        placeholder="e.g., 110001"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description*</Label>
                    <Textarea 
                      id="description" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your farm and products"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address*</Label>
                    <Textarea 
                      id="address" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your complete farm/shop address"
                      rows={2}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Contact Phone*</Label>
                      <Input 
                        id="phone" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g., +91 98765 43210"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Contact Email*</Label>
                      <Input 
                        id="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g., your@email.com"
                        type="email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Farm/Shop Location*</Label>
                    <p className="text-sm text-gray-500 mb-2">
                      Drag the marker to your exact location on the map
                    </p>
                    
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <LocationPicker 
                        initialLocation={location}
                        onLocationChange={setLocation}
                        height="300px"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input 
                          id="latitude" 
                          value={location.lat}
                          onChange={(e) => setLocation({...location, lat: parseFloat(e.target.value)})}
                          type="number"
                          step="0.000001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input 
                          id="longitude" 
                          value={location.lng}
                          onChange={(e) => setLocation({...location, lng: parseFloat(e.target.value)})}
                          type="number"
                          step="0.000001"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 2: Products */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-semibold mb-6">Product Information</h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Add the products you want to sell on our platform. You can add more products later from your vendor dashboard.
                  </p>
                  
                  {products.map((product, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Product {index + 1}</h3>
                        {products.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveProduct(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Product Name*</Label>
                          <Input 
                            value={product.name}
                            onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                            placeholder="e.g., Organic Tomatoes"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea 
                            value={product.description}
                            onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                            placeholder="Brief description of your product"
                            rows={3}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Category*</Label>
                          <Select 
                            value={product.category}
                            onValueChange={(value) => handleProductChange(index, 'category', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vegetables">Vegetables</SelectItem>
                              <SelectItem value="fruits">Fruits</SelectItem>
                              <SelectItem value="grains">Grains & Cereals</SelectItem>
                              <SelectItem value="dairy">Dairy Products</SelectItem>
                              <SelectItem value="spices">Spices</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Price (₹)*</Label>
                            <Input 
                              value={product.price}
                              onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                              placeholder="e.g., 50"
                              type="number"
                              min="0"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Unit*</Label>
                            <Select 
                              value={product.unit}
                              onValueChange={(value) => handleProductChange(index, 'unit', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">Kilogram (kg)</SelectItem>
                                <SelectItem value="gram">Gram (g)</SelectItem>
                                <SelectItem value="piece">Piece</SelectItem>
                                <SelectItem value="dozen">Dozen</SelectItem>
                                <SelectItem value="liter">Liter (L)</SelectItem>
                                <SelectItem value="bundle">Bundle</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddProduct}
                    className="w-full"
                  >
                    + Add Another Product
                  </Button>
                  
                  <div className="mt-10 pt-6 border-t border-gray-200">
                    <h2 className="text-xl font-semibold mb-6">Farm/Shop Photo</h2>
                    <p className="text-sm text-gray-500 mb-6">
                      Upload a photo of your farm or shop to help customers recognize your business.
                    </p>
                    
                    <div className="space-y-2">
                      <Label>Upload Farm/Shop Photo (Optional)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <input
                          type="file"
                          id="farmPhoto"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => e.target.files && setFarmPhotoFile(e.target.files[0])}
                        />
                        <label
                          htmlFor="farmPhoto"
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          {farmPhotoFile ? (
                            <>
                              <FileText className="h-10 w-10 text-green-500 mb-3" />
                              <p className="text-green-600 font-medium">{farmPhotoFile.name}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Click to change file
                              </p>
                            </>
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-gray-400 mb-3" />
                              <p className="text-gray-600 font-medium">Click to upload farm photo</p>
                              <p className="text-sm text-gray-500 mt-1">
                                JPG or PNG (Max 5MB)
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    <div className="rounded-lg bg-green-50 p-4 border border-green-200 mt-6">
                      <h3 className="font-medium text-green-800 mb-2">What happens next?</h3>
                      <ul className="text-sm text-green-700 space-y-2">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                          Your application will be submitted for admin review
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                          You'll receive a notification when your application is approved
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                          Once approved, you can access your vendor dashboard and start selling
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 3: Document Verification */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-semibold mb-6">Document Verification</h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Please upload the following documents for verification. All documents will be reviewed by our admin team.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Identity Proof (Aadhaar/PAN/Voter ID)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <input
                          type="file"
                          id="identityProof"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => e.target.files && setIdentityProofFile(e.target.files[0])}
                        />
                        <label
                          htmlFor="identityProof"
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          {identityProofFile ? (
                            <>
                              <FileText className="h-10 w-10 text-green-500 mb-3" />
                              <p className="text-green-600 font-medium">{identityProofFile.name}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Click to change file
                              </p>
                            </>
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-gray-400 mb-3" />
                              <p className="text-gray-600 font-medium">Click to upload identity proof</p>
                              <p className="text-sm text-gray-500 mt-1">
                                PDF, JPG or PNG (Max 5MB)
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Address Proof</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <input
                          type="file"
                          id="addressProof"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => e.target.files && setAddressProofFile(e.target.files[0])}
                        />
                        <label
                          htmlFor="addressProof"
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          {addressProofFile ? (
                            <>
                              <FileText className="h-10 w-10 text-green-500 mb-3" />
                              <p className="text-green-600 font-medium">{addressProofFile.name}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Click to change file
                              </p>
                            </>
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-gray-400 mb-3" />
                              <p className="text-gray-600 font-medium">Click to upload address proof</p>
                              <p className="text-sm text-gray-500 mt-1">
                                PDF, JPG or PNG (Max 5MB)
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Business Registration (if applicable)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <input
                          type="file"
                          id="businessProof"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => e.target.files && setBusinessProofFile(e.target.files[0])}
                        />
                        <label
                          htmlFor="businessProof"
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          {businessProofFile ? (
                            <>
                              <FileText className="h-10 w-10 text-green-500 mb-3" />
                              <p className="text-green-600 font-medium">{businessProofFile.name}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Click to change file
                              </p>
                            </>
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-gray-400 mb-3" />
                              <p className="text-gray-600 font-medium">Click to upload business registration</p>
                              <p className="text-sm text-gray-500 mt-1">
                                PDF, JPG or PNG (Max 5MB)
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-blue-50 p-4 border border-blue-200 mt-6">
                    <h3 className="font-medium text-blue-800 mb-2">Important Information</h3>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                        All documents are securely stored and only accessible to our verification team
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                        Document verification helps us maintain a trusted marketplace
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                        Your application will be reviewed within 1-2 business days
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-10">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                  >
                    Back
                  </Button>
                ) : <div></div>}
                
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BecomeVendorPage;
