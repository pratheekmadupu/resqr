import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export default function ContactUs() {
    return (
        <div className="min-h-screen bg-slate-950 py-20 px-4 text-white">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-black italic uppercase tracking-tighter mb-4"
                    >
                        Get in Touch
                    </motion.h1>
                    <p className="text-white opacity-60 max-w-2xl mx-auto text-lg underline decoration-primary decoration-2 underline-offset-4">
                        We're here to help you stay safe. Reach out for support or partnership inquiries.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <Card className="p-8 bg-slate-900 border-slate-800 hover:border-primary/20 transition-all">
                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Email Us</h3>
                                        <p className="text-white opacity-50">support@resqr.co.in</p>
                                        <p className="text-white opacity-50">hello@resqr.co.in</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Call Us</h3>
                                        <p className="text-white opacity-50">+91 (800) 123-4567</p>
                                        <p className="text-xs text-primary font-bold mt-1">AVAILABLE 24/7 FOR EMERGENCIES</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Our Office</h3>
                                        <p className="text-white opacity-50 italic">Corporate Office, Level 4, Safety Hub</p>
                                        <p className="text-white opacity-50">Bangalore, Karnataka, 560001</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 bg-primary/5 border-primary/20">
                            <div className="flex items-center gap-3 mb-4 text-primary">
                                <MessageSquare size={20} />
                                <h3 className="font-bold uppercase tracking-widest text-sm">Live Support</h3>
                            </div>
                            <p className="text-sm text-white opacity-70 mb-6">Our team is active on WhatsApp for instant assistance with profile setup and product orders.</p>
                            <Button className="w-full font-black italic">Chat on WhatsApp</Button>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="p-8 md:p-12 bg-slate-900 border-slate-800 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="FULL NAME" placeholder="Your name" required />
                                    <Input label="EMAIL ADDRESS" type="email" placeholder="email@example.com" required />
                                </div>
                                <Input label="SUBJECT" placeholder="How can we help?" required />
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-white/40 uppercase tracking-[0.2em]">Message</label>
                                    <textarea
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none h-40 text-white"
                                        placeholder="Type your message here..."
                                        required
                                    ></textarea>
                                </div>
                                <Button className="w-full py-6 text-lg font-black italic gap-2 hover:scale-[1.01] transition-transform shadow-lg shadow-primary/20">
                                    <Send size={20} /> SEND MESSAGE
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
