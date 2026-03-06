import { Link } from 'react-router-dom';
import { Shield, Twitter, Facebook, Instagram, Github } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-secondary/5 font-manrope">
            <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2">
                            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR Logo" style={{ height: '52px', width: 'auto' }} />
                        </Link>
                        <p className="text-secondary/60 text-sm leading-relaxed font-medium">
                            The world's most advanced emergency identification system. We bridge the gap between physical safety and digital health data when every second counts.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Facebook, Instagram, Github].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full border border-secondary/5 flex items-center justify-center text-secondary/40 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-black text-secondary uppercase tracking-[0.2em] mb-8">Ecosystem</h4>
                        <ul className="space-y-4">
                            <li><Link to="/store" className="text-sm font-bold text-secondary/60 hover:text-primary">Official Store</Link></li>
                            <li><Link to="/#features" className="text-sm font-bold text-secondary/60 hover:text-primary">Core Technology</Link></li>
                            <li><Link to="/about" className="text-sm font-bold text-secondary/60 hover:text-primary">Our Mission</Link></li>
                            <li><Link to="/contact" className="text-sm font-bold text-secondary/60 hover:text-primary">Enterprise Solutions</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-black text-secondary uppercase tracking-[0.2em] mb-8">Guardian Support</h4>
                        <ul className="space-y-4">
                            <li><Link to="/contact" className="text-sm font-bold text-secondary/60 hover:text-primary">Contact Helpdesk</Link></li>
                            <li><Link to="/legal" className="text-sm font-bold text-secondary/60 hover:text-primary">Privacy Shield</Link></li>
                            <li><Link to="/legal" className="text-sm font-bold text-secondary/60 hover:text-primary">Guardian Terms</Link></li>
                            <li><Link to="/dashboard" className="text-sm font-bold text-secondary/60 hover:text-primary">Identity Recovery</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-black text-secondary uppercase tracking-[0.2em] mb-8">Secure Updates</h4>
                        <p className="text-sm text-secondary/60 mb-6 font-medium">Join 50,000+ protected users worldwide.</p>
                        <div className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="bg-slate-50 border border-secondary/5 px-4 py-3 rounded-2xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/10 text-secondary font-bold"
                            />
                            <button className="bg-secondary text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest active:scale-95 transition-transform" onClick={() => alert('Welcome to the RESQR Guardian list!')}>Protect Me</button>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-10 border-t border-secondary/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-secondary/40 text-[10px] font-black uppercase tracking-[0.3em]">
                        © {currentYear} RESQR IDENTITY SYSTEMS INC. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center gap-2 opacity-30">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Global Node Network: Online</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
