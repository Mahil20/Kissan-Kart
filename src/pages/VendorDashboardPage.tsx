import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { 
  ShoppingBag, Package, Users, TrendingUp, Settings, Map, LogOut,
  Plus, Edit, Trash, Check, Clock, X, MapPin, Info 
} from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase-client';
import { Vendor, Product } from '@/types';
import { toast } from 'sonner';

// For charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VendorDashboardPage = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Profile editing state
  const [vendorName, setVendorName] = useState('');
  const [vendorDescription, setVendorDescription] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorPinCode, setVendorPinCode] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  
  // Form states
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productUnit, setProductUnit] = useState('kg');
  const [productStock, setProductStock] = useState('');
  const [productCategory, setProductCategory] = useState('vegetables');
  
  // Generate chart data based on vendor products
  const [salesData, setSalesData] = useState<Array<{name: string, sales: number}>>([]);
  
  // Generate chart data when vendor data is loaded
  useEffect(() => {
    // Parse products from products_json if it exists, otherwise use products array or empty array
    const products = vendor?.products_json ? JSON.parse(vendor.products_json) : (vendor?.products || []);
    
    if (vendor && products && products.length > 0) {
      // Generate sales data based on product stock and price
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
      const generatedData = months.map((month, index) => {
        // Calculate a sales value based on products (simulating real data)
        const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
        const avgPrice = products.reduce((sum, product) => sum + product.price, 0) / products.length;
        
        // Create a somewhat random but consistent pattern based on product data
        const baseValue = totalStock * avgPrice / 10;
        const randomFactor = 0.7 + (Math.sin(index) + 1) / 2 * 0.6; // Between 0.7 and 1.3
        
        return {
          name: month,
          sales: Math.round(baseValue * randomFactor)
        };
      });
      
      setSalesData(generatedData);
    } else {
      // Default empty data if no products
      setSalesData([
        { name: 'Jan', sales: 0 },
        { name: 'Feb', sales: 0 },
        { name: 'Mar', sales: 0 },
        { name: 'Apr', sales: 0 },
        { name: 'May', sales: 0 },
        { name: 'Jun', sales: 0 },
        { name: 'Jul', sales: 0 },
      ]);
    }
  }, [vendor]);
  
  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch vendor data from Supabase
          const { data: vendorData, error: vendorError } = await supabase
            .from('vendors')
            .select('*')
            .eq('owner_id', session.user.id)
            .single();
          
          if (vendorError) {
            console.error('Error fetching vendor data:', vendorError);
            toast.error('Failed to load vendor profile');
            return;
          }
          
          if (vendorData) {
            console.log('Vendor data fetched successfully:', vendorData.id);
            
            // Now fetch products for this vendor from the products table
            const { data: productsData, error: productsError } = await supabase
              .from('products')
              .select('*')
              .eq('vendor_id', vendorData.id);
            
            if (productsError) {
              console.error('Error fetching products:', productsError);
              toast.error('Failed to load products');
            }
            
            // Combine vendor data with products
            const vendorWithProducts = {
              ...vendorData,
              products: productsData || []
            };
            
            console.log(`Loaded ${vendorWithProducts.products.length} products for vendor`);
            setVendor(vendorWithProducts);
          } else {
            // If no vendor profile exists, redirect to become-vendor page
            toast.info('Please complete your vendor profile');
            navigate('/become-vendor');
          }
        }
      } catch (error) {
        console.error('Error fetching vendor profile:', error);
        toast.error('An error occurred while loading your profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendorProfile();
  }, [navigate]);
  
  const handleAddProduct = () => {
    setCurrentProduct(null);
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductStock('100');
    setProductUnit('kg');
    setProductCategory('vegetables');
    setOpenProductDialog(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setProductName(product.name);
    setProductDescription(product.description || '');
    setProductPrice(product.price.toString());
    setProductStock(product.stock.toString());
    setProductUnit(product.unit);
    setProductCategory(product.category);
    setOpenProductDialog(true);
  };
  
  const handleDeleteProduct = async (productId: string) => {
    if (vendor) {
      try {
        console.log('Deleting product with ID:', productId);
        
        // Delete the product from the products table in Supabase
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        
        if (error) {
          console.error('Database error when deleting product:', error);
          throw error;
        }
        
        console.log('Product deleted from database successfully');
        
        // Update local state after successful database deletion
        const updatedProducts = vendor.products.filter(p => p.id !== productId);
        setVendor({...vendor, products: updatedProducts});
        
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };
  
  const handleSaveProduct = async () => {
    try {
      if (!productName || !productPrice) {
        toast.error('Please fill all required fields');
        return;
      }
      
      console.log('Creating new product with:', { 
        productName, 
        productPrice, 
        productStock, 
        productUnit, 
        productCategory 
      });
      
      if (!vendor) {
        console.error('Vendor not found');
        toast.error('Vendor profile not found. Please refresh the page and try again.');
        return;
      }
      
      // Prepare product data
      const productData = {
        id: currentProduct?.id || uuidv4(), // Use UUID for new products
        vendor_id: vendor.id,
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        stock: parseInt(productStock) || 100,
        unit: productUnit,
        category: productCategory,
        created_at: new Date().toISOString()
      };
      
      if (currentProduct) {
        // Update existing product
        console.log('Updating existing product:', currentProduct.id);
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', currentProduct.id)
          .select();
        
        if (error) {
          console.error('Error updating product:', error);
          throw error;
        }
        
        console.log('Product updated successfully:', data);
        
        // Update local state
        const updatedProducts = vendor.products.map(p => 
          p.id === currentProduct.id ? productData : p
        );
        
        setVendor(prev => ({
          ...prev,
          products: updatedProducts
        }));
      } else {
        // Add new product
        console.log('Adding new product to products table with UUID:', productData.id);
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select();
        
        if (error) {
          console.error('Error adding product:', error);
          throw error;
        }
        
        console.log('Product added successfully:', data);
        
        // Update local state
        const newProducts = [...(vendor.products || []), productData];
        
        setVendor(prev => ({
          ...prev,
          products: newProducts
        }));
      }
      
      toast.success(currentProduct ? 'Product updated successfully' : 'Product added successfully');
      setOpenProductDialog(false);
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save product: ${errorMessage}`);
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };
  
  const handleEditProfile = () => {
    if (vendor) {
      setVendorName(vendor.name || '');
      setVendorDescription(vendor.description || '');
      setVendorAddress(vendor.address || '');
      setVendorPinCode(vendor.pin_code || '');
      setVendorPhone(vendor.contact_phone || '');
      setVendorEmail(vendor.contact_email || '');
      setOpenProfileDialog(true);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!vendor) return;
    
    try {
      setLoading(true);
      
      const updates = {
        name: vendorName,
        description: vendorDescription,
        address: vendorAddress,
        pin_code: vendorPinCode,
        contact_phone: vendorPhone,
        contact_email: vendorEmail,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', vendor.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update local state with the updated vendor data
      setVendor(prev => prev ? { ...prev, ...updates } : null);
      setOpenProfileDialog(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!vendor) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Vendor Profile Found</h2>
          <p className="text-gray-600 mb-8">
            You don't have a vendor profile yet. Create one to start selling your products.
          </p>
          <Link to="/become-vendor">
            <Button size="lg">Become a Vendor</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Verification Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
            <div className="flex items-center mt-2">
              <Badge 
                variant={
                  vendor?.verification_status === "verified" ? "default" : 
                  vendor?.verification_status === "pending" ? "outline" : "destructive"
                }
                className={
                  vendor?.verification_status === "verified" ? "bg-green-500" : 
                  vendor?.verification_status === "pending" ? "border-yellow-500 text-yellow-700" : ""
                }
              >
                {vendor?.verification_status === "verified" && <Check className="mr-1 h-3 w-3" />}
                {vendor?.verification_status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                {vendor?.verification_status === "rejected" && <X className="mr-1 h-3 w-3" />}
                {vendor?.verification_status === "verified" ? "Verified Vendor" : 
                 vendor?.verification_status === "pending" ? "Verification Pending" : "Verification Rejected"}
              </Badge>
              {vendor?.verification_status === "pending" && (
                <span className="text-sm text-gray-500 ml-2">
                  Your application is under review
                </span>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <h3 className="text-2xl font-bold mt-1">{vendor?.products?.length || 0}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Order Requests</p>
                  <div className="flex items-center mt-1">
                    <h3 className="text-xl font-medium text-gray-400">Coming Soon</h3>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer Visits</p>
                  <div className="flex items-center mt-1">
                    <h3 className="text-xl font-medium text-gray-400">Coming Soon</h3>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <div className="flex items-center mt-1">
                    <h3 className="text-xl font-medium text-gray-400">Coming Soon</h3>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts and Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex flex-col items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-500 mb-2">Coming Soon</h3>
                    <p className="text-sm text-gray-400 max-w-md">
                      Sales data will be available after the payment system is activated.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Products Management */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Products</CardTitle>
                <Button size="sm" onClick={handleAddProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Get products from vendor object, ensuring we have a valid array
                  const getProducts = () => {
                    if (vendor?.products && Array.isArray(vendor.products)) {
                      return vendor.products;
                    }
                    return [];
                  };
                  
                  const products = getProducts();
                  
                  if (!products || products.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">You haven't added any products yet</p>
                        <Button onClick={handleAddProduct}>Add Your First Product</Button>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>₹{product.price}/{product.unit}</TableCell>
                            <TableCell>{product.stock} {product.unit}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
          </div>
          
          {/* Right Column - Profile and Location */}
          <div className="space-y-8">
            {/* Vendor Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="w-20 h-20 mb-4">
                    <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=RS" />
                    <AvatarFallback>RS</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{vendor.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">{vendor.address}</p>
                  <Badge variant="outline" className="mt-4 capitalize">
                    {vendor.verification_status}
                  </Badge>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-medium">{vendor.contact_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium">{vendor.contact_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">PIN Code:</span>
                    <span className="font-medium">{vendor.pin_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Joined:</span>
                    <span className="font-medium">{new Date(vendor.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-6" onClick={handleEditProfile}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
            
            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Your Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+22c55e(${vendor.location.lng},${vendor.location.lat})/${vendor.location.lng},${vendor.location.lat},13,0/600x300@2x?access_token=pk.eyJ1IjoiZGVtb21hcGJveCIsImEiOiJjbHR3OWxvbTYwMzJ2MmpuNnN2NDZ6eXo1In0.gciAxK5o3sNS8rDGgzEfMw`} 
                    alt="Vendor location map"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Address:</strong> {vendor.address}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Latitude</p>
                    <p className="font-mono">{vendor.location.lat.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Longitude</p>
                    <p className="font-mono">{vendor.location.lng.toFixed(6)}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Map className="h-4 w-4 mr-2" />
                  Update Location
                </Button>
              </CardContent>
            </Card>
            
            {/* Help Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Info className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Need Help?</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Have questions about your account or how to manage your products?
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Profile Edit Dialog */}
        <Dialog open={openProfileDialog} onOpenChange={setOpenProfileDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Vendor Profile</DialogTitle>
              <DialogDescription>
                Update your vendor profile information below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="vendorName">Business Name*</Label>
                <Input
                  id="vendorName"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="Your business name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="vendorDescription">Description</Label>
                <Textarea
                  id="vendorDescription"
                  value={vendorDescription}
                  onChange={(e) => setVendorDescription(e.target.value)}
                  placeholder="Brief description of your business"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="vendorAddress">Address*</Label>
                <Input
                  id="vendorAddress"
                  value={vendorAddress}
                  onChange={(e) => setVendorAddress(e.target.value)}
                  placeholder="Your business address"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="vendorPinCode">PIN Code*</Label>
                  <Input
                    id="vendorPinCode"
                    value={vendorPinCode}
                    onChange={(e) => setVendorPinCode(e.target.value)}
                    placeholder="PIN code"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="vendorPhone">Phone Number*</Label>
                  <Input
                    id="vendorPhone"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    placeholder="Your contact number"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="vendorEmail">Email Address*</Label>
                <Input
                  id="vendorEmail"
                  type="email"
                  value={vendorEmail}
                  onChange={(e) => setVendorEmail(e.target.value)}
                  placeholder="Your email address"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenProfileDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Product Dialog */}
        <Dialog open={openProductDialog} onOpenChange={setOpenProductDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{currentProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {currentProduct 
                  ? 'Update your product details below'
                  : 'Add a new product to your inventory'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="productName">Product Name*</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., Basmati Rice"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="productDescription">Description</Label>
                <Textarea
                  id="productDescription"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Brief description of your product"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="productPrice">Price (₹)*</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="productUnit">Unit*</Label>
                  <Select value={productUnit} onValueChange={setProductUnit}>
                    <SelectTrigger id="productUnit">
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="productStock">Stock*</Label>
                  <Input
                    id="productStock"
                    type="number"
                    min="0"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="productCategory">Category*</Label>
                  <Select value={productCategory} onValueChange={setProductCategory}>
                    <SelectTrigger id="productCategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                      <SelectItem value="grains">Grains</SelectItem>
                      <SelectItem value="pulses">Pulses</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenProductDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProduct}>
                {currentProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

// Sample vendor data for demo purposes
const sampleVendor: Vendor = {
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
    { id: '3', name: "Spinach", description: "Leafy green spinach", price: 20, unit: "bunch", stock: 30, category: "vegetables" },
    { id: '4', name: "Potatoes", description: "Farm fresh potatoes", price: 25, unit: "kg", stock: 200, category: "vegetables" }
  ],
  contact_phone: "+91 98765 43210",
  contact_email: "ramesh@example.com",
  verification_status: "verified",
  created_at: new Date().toISOString(),
  banner_image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1932&auto=format&fit=crop"
};

export default VendorDashboardPage;
