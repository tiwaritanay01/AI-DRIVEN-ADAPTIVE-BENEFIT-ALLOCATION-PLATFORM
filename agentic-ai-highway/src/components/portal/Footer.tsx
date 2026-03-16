import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="gov-gradient text-white/80 mt-auto" role="contentinfo">
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">About</h3>
          <ul className="space-y-2 text-sm" role="list">
            <li><Link to="/" className="hover:text-gov-saffron transition-colors">About the Portal</Link></li>
            <li><a href="#" className="hover:text-gov-saffron transition-colors">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-gov-saffron transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-2 text-sm" role="list">
            <li><Link to="/services" className="hover:text-gov-saffron transition-colors">All Services</Link></li>
            <li><Link to="/submit" className="hover:text-gov-saffron transition-colors">Submit Application</Link></li>
            <li><Link to="/track" className="hover:text-gov-saffron transition-colors">Track Application</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">Help</h3>
          <ul className="space-y-2 text-sm" role="list">
            <li><a href="#" className="hover:text-gov-saffron transition-colors">FAQs</a></li>
            <li><a href="#" className="hover:text-gov-saffron transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-gov-saffron transition-colors">Feedback</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">Connect</h3>
          <p className="text-sm">National Helpline: <strong className="text-gov-saffron">1800-111-555</strong></p>
          <p className="text-sm mt-2">Email: support@india.gov.in</p>
        </div>
      </div>
      <div className="border-t border-white/10 mt-8 pt-4 text-center text-xs text-white/50">
        <p>© 2026 Government of India. Powered by Agentic AI Data Highway.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
