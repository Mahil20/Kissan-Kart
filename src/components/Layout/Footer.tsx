
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-green-50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">
                Kisan<span className="text-primary">Kart</span>
              </h3>
            </div>
            <p className="text-gray-600">
              Connecting consumers with local farmers across India, promoting sustainable agriculture and fresh produce.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/vendors" className="text-gray-600 hover:text-primary transition-colors">Find Farmers</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-primary transition-colors">FAQs</Link>
              </li>
              <li>
                <Link to="/become-vendor" className="text-gray-600 hover:text-primary transition-colors">Become a Vendor</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <span className="text-gray-600">123 Farmer's Lane, New Delhi, India 110001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-gray-600">+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-gray-600">info@kisankart.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Newsletter</h4>
            <p className="text-gray-600 mb-4">Subscribe to receive updates on local farmers and seasonal produce.</p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} KisanKart. All rights reserved.
          </p>
          <div className="flex space-x-4 text-sm text-gray-600">
            <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <div className="flex items-center text-sm text-gray-500">
            <Leaf className="h-4 w-4 mr-1 text-primary" />
            <span>Supporting Indian farmers, one purchase at a time</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
