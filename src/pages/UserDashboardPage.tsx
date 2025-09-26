
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Settings, Heart, MapPin, History, LogOut,
  Edit, ChevronRight, Trash
} from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase-client';
import { Vendor, UserProfile } from '@/types';
import { toast } from 'sonner';

const UserDashboardPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [favoriteVendors, setFavoriteVendors] = useState<Vendor[]>([]);
  
  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('english');
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileData) {
            setUser(profileData);
            setName(profileData.full_name || '');
            setPhone(profileData.phone || '');
            setLanguage(profileData.preferences?.language || 'english');
            
            // Fetch favorite vendors
            if (profileData.favorites && profileData.favorites.length > 0) {
              const { data: vendorsData } = await supabase
                .from('vendors')
                .select('*')
                .in('id', profileData.favorites);
              
              setFavoriteVendors(vendorsData || []);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // For demo, add some sample data
        setFavoriteVendors(sampleVendors);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  const handleUpdateProfile = async () => {
    try {
      const updates = {
        full_name: name,
        phone,
        preferences: {
          language
        },
        updated_at: new Date().toISOString()
      };
      
      // In a real app, update the profile in Supabase
      /*
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);
      
      if (error) throw error;
      */
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };
  
  const handleRemoveFavorite = (vendorId: string) => {
    setFavoriteVendors(prev => prev.filter(v => v.id !== vendorId));
    toast.success('Vendor removed from favorites');
    
    // In a real app, update the user's favorites in Supabase
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Your Profile</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* User Header */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-2 border-white">
                  <AvatarImage 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name || user?.email?.charAt(0) || 'U'}`} 
                  />
                  <AvatarFallback>
                    {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 
                     user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">
                    {user?.full_name || (user?.email ? user.email.split('@')[0] : 'User')}
                  </h2>
                  <p className="text-gray-600">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
              <Button variant="outline" className="hidden md:flex" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
            
            {/* Tabs */}
            <Tabs defaultValue="favorites">
              <div className="px-6 border-b">
                <TabsList className="justify-start -mb-px">
                  <TabsTrigger value="favorites" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Favorites Tab */}
              <TabsContent value="favorites" className="p-6">
                <h3 className="text-lg font-medium mb-4">Your Favorite Vendors</h3>
                
                {favoriteVendors.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">You haven't saved any vendors yet</p>
                    <Link to="/vendors">
                      <Button>Find Vendors</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteVendors.map((vendor) => (
                      <Card key={vendor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-32 bg-gray-200 relative">
                          <img 
                            src={vendor.banner_image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1932&auto=format&fit=crop"} 
                            alt={vendor.name}
                            className="w-full h-full object-cover"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                            onClick={() => handleRemoveFavorite(vendor.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">{vendor.name}</h4>
                          <div className="flex items-start text-sm text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                            <span>{vendor.address || "Location not specified"}</span>
                          </div>
                          <Link to={`/vendors/${vendor.id}`}>
                            <Button variant="outline" size="sm" className="w-full mt-2">
                              <span>View Details</span>
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                <div className="mt-8 text-center">
                  <Link to="/vendors">
                    <Button variant="outline">
                      <MapPin className="h-4 w-4 mr-2" />
                      Explore More Vendors
                    </Button>
                  </Link>
                </div>
              </TabsContent>
              
              {/* Profile Tab */}
              <TabsContent value="profile" className="p-6">
                <h3 className="text-lg font-medium mb-6">Edit Your Profile</h3>
                
                <div className="max-w-2xl space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={user?.email || 'john.patel@example.com'}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input 
                        id="role" 
                        value={user?.role || 'user'}
                        disabled
                        className="bg-gray-50 capitalize"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4 pt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={handleUpdateProfile}>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Settings Tab */}
              <TabsContent value="settings" className="p-6">
                <h3 className="text-lg font-medium mb-6">Account Settings</h3>
                
                <div className="max-w-2xl space-y-8">
                  <div className="space-y-4">
                    <h4 className="font-medium">Language Preference</h4>
                    <div className="max-w-xs">
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="hindi">Hindi</SelectItem>
                          <SelectItem value="marathi">Marathi</SelectItem>
                          <SelectItem value="tamil">Tamil</SelectItem>
                          <SelectItem value="telugu">Telugu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Notification Settings</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          className="form-checkbox h-5 w-5 text-primary rounded"
                          defaultChecked
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        <input
                          type="checkbox"
                          id="smsNotifications"
                          className="form-checkbox h-5 w-5 text-primary rounded"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleUpdateProfile}>Save Settings</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Mobile Sign Out Button */}
          <div className="md:hidden mt-6">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
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
      { id: '2', name: "Tomatoes", description: "Fresh red tomatoes", price: 30, unit: "kg", stock: 50, category: "vegetables" }
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
  }
];

export default UserDashboardPage;
