
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">London Contractors</h3>
            <p className="mb-4">Connecting you with London's most trusted and qualified contractors. All professionals are verified and rated 4★ or above.</p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 hover:text-primary cursor-pointer" />
              <Twitter className="w-5 h-5 hover:text-primary cursor-pointer" />
              <Instagram className="w-5 h-5 hover:text-primary cursor-pointer" />
              <Linkedin className="w-5 h-5 hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link to="/services" className="hover:text-primary">Our Services</Link></li>
              <li><Link to="/testimonials" className="hover:text-primary">Testimonials</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
              <li><Link to="/register" className="hover:text-primary">Become a Contractor</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li><Link to="/central-london/electrical/search" className="hover:text-primary">Electrical Services</Link></li>
              <li><Link to="/central-london/plumbing/search" className="hover:text-primary">Plumbing Services</Link></li>
              <li><Link to="/central-london/building/search" className="hover:text-primary">Building & Construction</Link></li>
              <li><Link to="/central-london/roofing/search" className="hover:text-primary">Roofing Services</Link></li>
              <li><Link to="/central-london/gardening/search" className="hover:text-primary">Gardening & Landscaping</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                <span>123 Business Centre, London, UK</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-primary" />
                <span>0800 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-primary" />
                <span>info@londoncontractors.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} London Contractors. All rights reserved.</p>
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
