import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Form schema for login
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

// Form schema for signup with role selection
const signupSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['user', 'vendor', 'admin'], { required_error: 'Please select a role' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const AuthForm = () => {
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('login');
  const [networkStatus, setNetworkStatus] = useState<boolean>(navigator.onLine);
  const [loading, setLoading] = useState<boolean>(false); // ✅ local loading state

  useEffect(() => {
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
    },
  });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    if (!networkStatus) {
      toast.error('No internet connection');
      return;
    }
    try {
      setLoading(true); // ✅ start
      await signIn(values.email, values.password);
    } catch (error) {
      console.error('Login submission error:', error);
    } finally {
      setLoading(false); // ✅ stop
    }
  };

  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    if (!networkStatus) {
      toast.error('No internet connection');
      return;
    }
    try {
      setLoading(true); // ✅ start
      await signUp(values.email, values.password, values.role as 'user' | 'vendor' | 'admin');
    } catch (error) {
      console.error('Signup submission error:', error);
    } finally {
      setLoading(false); // ✅ stop
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <Card className="w-full">
        {!networkStatus && (
          <Alert variant="destructive" className="mb-4 mx-4 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You appear to be offline. Please check your internet connection.
            </AlertDescription>
          </Alert>
        )}
      
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <CardHeader>
              <CardTitle className="text-xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to access your account and manage your profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !networkStatus}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-sm text-center mt-2">
                <span className="text-gray-500">Don't have an account? </span>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setActiveTab('signup')}
                >
                  Sign Up
                </Button>
              </div>
            </CardFooter>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <CardHeader>
              <CardTitle className="text-xl">Create an Account</CardTitle>
              <CardDescription>
                Join our platform to discover local farmers and their products.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I am a</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">Customer / Buyer</SelectItem>
                            <SelectItem value="vendor">Farmer / Seller</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !networkStatus}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-sm text-center text-muted-foreground">
                <p>After signing up, you'll need to verify your email before you can sign in.</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-sm text-center mt-2">
                <span className="text-gray-500">Already have an account? </span>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setActiveTab('login')}
                >
                  Sign In
                </Button>
              </div>
            </CardFooter>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <div className="px-6 pb-6 text-center text-sm text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </Card>
    </div>
  );
};

export default AuthForm;


// import { useState, useEffect } from 'react';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { useAuth } from '@/hooks/useAuth';
// import { toast } from 'sonner';

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';

// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Separator } from '@/components/ui/separator';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { AlertCircle } from 'lucide-react';

// // Form schema for login
// const loginSchema = z.object({
//   email: z.string().email({ message: 'Please enter a valid email address' }),
//   password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
// });

// // Form schema for signup with role selection
// const signupSchema = z.object({
//   email: z.string().email({ message: 'Please enter a valid email address' }),
//   password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
//   confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
//   role: z.enum(['user', 'vendor', 'admin'], { required_error: 'Please select a role' }),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ['confirmPassword'],
// });

// // Component for authentication (login/signup)
// const AuthForm = () => {
//   const { signIn, signUp, loading, error } = useAuth();
//   const [activeTab, setActiveTab] = useState<string>('login');
//   const [networkStatus, setNetworkStatus] = useState<boolean>(navigator.onLine);

//   // Monitor network status
//   useEffect(() => {
//     const handleOnline = () => setNetworkStatus(true);
//     const handleOffline = () => setNetworkStatus(false);

//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);

//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   // Login form
//   const loginForm = useForm<z.infer<typeof loginSchema>>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: '',
//       password: '',
//     },
//   });

//   // Signup form
//   const signupForm = useForm<z.infer<typeof signupSchema>>({
//     resolver: zodResolver(signupSchema),
//     defaultValues: {
//       email: '',
//       password: '',
//       confirmPassword: '',
//       role: 'user',
//     },
//   });

//   // Handle login submission
//   const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
//     if (!networkStatus) {
//       toast.error('No internet connection');
//       return;
//     }
    
//     try {
//       await signIn(values.email, values.password);
//     } catch (error) {
//       console.error('Login submission error:', error);
//     }
//   };

//   // Handle signup submission
//   const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
//     if (!networkStatus) {
//       toast.error('No internet connection');
//       return;
//     }
    
