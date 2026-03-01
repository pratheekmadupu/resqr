import { Link } from 'react-router-dom';
import { Shield, Twitter, Facebook, Instagram, Github } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-950 border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR Logo" style={{ height: '48px', width: 'auto' }} />
                        </Link>
                        <p className="text-white text-sm leading-relaxed">
                            Empowering individuals with smart identification solutions for critical moments. Because every second counts.
                        </p>
                        <div className="flex gap-4">
                            <Twitter size={20} className="text-white hover:text-primary cursor-pointer transition-colors" />
                            <Facebook size={20} className="text-white hover:text-primary cursor-pointer transition-colors" />
                            <Instagram size={20} className="text-white hover:text-primary cursor-pointer transition-colors" />
                            <Github size={20} className="text-white hover:text-primary cursor-pointer transition-colors" />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li><Link to="/#features" className="text-sm text-white hover:text-primary">Features</Link></li>
                            <li><Link to="/#pricing" className="text-sm text-white hover:text-primary">Pricing</Link></li>
                            <li><Link to="/contact" className="text-sm text-white hover:text-primary">Enterprise</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li><Link to="/contact" className="text-sm text-white hover:text-primary">Contact Us</Link></li>
                            <li><Link to="/legal" className="text-sm text-white hover:text-primary">Privacy Policy</Link></li>
                            <li><Link to="/legal" className="text-sm text-white hover:text-primary">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Newsletter</h4>
                        <p className="text-sm text-white mb-4">Join 10,000+ people staying safe with RESQR updates.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="email@example.com"
                                className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                            />
                            <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform" onClick={() => alert('Thank you for joining!')}>Join</button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-900 text-center">
                    <p className="text-white text-sm">
                        © {currentYear} RESQR Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
