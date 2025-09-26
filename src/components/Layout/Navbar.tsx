
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut, Heart, MapPin, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  
  // Add effect to track when auth check is complete
  useEffect(() => {
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800">
              Kisan<span className="text-primary">Kart</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary transition-colors">Home</Link>
            <Link to="/vendors" className="text-gray-600 hover:text-primary transition-colors">Find Vendors</Link>
            <Link to="/about" className="text-gray-600 hover:text-primary transition-colors">About</Link>
            <Link to="/faq" className="text-gray-600 hover:text-primary transition-colors">FAQs</Link>
            
            {/* Always render auth UI once we've checked auth state */}
            {authChecked && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    {user.role === 'vendor' && (
                      <Link to="/vendor/dashboard" className="text-gray-600 hover:text-primary">
                        <Button variant="outline" className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          Vendor Dashboard
                        </Button>
                      </Link>
                    )}
                    
                    {user.role === 'admin' && (
                      <Link to="/admin" className="text-gray-600 hover:text-primary">
                        <Button variant="outline" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Admin
                        </Button>
                      </Link>
                    )}
                    
                    {user.role === 'user' && (
                      <Link to="/favorites" className="text-gray-600 hover:text-primary">
                        <Button variant="ghost" size="icon">
                          <Heart className="h-[1.2rem] w-[1.2rem]" />
                        </Button>
                      </Link>
                    )}
                    
                    <Link to="/profile" className="text-gray-600 hover:text-primary">
                      <Button variant="ghost" size="icon">
                        <User className="h-[1.2rem] w-[1.2rem]" />
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleLogout}
                    >
                      <LogOut className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth">
                    <Button>Sign In</Button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 p-4 bg-white rounded-lg shadow-lg animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-primary py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/vendors" 
                className="text-gray-600 hover:text-primary py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Find Vendors
              </Link>
              <Link 
                to="/about" 
                className="text-gray-600 hover:text-primary py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/faq" 
                className="text-gray-600 hover:text-primary py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                FAQs
              </Link>
              
              {authChecked && (
                <>
                  {user ? (
                    <div className="flex flex-col space-y-3 border-t pt-3">
                      {user.role === 'vendor' && (
                        <Link 
                          to="/vendor/dashboard" 
                          className="flex items-center space-x-2 text-gray-600 hover:text-primary py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          <ShoppingBag className="h-5 w-5" />
                          <span>Vendor Dashboard</span>
                        </Link>
                      )}
                      
                      {user.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          className="flex items-center space-x-2 text-gray-600 hover:text-primary py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      
                      {user.role === 'user' && (
                        <Link 
                          to="/favorites" 
                          className="flex items-center space-x-2 text-gray-600 hover:text-primary py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          <Heart className="h-5 w-5" />
                          <span>Favorites</span>
                        </Link>
                      )}
                      
                      <Link 
                        to="/profile" 
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                      </Link>
                      
                      <button 
                        onClick={handleLogout} 
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary py-2"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <Link 
                      to="/auth" 
                      className="w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      <Button className="w-full">Sign In</Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
