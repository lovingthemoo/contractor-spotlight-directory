
import { Link } from "react-router-dom";
import { Phone, Mail, Clock } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="w-full bg-white border-b">
      {/* Top Bar */}
      <div className="bg-primary py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-white text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              <span>Emergency Services: 0800 123 4567</span>
            </div>
            <div className="hidden md:flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>24/7 Support Available</span>
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
            <Link to="/" className="text-gray-600 hover:text-primary">Home</Link>
            <Link to="/about" className="text-gray-600 hover:text-primary">About</Link>
            <Link to="/services" className="text-gray-600 hover:text-primary">Services</Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary">Contact</Link>
            <Button variant="outline">Register as Trader</Button>
            <Button>Get a Quote</Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
