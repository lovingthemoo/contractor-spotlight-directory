
import { Link, useLocation } from "react-router-dom";
import { Phone, Mail, Clock } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  const location = useLocation();
  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <header className="w-full bg-white border-b">
      {/* Top Bar */}
      <div className="bg-primary py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-white text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              <span>Contact Us: 0800 123 4567</span>
            </div>
            <div className="hidden md:flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>24/7 Directory Access</span>
            </div>
          </div>
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            <span>info@protradesdirectory.co.uk</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            Pro Trades Directory UK
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`${isCurrentPath('/') ? 'text-primary font-semibold' : 'text-gray-600'} hover:text-primary`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`${isCurrentPath('/about') ? 'text-primary font-semibold' : 'text-gray-600'} hover:text-primary`}
            >
              About
            </Link>
            <Link 
              to="/search" 
              className={`${isCurrentPath('/search') ? 'text-primary font-semibold' : 'text-gray-600'} hover:text-primary`}
            >
              Find a Trader
            </Link>
            <Link to="/register" className="text-gray-600 hover:text-primary">List Your Business</Link>
            <Button variant="outline" asChild>
              <Link to="/register">Register as Trader</Link>
            </Button>
            <Button asChild>
              <Link to="/get-quotes">Get Quotes</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
