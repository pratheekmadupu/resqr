import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Shield, Zap, Download, Share2, ArrowRight, Heart, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';

export default function ViralQR() {
    const [step, setStep] = useState('create'); // 'create', 'view'
    const [name, setName] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const qrRef = useRef();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const nameParam = queryParams.get('name');
        const bgParam = queryParams.get('bg');
        if (nameParam && bgParam) {
            setName(nameParam);
            setBloodGroup(bgParam);
            setStep('view');
        }
    }, []);

    const handleGenerate = (e) => {
        e.preventDefault();
        if (name && bloodGroup) {
            setStep('view');
        }
    };

    const handleDownload = () => {
        const svg = document.getElementById('viral-qr-svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `RESQR-ID-${name}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <div className="min-h-screen bg-medical-bg text-white font-manrope selection:bg-primary/30 py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <Badge className="bg-primary/20 text-primary border-none mb-4 px-6 py-1 font-black italic tracking-widest text-[10px]">FREE IDENTITY ENGINE</Badge>
                    <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter font-poppins mb-6 leading-none">
                        Create Your <br /> Emergency QR in <br /> <span className="text-primary italic-display">30 Seconds.</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
                        A free, light-weight version of the RESQR premium ID. Perfect for sharing and temporary safety.
                    </p>
                </div>

                {step === 'create' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-medical-card p-10 md:p-16 rounded-[60px] border border-white/5 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                        <form onSubmit={handleGenerate} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-1 italic">Tactical Name</label>
                                    <Input
                                        placeholder="E.G. JOHN DOE"
                                        className="bg-slate-950 border-white/5 h-20 rounded-3xl font-black italic uppercase tracking-widest px-8 focus:ring-primary/20 text-xl"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-1 italic">Vector Group (Blood)</label>
                                    <select
                                        className="w-full bg-slate-950 border border-white/5 h-20 rounded-3xl font-black italic uppercase tracking-widest px-8 outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-xl"
                                        value={bloodGroup}
                                        onChange={(e) => setBloodGroup(e.target.value)}
                                        required
                                    >
                                        <option value="">SELECT...</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                            </div>

                            <Button type="submit" className="w-full py-10 rounded-[30px] text-2xl font-black italic uppercase tracking-tighter shadow-2xl shadow-primary/20 bg-primary text-white border-none group">
                                Generate Identity Node <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12"
                    >
                        <div className="bg-medical-card p-12 rounded-[60px] border-2 border-primary/20 shadow-2xl shadow-primary/10 relative overflow-hidden text-center">
                            <div className="bg-slate-950 p-6 rounded-[30px] inline-block mb-10 border border-white/5">
                                <QRCodeSVG
                                    id="viral-qr-svg"
                                    value={`${window.location.origin}/viral-id?name=${encodeURIComponent(name)}&bg=${encodeURIComponent(bloodGroup)}`}
                                    size={250}
                                    bgColor={"#020617"}
                                    fgColor={"#e63946"}
                                    level={"H"}
                                    includeMargin={true}
                                />
                            </div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{name}</h3>
                            <Badge className="bg-primary/20 text-primary border-none mb-10 px-6 py-2 text-xl font-poppins">{bloodGroup}</Badge>

                            <div className="grid grid-cols-2 gap-4">
                                <Button onClick={handleDownload} className="py-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white border-none font-black italic uppercase text-[10px] tracking-widest">
                                    <Download size={16} className="mr-2" /> Download
                                </Button>
                                <Button onClick={() => navigator.share({ title: 'RESQR ID', url: window.location.href })} className="py-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white border-none font-black italic uppercase text-[10px] tracking-widest">
                                    <Share2 size={16} className="mr-2" /> Share
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center space-y-8">
                            <div className="bg-slate-900/50 p-10 rounded-[40px] border border-white/5">
                                <Shield className="text-primary mb-6" size={40} />
                                <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-4 leading-none">Upgrade to <br /> Full Protection</h4>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                                    This free QR only shows basic info. Our Premium ID includes real-time location alerts, full medical history, and physical emergency gear.
                                </p>
                                <Link to="/create-profile">
                                    <Button className="w-full py-6 rounded-2xl bg-primary text-white border-none font-black italic uppercase tracking-widest">Get Premium ID @ ₹99</Button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: <Zap size={18} />, label: "Live Alerts" },
                                    { icon: <Heart size={18} />, label: "Hospital Near" },
                                    { icon: <Activity size={18} />, label: "NFC Pulse" },
                                    { icon: <Download size={18} />, label: "PDF Card" }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/5 opacity-50">
                                        <div className="text-primary">{item.icon}</div>
                                        <span className="text-[10px] font-black uppercase italic tracking-widest">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="mt-20 text-center">
                    <button onClick={() => setStep('create')} className="text-slate-500 font-black italic uppercase tracking-widest text-[10px] hover:text-primary transition-colors">← Create Another QR</button>
                </div>
            </div>
        </div>
    );
}
