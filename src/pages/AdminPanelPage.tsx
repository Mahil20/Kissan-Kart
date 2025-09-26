import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, Users, UserCheck, UserX, LogOut, 
  Search, Check, X, AlertTriangle, ExternalLink,
  Eye, ChevronDown, FileText, MapPin, Phone, Mail
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { 
  supabase,
  getVendors, 
  getPendingVendors, 
  updateVendorVerification,
  getAdminNotifications,
  markNotificationAsRead
} from '@/lib/supabase-client';
import { Vendor, Notification } from '@/types';
import { toast } from 'sonner';

// For stats
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminPanelPage = () => {
  const { signOut, isAdmin, loading, user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Check if user is admin, if not redirect
  useEffect(() => {
    console.log('AdminPanelPage - Auth check:', { 
      isAdmin, 
      loading,
      hasUser: !!user, // Just log if user exists, not the whole object
    });
    
    // Only redirect if we're sure the user is not an admin (after loading is complete)
    if (!loading) {
      if (!isAdmin) {
        console.log('Redirecting from admin page - not an admin');
        toast.error('Unauthorized access');
        navigate('/');
      } else {
        console.log('Admin access confirmed - staying on admin page');
      }
    }
  }, [isAdmin, loading, navigate, user]);
  
  // Fetch admin notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Only fetch notifications if user is admin and fully loaded
        if (!isAdmin || loading) {
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Fetching notifications for user:', session.user.id);
          const { data: notificationsData, error } = await getAdminNotifications(session.user.id);
          
          if (error) {
            console.error('Notification fetch error:', error);
            throw error;
          }
          
          if (notificationsData) {
            console.log('Notifications fetched successfully:', notificationsData.length);
            setNotifications(notificationsData);
            // Check if there are any unread notifications
            const unreadExists = notificationsData.some(notification => !notification.is_read);
            setHasUnreadNotifications(unreadExists);
          } else {
            // If no notifications, set empty array
            setNotifications([]);
            setHasUnreadNotifications(false);
          }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Set empty notifications to prevent further errors
        setNotifications([]);
      }
    };
    
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, payload => {
        // Check if the notification is for this admin
        // Use async/await properly with the Promise returned by getSession
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user && payload.new.user_id === session.user.id) {
          setNotifications(prev => [payload.new, ...prev]);
          setHasUnreadNotifications(true);
          toast.info('New vendor application received!');
          }
        });
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [isAdmin, loading]);
  
  // Fetch all vendors
  const { 
    data: allVendorsData,
    isLoading: isLoadingAllVendors,
  } = useQuery({ 
    queryKey: ['vendors', 'all'],
    queryFn: async () => {
      const response = await getVendors();
      if (response.error) throw new Error(response.error.message);
      return response; // Return the full response object
    },
  });

  // Fetch pending vendors
  const { 
    data: pendingVendorsData, 
    isLoading: isLoadingPendingVendors 
  } = useQuery({ 
    queryKey: ['vendors', 'pending'],
    queryFn: async () => {
      const response = await getPendingVendors();
      if (response.error) throw new Error(response.error.message);
      return response; // Return the full response object
    },
  });
  
  // Mutations for vendor verification
  const approveMutation = useMutation({
    mutationFn: (vendorId: string) => updateVendorVerification(vendorId, 'verified'),
    onSuccess: async (data) => {
      // Close dialog if open
      setOpenDetailsDialog(false);
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      
      // Force refresh auth state to reflect role changes
      try {
        console.log('Refreshing session after vendor approval');
        await supabase.auth.refreshSession();
        console.log('Session refreshed successfully');
      } catch (refreshError) {
        console.error('Error refreshing session:', refreshError);
      }
      
      toast.success('Vendor approved successfully');
    },
    onError: (error: unknown) => {
      console.error('Error approving vendor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve vendor';
      toast.error(errorMessage);
    }
  });
  
  const rejectMutation = useMutation({
    mutationFn: (vendorId: string) => updateVendorVerification(vendorId, 'rejected'),
    onSuccess: () => {
      // Close dialog if open
      setOpenDetailsDialog(false);
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor rejected');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject vendor';
      toast.error(errorMessage);
    }
  });
  
  const handleViewDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setOpenDetailsDialog(true);
  };
  
  const handleApproveVendor = (vendorId: string) => {
    approveMutation.mutate(vendorId);
  };
  
  const handleRejectVendor = (vendorId: string) => {
    rejectMutation.mutate(vendorId);
  };
  
  const handleLogout = async () => {
    await signOut();
  };
  
  // Prepare data for display
  const allVendors = allVendorsData?.data || [];
  const pendingVendors = pendingVendorsData?.data || [];

  // Filter vendors based on search query and status filter
  const filteredVendors = allVendors.filter(vendor => {
    const matchesSearch = 
      searchQuery === '' || 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.pin_code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      vendor.verification_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  // Stats data for charts
  const verificationStats = [
    { 
      status: 'Verified', 
      count: allVendors.filter(v => v.verification_status === 'verified').length 
    },
    { 
      status: 'Pending', 
      count: allVendors.filter(v => v.verification_status === 'pending').length 
    },
    { 
      status: 'Rejected', 
      count: allVendors.filter(v => v.verification_status === 'rejected').length 
    },
  ];
  
  // Group vendors by region (simplified by pin_code first digit)
  const regionStats = Object.entries(
    allVendors.reduce((acc: Record<string, number>, vendor) => {
      // Simplified grouping by pin code first 2 digits as "region"
      const region = vendor.pin_code?.substring(0, 2) || 'Unknown';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {})
  ).map(([region, count]) => ({ region, count }));

  // Show loading state
  if (isLoadingAllVendors && isLoadingPendingVendors) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center">
              <Skeleton className="h-16 w-16 rounded-lg mr-4" />
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Skeleton className="h-10 w-64 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center">
            <div className="bg-primary/10 p-3 rounded-lg mr-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600">Manage vendors and platform operations</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative" 
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <AlertTriangle className="h-5 w-5" />
                {hasUnreadNotifications && (
                  <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </Button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-200 font-medium">Notifications</div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div>
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}
                            onClick={async () => {
                              // Mark as read
                              await markNotificationAsRead(notification.id);
                              
                              // If it's a vendor application, find and view the vendor
                              if (notification.type === 'vendor_application') {
                                const vendorId = notification.data.vendorId;
                                const vendor = allVendors.find(v => v.id === vendorId);
                                if (vendor) {
                                  handleViewDetails(vendor);
                                }
                              }
                              
                              // Update notification list
                              setNotifications(prev => 
                                prev.map(n => n.id === notification.id ? {...n, is_read: true} : n)
                              );
                              
                              // Check if there are still unread notifications
                              const stillHasUnread = notifications.some(
                                n => n.id !== notification.id && !n.is_read
                              );
                              setHasUnreadNotifications(stillHasUnread);
                            }}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3">
                                {notification.type === 'vendor_application' ? (
                                  <UserCheck className="h-5 w-5 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                              </div>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                  <h3 className="text-2xl font-bold mt-1">{allVendors.length}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Verified Vendors</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {allVendors.filter(v => v.verification_status === 'verified').length}
                  </h3>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                  <h3 className="text-2xl font-bold mt-1">{pendingVendors.length}</h3>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rejected Vendors</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {allVendors.filter(v => v.verification_status === 'rejected').length}
                  </h3>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs defaultValue="pending" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="flex gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pending Approval
              {pendingVendors.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingVendors.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="flex gap-2">
              <Users className="h-4 w-4" />
              All Vendors
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex gap-2">
              <BarChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          {/* Pending Approval Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Vendors Pending Verification</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingVendors.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-2">No pending verification requests</p>
                    <p className="text-sm text-gray-400">All vendor applications have been processed</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Applied On</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingVendors.map((vendor) => (
                          <TableRow key={vendor.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={vendor.profile_image} alt={vendor.name || 'Vendor'} />
                                  <AvatarFallback>{(vendor.name || 'V').substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{vendor.name}</div>
                                  <div className="text-xs text-gray-500">ID: {vendor.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-start">
                                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-1" />
                                <div>
                                  <div className="text-sm">{vendor.address || 'No address'}</div>
                                  <div className="text-xs text-gray-500">PIN: {vendor.pin_code || 'N/A'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{vendor.contact_phone}</div>
                              <div className="text-xs text-gray-500">{vendor.contact_email}</div>
                            </TableCell>
                            <TableCell>
                              {new Date(vendor.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewDetails(vendor)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                  onClick={() => handleApproveVendor(vendor.id)}
                                  disabled={approveMutation.isPending}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                  onClick={() => handleRejectVendor(vendor.id)}
                                  disabled={rejectMutation.isPending}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* All Vendors Tab */}
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle>All Vendors</CardTitle>
                  <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search vendors..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredVendors.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-2">No vendors found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVendors.map((vendor) => (
                          <TableRow key={vendor.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={vendor.profile_image} alt={vendor.name || 'Vendor'} />
                                  <AvatarFallback>{(vendor.name || 'V').substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{vendor.name || 'Unnamed Vendor'}</div>
                                  <div className="text-xs text-gray-500">
                                    {vendor.contact_phone || 'No phone'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-start">
                                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-1" />
                                <div>
                                  <div className="text-sm">{vendor.address || 'No address'}</div>
                                  <div className="text-xs text-gray-500">PIN: {vendor.pin_code || 'N/A'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {vendor.products?.length || 0} products
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  vendor.verification_status === "verified" ? "default" : 
                                  vendor.verification_status === "pending" ? "outline" : "destructive"
                                }
                                className={
                                  vendor.verification_status === "verified" ? "bg-green-500" : 
                                  vendor.verification_status === "pending" ? "border-yellow-500 text-yellow-700" : ""
                                }
                              >
                                {vendor.verification_status === "verified" && <Check className="mr-1 h-3 w-3" />}
                                {vendor.verification_status === "pending" && <AlertTriangle className="mr-1 h-3 w-3" />}
                                {vendor.verification_status === "rejected" && <X className="mr-1 h-3 w-3" />}
                                <span className="capitalize">{vendor.verification_status}</span>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewDetails(vendor)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                                <Link to={`/vendors/${vendor.id}`} target="_blank">
                                  <Button variant="outline" size="sm">
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View Profile
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={verificationStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Vendors by Region</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={regionStats} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="region" type="category" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <UserCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">New vendor approved</p>
                        <p className="text-sm text-gray-500">A vendor was verified by admin</p>
                        <p className="text-xs text-gray-400 mt-1">Recently</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">New verification request</p>
                        <p className="text-sm text-gray-500">A vendor submitted verification documents</p>
                        <p className="text-xs text-gray-400 mt-1">Recently</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">User activity report</p>
                        <p className="text-sm text-gray-500">Weekly user engagement increased</p>
                        <p className="text-xs text-gray-400 mt-1">Recently</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Vendor Details Dialog */}
        {selectedVendor && (
          <Dialog open={openDetailsDialog} onOpenChange={setOpenDetailsDialog}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Vendor Details</DialogTitle>
                <DialogDescription>
                  Review vendor information and verification documents
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Vendor Profile */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedVendor.profile_image} alt={selectedVendor.name} />
                    <AvatarFallback>{selectedVendor.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedVendor.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {selectedVendor.address}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {selectedVendor.contact_phone}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {selectedVendor.contact_email}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Submitted on {new Date(selectedVendor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Vendor Description */}
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">
                    {selectedVendor.description || "No description provided."}
                  </p>
                </div>
                
                {/* Location */}
                <div>
                  <h4 className="font-medium mb-2">Location Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Address</p>
                      <p>{selectedVendor.address}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">PIN Code</p>
                      <p>{selectedVendor.pin_code}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Latitude</p>
                      <p className="font-mono">{selectedVendor.location?.lat?.toFixed(6) || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Longitude</p>
                      <p className="font-mono">{selectedVendor.location?.lng?.toFixed(6) || "N/A"}</p>
                    </div>
                  </div>
                  
                  {selectedVendor.location && (
                    <div className="h-48 rounded-lg overflow-hidden mt-4 border border-gray-200">
                      <img 
                        src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+22c55e(${selectedVendor.location.lng},${selectedVendor.location.lat})/${selectedVendor.location.lng},${selectedVendor.location.lat},13,0/600x300@2x?access_token=pk.eyJ1IjoiZGVtb21hcGJveCIsImEiOiJjbHR3OWxvbTYwMzJ2MmpuNnN2NDZ6eXo1In0.gciAxK5o3sNS8rDGgzEfMw`} 
                        alt="Vendor location map"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                
                {/* Verification Documents */}
                <div>
                  <h4 className="font-medium mb-2">Verification Documents</h4>
                  <Collapsible className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        <span className="font-medium">ID Proof</span>
                      </div>
                      <ChevronDown className="h-5 w-5" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4">
                      {selectedVendor.id_proof_url ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <img 
                            src={selectedVendor.id_proof_url} 
                            alt="ID Proof" 
                            className="w-full h-auto max-h-64 object-contain"
                          />
                          <div className="p-3 bg-gray-50 border-t border-gray-200">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => window.open(selectedVendor.id_proof_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Full Document
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <p className="text-gray-500">No ID proof document available</p>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                  
                  {selectedVendor.banner_image && (
                    <Collapsible className="border rounded-lg mt-3">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-green-600" />
                          <span className="font-medium">Farm/Shop Photo</span>
                        </div>
                        <ChevronDown className="h-5 w-5" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <img 
                            src={selectedVendor.banner_image} 
                            alt="Farm/Shop Photo" 
                            className="w-full h-auto max-h-64 object-cover"
                          />
                          <div className="p-3 bg-gray-50 border-t border-gray-200">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => window.open(selectedVendor.banner_image, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Full Image
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
                
                {/* Products */}
                <div>
                  <h4 className="font-medium mb-2">Products ({selectedVendor.products?.length || 0})</h4>
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedVendor.products?.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {product.category || 'No category'}
                              </Badge>
                            </TableCell>
                            <TableCell>₹{product.price}/{product.unit}</TableCell>
                          </TableRow>
                        ))}
                        {(!selectedVendor.products || selectedVendor.products.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                              No products available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="space-x-4">
                <Button variant="outline" onClick={() => setOpenDetailsDialog(false)}>
                  Close
                </Button>
                {selectedVendor.verification_status === 'pending' && (
                  <>
                    <Button 
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => handleRejectVendor(selectedVendor.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      {rejectMutation.isPending ? 'Rejecting...' : 'Reject Application'}
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveVendor(selectedVendor.id)}
                      disabled={approveMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {approveMutation.isPending ? 'Approving...' : 'Approve Vendor'}
                    </Button>
                  </>
                )}
                {selectedVendor.verification_status === 'verified' && (
                  <Button 
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => handleRejectVendor(selectedVendor.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Revoke Verification
                  </Button>
                )}
                {selectedVendor.verification_status === 'rejected' && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproveVendor(selectedVendor.id)}
                    disabled={approveMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Vendor
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminPanelPage;
