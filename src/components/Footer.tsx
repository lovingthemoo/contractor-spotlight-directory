
import { Link, useLocation } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const location = useLocation();
  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Pro Trades Directory UK</h3>
            <p className="mb-4">Your trusted platform for finding verified trade professionals across the UK. Easy connections between customers and qualified traders.</p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 hover:text-primary cursor-pointer" />
              <Twitter className="w-5 h-5 hover:text-primary cursor-pointer" />
              <Instagram className="w-5 h-5 hover:text-primary cursor-pointer" />
              <Linkedin className="w-5 h-5 hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Directory</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className={`${isCurrentPath('/about') ? 'text-primary' : ''} hover:text-primary`}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/search" 
                  className={`${isCurrentPath('/search') ? 'text-primary' : ''} hover:text-primary`}
                >
                  Find a Trader
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className={`${isCurrentPath('/register') ? 'text-primary' : ''} hover:text-primary`}
                >
                  List Your Business
                </Link>
              </li>
              <li>
                <Link 
                  to="/get-quotes" 
                  className={`${isCurrentPath('/get-quotes') ? 'text-primary' : ''} hover:text-primary`}
                >
                  Get Quotes
                </Link>
              </li>
            </ul>
          </div>

          {/* Trade Categories */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Find Traders</h3>
            <ul className="space-y-2">
              <li><Link to="/search?category=electrical" className="hover:text-primary">Find Electricians</Link></li>
              <li><Link to="/search?category=plumbing" className="hover:text-primary">Find Plumbers</Link></li>
              <li><Link to="/search?category=building" className="hover:text-primary">Find Builders</Link></li>
              <li><Link to="/search?category=roofing" className="hover:text-primary">Find Roofers</Link></li>
              <li><Link to="/search?category=gardening" className="hover:text-primary">Find Gardeners</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-primary" />
              <span>info@protradesdirectory.co.uk</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Pro Trades Directory UK. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-primary">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
