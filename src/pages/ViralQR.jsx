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
            setStep('profile');
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

    if (step === 'profile') {
        return (
            <div className="min-h-screen bg-medical-bg text-white font-manrope selection:bg-primary/30 py-10 px-4">
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="text-center mb-10">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR Logo" className="h-12 mx-auto mb-6" />
                        <Badge className="bg-primary/20 text-primary border-none px-6 py-1 font-black italic tracking-widest text-[10px]">BASIC MEDICAL IDENTITY</Badge>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-medical-card rounded-[50px] border-2 border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden"
                    >
                        <div className="bg-slate-950 p-4 border-b border-white/5 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                            <span>Scan Result</span>
                            <span className="text-emerald-500">Live View</span>
                        </div>
                        <div className="p-12 text-center space-y-8">
                            <div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-3 italic">Identity Owner</span>
                                <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter font-poppins leading-none">{name}</h2>
                            </div>
                            <div className="flex justify-center">
                                <div className="bg-primary/10 p-10 rounded-[40px] border border-primary/20 flex flex-col items-center">
                                    <div className="bg-primary p-4 rounded-2xl text-white mb-4">
                                        <Heart size={32} fill="white" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-2 italic">Blood Type</span>
                                    <h3 className="text-6xl font-black text-white leading-none font-poppins italic tracking-tighter">{bloodGroup}</h3>
                                </div>
                            </div>
                            <div className="bg-slate-950 p-6 rounded-3xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Alert Protocol</p>
                                <p className="text-sm font-bold text-white uppercase">Notify emergency responders immediately.</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="bg-slate-900/50 p-10 rounded-[40px] border border-white/5 text-center">
                        <Shield className="text-primary mx-auto mb-6" size={40} />
                        <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-4 leading-none text-white">Critical Limitation</h4>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                            This basic ID does not show medications, allergies, or emergency contacts. Upgrade for full protection.
                        </p>
                        <Link to="/create-profile">
                            <Button className="w-full py-6 rounded-2xl bg-primary text-white border-none font-black italic uppercase tracking-widest">Get Full Protection @ ₹99</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-medical-bg text-white font-manrope selection:bg-primary/30 py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <Badge className="bg-primary/20 text-primary border-none mb-4 px-6 py-1 font-black italic tracking-widest text-[10px]">FREE IDENTITY ENGINE</Badge>
                    <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter font-poppins mb-6 leading-none text-white">
                        Create Your <br /> Emergency QR in <br /> <span className="text-primary italic-display text-white">30 Seconds.</span>
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
                                        className="bg-slate-950 border-white/5 h-20 rounded-3xl font-black italic uppercase tracking-widest px-8 focus:ring-primary/20 text-xl text-white"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-1 italic">Vector Group (Blood)</label>
                                    <select
                                        className="w-full bg-slate-950 border border-white/5 h-20 rounded-3xl font-black italic uppercase tracking-widest px-8 outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-xl text-white"
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
                                    value={`${window.location.origin}/free-qr?name=${encodeURIComponent(name)}&bg=${encodeURIComponent(bloodGroup)}`}
                                    size={250}
                                    bgColor={"#020617"}
                                    fgColor={"#e63946"}
                                    level={"H"}
                                    includeMargin={true}
                                />
                            </div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-white">{name}</h3>
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
                            <div className="bg-medical-card p-10 rounded-[40px] border border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 bg-primary text-white text-[8px] font-black uppercase tracking-widest italic rounded-bl-xl">ID PREVIEW</div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/20 rounded-2xl text-primary border border-primary/20">
                                            <Heart size={24} fill="currentColor" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Identity Marker</p>
                                            <p className="text-xl font-black text-white italic uppercase">{name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-500 border border-blue-500/20">
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Blood Group</p>
                                            <p className="text-xl font-black text-white italic font-poppins">{bloodGroup}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-white/5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic leading-relaxed">
                                            This is how your basic profile appears when scanned. For additional data fields, secure a Premium ID.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-10 rounded-[40px] border border-white/5">
                                <Shield className="text-primary mb-6" size={40} />
                                <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-4 leading-none text-white">Full Protection</h4>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                                    Our Premium ID includes real-time location alerts, full medical history, and physical emergency gear.
                                </p>
                                <Link to="/create-profile">
                                    <Button className="w-full py-6 rounded-2xl bg-primary text-white border-none font-black italic uppercase tracking-widest">Upgrade @ ₹99</Button>
                                </Link>
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