//     try {
//       await signUp(values.email, values.password, values.role as 'user' | 'vendor' | 'admin');
//     } catch (error) {
//       console.error('Signup submission error:', error);
//     }
//   };

//   return (
//     <div className="container mx-auto max-w-md px-4 py-12">
//       <Card className="w-full">
//         {!networkStatus && (
//           <Alert variant="destructive" className="mb-4 mx-4 mt-4">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>
//               You appear to be offline. Please check your internet connection.
//             </AlertDescription>
//           </Alert>
//         )}
      
//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="login">Sign In</TabsTrigger>
//             <TabsTrigger value="signup">Sign Up</TabsTrigger>
//           </TabsList>

//           {/* Login Tab */}
//           <TabsContent value="login">
//             <CardHeader>
//               <CardTitle className="text-xl">Welcome Back</CardTitle>
//               <CardDescription>
//                 Sign in to access your account and manage your profile.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Form {...loginForm}>
//                 <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
//                   <FormField
//                     control={loginForm.control}
//                     name="email"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Email</FormLabel>
//                         <FormControl>
//                           <Input placeholder="you@example.com" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={loginForm.control}
//                     name="password"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Password</FormLabel>
//                         <FormControl>
//                           <Input type="password" placeholder="••••••••" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <Button 
//                     type="submit" 
//                     className="w-full" 
//                     disabled={loading || !networkStatus}
//                   >
//                     {loading ? 'Signing in...' : 'Sign In'}
//                   </Button>
//                 </form>
//               </Form>
//             </CardContent>
//             <CardFooter className="flex flex-col">
//               <div className="text-sm text-center mt-2">
//                 <span className="text-gray-500">Don't have an account? </span>
//                 <Button
//                   type="button"   // ✅ fixed
//                   variant="link"
//                   className="p-0 h-auto"
//                   onClick={() => setActiveTab('signup')}
//                 >
//                   Sign Up
//                 </Button>
//               </div>
//             </CardFooter>
//           </TabsContent>

//           {/* Signup Tab */}
//           <TabsContent value="signup">
//             <CardHeader>
//               <CardTitle className="text-xl">Create an Account</CardTitle>
//               <CardDescription>
//                 Join our platform to discover local farmers and their products.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Form {...signupForm}>
//                 <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
//                   <FormField
//                     control={signupForm.control}
//                     name="email"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Email</FormLabel>
//                         <FormControl>
//                           <Input placeholder="you@example.com" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={signupForm.control}
//                     name="password"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Password</FormLabel>
//                         <FormControl>
//                           <Input type="password" placeholder="••••••••" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={signupForm.control}
//                     name="confirmPassword"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Confirm Password</FormLabel>
//                         <FormControl>
//                           <Input type="password" placeholder="••••••••" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={signupForm.control}
//                     name="role"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>I am a</FormLabel>
//                         <Select onValueChange={field.onChange} defaultValue={field.value}>
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select your role" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             <SelectItem value="user">Customer / Buyer</SelectItem>
//                             <SelectItem value="vendor">Farmer / Seller</SelectItem>
//                             <SelectItem value="admin">Administrator</SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <Button 
//                     type="submit" 
//                     className="w-full" 
//                     disabled={loading || !networkStatus}
//                     // disabled={loading}
//                   >
//                     {loading ? 'Creating account...' : 'Create Account'}
//                   </Button>
//                 </form>
//               </Form>
//               <div className="mt-4 text-sm text-center text-muted-foreground">
//                 <p>After signing up, you'll need to verify your email before you can sign in.</p>
//               </div>
//             </CardContent>
//             <CardFooter className="flex flex-col">
//               <div className="text-sm text-center mt-2">
//                 <span className="text-gray-500">Already have an account? </span>
//                 <Button
//                   type="button"   // ✅ fixed
//                   variant="link"
//                   className="p-0 h-auto"
//                   onClick={() => setActiveTab('login')}
//                 >
//                   Sign In
//                 </Button>
//               </div>
//             </CardFooter>
//           </TabsContent>
//         </Tabs>
        
//         <Separator className="my-4" />
        
//         <div className="px-6 pb-6 text-center text-sm text-gray-500">
//           By continuing, you agree to our Terms of Service and Privacy Policy.
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default AuthForm;

