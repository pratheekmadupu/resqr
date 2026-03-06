import { motion } from 'framer-motion';
import { Shield, Smartphone, Heart, Activity, CheckCircle2, QrCode, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-medical-bg text-slate-300 font-manrope">
            {/* Hero Section */}
            <section className="relative py-32 overflow-hidden bg-slate-950/40 border-b border-white/5">
                <div className="absolute top-0 right-0 p-32 opacity-[0.03] rotate-12 text-white pointer-events-none">
                    <Shield size={400} />
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="space-y-8 max-w-4xl mx-auto"
                    >
                        <Badge className="bg-primary/20 text-primary border-none px-6 py-2 uppercase tracking-[0.3em] font-black italic">
                            OUR MISSION
                        </Badge>
                        <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none font-poppins">
                            Your <span className="text-primary italic-display">Life</span> is Our Mission.
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                            RESQR is the next-gen emergency identification system,
                            engineered to bridge the gap between responders and medical data when every second counts.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Zero-Delay Scans Section */}
            <section className="py-24 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="bg-medical-card p-4 rounded-[50px] shadow-2xl shadow-black/50 border border-white/5"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1542884748-2b87b36c6b90?q=80&w=800&auto=format&fit=crop"
                                alt="Emergency Scan"
                                className="rounded-[40px] w-full object-cover aspect-video opacity-80"
                            />
                        </motion.div>

                        <div className="space-y-10">
                            <div className="space-y-6">
                                <Badge className="bg-white/10 text-white border-none font-black italic">PHASE 01</Badge>
                                <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-tight font-poppins">Zero-Delay Vital Access.</h2>
                                <p className="text-lg text-slate-400 font-medium leading-relaxed">
                                    In an emergency, paramedics don't have time to search for paperwork.
                                    A simple scan of a RESQR tag reveals your **Blood Group**, **Allergies**,
                                    and **Chronic Conditions** instantly on their device.
                                </p>
                            </div>

                            <ul className="space-y-4">
                                {[
                                    'Universal Compatibility - Works on any modern smartphone.',
                                    'Offline Ready - Essential medical flags available instantly.',
                                    'Encrypted Vaults - Only verified responders see full records.'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-slate-300 font-bold group">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Centralized Records Section */}
            <section className="py-24 bg-slate-950/20 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10 lg:text-right">
                            <div className="space-y-6">
                                <Badge className="bg-primary/20 text-primary border-none font-black italic">PHASE 02</Badge>
                                <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-tight font-poppins">One Identity. <br /> Total Control.</h2>
                                <p className="text-lg text-slate-400 font-medium leading-relaxed">
                                    Manage your medical history, primary physician details, and emergency contacts
                                    from a single, secure digital dashboard. Update your info once, and it changes
                                    globally on your live QR tag.
                                </p>
                            </div>

                            <div className="flex lg:justify-end gap-12">
                                <div className="text-center">
                                    <div className="text-5xl font-black text-white mb-1">100%</div>
                                    <div className="text-[10px] uppercase font-black tracking-widest text-primary italic">Private Vaults</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-5xl font-black text-white mb-1">2.4s</div>
                                    <div className="text-[10px] uppercase font-black tracking-widest text-primary italic">Avg. Access Time</div>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="bg-medical-card p-4 rounded-[50px] shadow-2xl shadow-black/50 border border-white/5"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
                                alt="Security Dashboard"
                                className="rounded-[40px] w-full object-cover aspect-video opacity-80"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Why Choose Section - Modern Flip Cards Style */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-20">
                        <Badge className="bg-white/5 text-slate-400 border-none mb-4 px-4 py-1 font-bold">THE RESQR EDGE</Badge>
                        <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter font-poppins">
                            Engineered for <span className="text-primary italic-display">Survival.</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: <Smartphone size={40} />,
                                title: "GPS Tracking",
                                desc: "Automatic broadcast of GPS coordinates to emergency contacts the moment your tag is scanned."
                            },
                            {
                                icon: <Heart size={40} />,
                                title: "Health Integrity",
                                desc: "Securely house life-critical data like Organ Donor status, surgery history, and chronic allergies."
                            },
                            {
                                icon: <Activity size={40} />,
                                title: "Universal Sync",
                                desc: "Your RESQR profile bridges all physical gear, from medical wristbands to helmet stickers."
                            }
                        ].map((box, i) => (
                            <Card key={i} className="bg-medical-card border-white/5 p-12 rounded-[40px] shadow-2xl hover:-translate-y-2 transition-all group">
                                <div className="p-5 bg-slate-950 rounded-2xl w-fit mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                    {box.icon}
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase italic font-poppins mb-6">{box.title}</h3>
                                <p className="text-slate-400 font-medium leading-relaxed">{box.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final Call to Action */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto bg-slate-900 text-white p-20 rounded-[60px] text-center space-y-10 relative overflow-hidden shadow-2xl border border-white/5">
                    <div className="absolute inset-0 bg-primary/10 opacity-50" />
                    <div className="relative z-10 space-y-10">
                        <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none font-poppins">
                            Don't leave your <span className="text-primary">Safety</span> to chance.
                        </h2>
                        <p className="text-white/60 text-xl font-medium max-w-2xl mx-auto">
                            Join over 50,000 users who trust RESQR to speak for them when they can't.
                        </p>
                        <div className="pt-6">
                            <Link to="/create-profile">
                                <Button size="lg" className="px-12 py-5 rounded-full font-black text-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-transform">
                                    GET PROTECTED <ArrowRight size={28} className="ml-3" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-20 text-center opacity-30">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR" className="h-10 mx-auto mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Official About Page • Secured by Guardian Cloud</p>
            </footer>
        </div>
    );
}
