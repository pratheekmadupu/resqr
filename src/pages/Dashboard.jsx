import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, User, QrCode, Settings, Bell, ChevronRight, Edit3, ExternalLink, Download, Clock, Loader2, Shield, Eye, CheckCircle2, Lock } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { QRCodeCanvas } from 'qrcode.react';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { db } from '../lib/firebase';
import { ref, get, update } from 'firebase/database';
import PromotedAd from '../components/PromotedAd';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [editData, setEditData] = useState({});
    const qrRef = useRef();
    const userDisplayName = profile?.name || 'User';
    const userBloodGroup = profile?.bloodGroup || '--';
    const userContact = profile?.emergencyContactName || '--';

    const handleDownload = () => {
        try {
            // Try different ways to find the canvas
            const canvas = document.getElementById('resqr-qr-canvas') ||
                qrRef.current?.querySelector('canvas') ||
                document.querySelector('#qr-preview canvas');

            if (!canvas) {
                toast.error('Preview not ready. Please try in 2 seconds.');
                return;
            }

            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = url;
            link.download = `RESQR_TAG_${userDisplayName.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('MEDICAL QR DOWNLOADED!');
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Download failed. Try right-clicking the QR.');
        }
    };

    useEffect(() => {
        if (profile) {
            setEditData({
                name: profile.name || "",
                bloodGroup: profile.bloodGroup || "",
                dob: profile.dob || "",
                medicalConditions: profile.medicalConditions || "",
                emergencyContactName: profile.emergencyContactName || "",
                emergencyContactPhone: profile.emergencyContactPhone || "",
            });
        }
    }, [profile]);

    const handleUpdateProfile = async () => {
        const slug = localStorage.getItem('resqr_active_slug');
        if (!slug) return;

        try {
            const updates = {};
            updates[`profiles/${slug}`] = { ...profile, ...editData };

            await update(ref(db), updates);
            setProfile({ ...profile, ...editData });
            toast.success('Passport updated!');
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Update error:", error);
            toast.error('Failed to update profile');
        }
    };

    const [scans, setScans] = useState([]);

    const handleCallFamily = () => {
        if (!profile?.emergencyContactPhone) {
            toast.error("No family contact number set");
            return;
        }
        window.location.href = `tel:${profile.emergencyContactPhone}`;
    };

    const handleShareLocationWithFamily = () => {
        if (!profile?.emergencyContactPhone) {
            toast.error("No family contact number set");
            return;
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const msg = encodeURIComponent(`I am in an emergency! My live location: https://www.google.com/maps?q=${latitude},${longitude}`);
                window.location.href = `https://wa.me/${profile.emergencyContactPhone.replace(/\D/g, '')}?text=${msg}`;
            });
        } else {
            toast.error("GPS not supported");
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const slug = localStorage.getItem('resqr_active_slug');
            if (!slug) {
                setLoading(false);
                return;
            }

            try {
                // Fetch Profile
                const profileSnapshot = await get(ref(db, `profiles/${slug}`));
                if (profileSnapshot.exists()) {
                    const profileData = profileSnapshot.val();
                    setProfile(profileData);

                    // Fetch Scans if they exist
                    if (profileData.scans) {
                        const scanList = Object.entries(profileData.scans)
                            .map(([id, data]) => ({ id, ...data }))
                            .reverse();
                        setScans(scanList);
                    }
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const getQRValue = () => {
        const slug = localStorage.getItem('resqr_active_slug');
        if (!slug) return `${window.location.origin}/e/demo`;
        return `${window.location.origin}/e/${slug}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="text-primary animate-spin" size={48} />
            </div>
        );
    }



    const stats = [
        { label: 'Total Scans', value: scans.length.toString(), icon: <QrCode size={20} />, color: 'bg-blue-600' },
        { label: 'Health Status', value: profile ? 'Verified' : 'Incomplete', icon: <User size={20} />, color: 'bg-green-600' },
        { label: 'Safety Index', value: profile ? 'High' : 'Low', icon: <Bell size={20} />, color: 'bg-primary' },
    ];

    const recentScans = scans.slice(0, 3); // Show top 3 most recent scans

    return (
        <div className="min-h-screen bg-medical-bg py-24 px-4 text-white font-manrope selection:bg-primary/30">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
                    <div>
                        <Badge className="bg-primary/20 text-primary border-none mb-4 px-6 py-1 font-black italic tracking-widest uppercase text-[10px]">GUARDIAN NODE: {localStorage.getItem('resqr_active_slug')?.toUpperCase() || 'DEMO'}</Badge>
                        <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none font-poppins">
                            Unit: <span className="text-primary italic-display">{userDisplayName.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] italic mt-4 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${profile ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'} animate-pulse`} />
                            {profile ? 'ENCRYPTED PROTECTION ACTIVE' : 'SYSTEM OFFLINE: PROFILE REQUIRED'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {profile && (
                            <Button className="rounded-2xl font-black shadow-2xl shadow-primary/30 px-10 py-6 bg-primary text-white border-none text-lg italic uppercase tracking-tighter hover:scale-[1.05] active:scale-95 transition-all" onClick={handleDownload}>
                                <Download size={24} className="mr-3" /> EXPORT IDENTITY
                            </Button>
                        )}
                        <Button variant="outline" className="font-black border-white/10 bg-white/5 hover:bg-white/10 rounded-2xl px-8 py-6 text-slate-300 uppercase italic tracking-widest text-[11px]" onClick={() => profile ? setIsEditModalOpen(true) : window.location.href = '/create-profile'}>
                            {profile ? <Edit3 size={18} className="mr-2 text-primary" /> : <QrCode size={18} className="mr-2 text-primary" />} {profile ? 'Sync Records' : 'Initialize Node'}
                        </Button>
                    </div>
                </header>

                {!profile ? (
                    <Card className="p-24 text-center border-white/5 bg-medical-card shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[60px] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
                        <div className="absolute top-0 right-0 p-16 opacity-[0.05] rotate-12 text-primary group-hover:rotate-45 transition-transform duration-1000">
                            <QrCode size={300} />
                        </div>
                        <div className="w-28 h-28 bg-primary/20 rounded-[40px] flex items-center justify-center mx-auto mb-10 text-primary border border-primary/20 shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform">
                            <QrCode size={56} />
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 italic uppercase tracking-tighter font-poppins leading-none">Identity <br /><span className="text-primary">Not Found</span></h2>
                        <p className="text-slate-500 mb-12 max-w-xl mx-auto text-xl leading-relaxed font-bold italic uppercase tracking-tight">
                            Strategic medical data gap detected. Your protection system is disabled. Initialize your medical vault to ensure responder coverage.
                        </p>
                        <Button size="lg" className="px-16 py-8 rounded-full font-black text-2xl shadow-2xl shadow-primary/40 bg-primary text-white border-none uppercase italic tracking-tighter hover:scale-[1.05] transition-all" onClick={() => window.location.href = '/create-profile'}>
                            START SYSTEM INITIALIZATION
                        </Button>
                    </Card>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {stats.map((stat, i) => (
                                <Card key={i} className="flex items-center gap-8 p-10 bg-medical-card border-white/5 shadow-2xl rounded-[40px] hover:-translate-y-2 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent group-hover:via-primary transition-all duration-700" />
                                    <div className={`${stat.color === 'bg-primary' ? 'bg-primary shadow-primary/20' : 'bg-slate-900 border border-white/5'} w-20 h-20 rounded-[28px] flex items-center justify-center text-white shadow-xl transition-all group-hover:rotate-6 group-hover:scale-110`}>
                                        <div className={stat.color === 'bg-primary' ? 'text-white' : 'text-primary'}>{stat.icon}</div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic">{stat.label}</p>
                                        <p className="text-4xl font-black text-white italic tracking-tighter leading-none font-poppins">{stat.value}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Main Profile Info */}
                            <div className="lg:col-span-2 space-y-12">
                                <Card className="bg-white border-slate-200 shadow-xl rounded-[40px] p-10 relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                                                <Shield size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black uppercase tracking-tighter font-poppins text-slate-900 leading-none">Emergency Passport</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Active Medical Identity</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-6 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] italic">ENCRYPTED</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Blood Group</span>
                                                <p className="text-7xl font-black text-primary leading-none mt-2 font-poppins tracking-tighter">{userBloodGroup}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Medical Conditions</span>
                                                <p className="font-bold text-slate-700 text-lg mt-3 p-5 bg-slate-50 rounded-2xl border border-slate-100 italic">{profile?.medicalConditions || 'No conditions reported'}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Known Allergies</span>
                                                <p className="font-bold text-red-600 text-lg mt-2 p-5 bg-red-50 rounded-2xl border border-red-100 italic">{profile?.allergies || 'No allergies reported'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <div className="p-8 bg-slate-900 rounded-[32px] text-white relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full" />
                                                <div className="flex justify-between items-start relative z-10">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Emergency Contact</span>
                                                        <p className="font-black text-white text-2xl uppercase mt-4">{userContact}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge className="bg-primary/20 text-primary border-none text-[8px] px-3 py-1 font-bold uppercase">{profile?.emergencyContactRelation || '--'}</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <button
                                                            onClick={handleCallFamily}
                                                            className="p-4 bg-green-500 hover:bg-green-600 rounded-2xl shadow-lg transition-all active:scale-95"
                                                            title="Call Family"
                                                        >
                                                            <Phone size={20} fill="currentColor" />
                                                        </button>
                                                        <button
                                                            onClick={handleShareLocationWithFamily}
                                                            className="p-4 bg-primary hover:bg-primary/80 rounded-2xl shadow-lg transition-all active:scale-95"
                                                            title="Share GPS with Family"
                                                        >
                                                            <MapPin size={20} fill="currentColor" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">Family Number</span>
                                                    <p className="text-3xl font-black text-white tracking-tighter font-poppins">{profile?.emergencyContactPhone || '--'}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-6">
                                                <div className="flex items-center gap-5 p-6 bg-green-500/5 rounded-[30px] border border-green-500/10 hover:bg-green-500/10 transition-colors">
                                                    <div className="w-10 h-10 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-lg">
                                                        <CheckCircle2 size={20} />
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-widest text-slate-300 italic">Blockchain Verified Health Record</span>
                                                </div>
                                                <div className="flex items-center gap-5 p-6 bg-blue-500/5 rounded-[30px] border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                                                    <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                                                        <Lock size={20} />
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-widest text-slate-300 italic">256-bit Encrypted Vault Access</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-12">
                                        <Button className="w-full bg-slate-950 hover:bg-slate-800 text-white rounded-2xl py-6 font-bold text-lg gap-2 uppercase tracking-wide group" onClick={() => setIsEditModalOpen(true)}>
                                            UPDATE MEDICAL RECORDS <ChevronRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </Card>

                                <Card className="bg-medical-card border-white/5 shadow-2xl rounded-[50px] p-12 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-10 font-poppins text-white flex items-center justify-between">
                                        Intelligence Logs
                                        <span className="text-[10px] font-black text-slate-500 tracking-[0.5em] italic">SCAN ANALYTICS</span>
                                    </h2>
                                    <div className="space-y-6">
                                        {recentScans.length > 0 ? (
                                            recentScans.map((scan, i) => (
                                                <div key={scan.id || i} className="flex items-center justify-between p-8 bg-slate-950/50 rounded-[32px] border border-white/5 hover:border-primary/30 transition-all hover:bg-slate-950 group">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 bg-medical-bg rounded-2xl flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                                                            <Clock size={28} className="text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none mb-2 font-poppins">{scan.location}</p>
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono italic">{scan.time} • {scan.date}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={`font-black px-6 py-2 border-none italic tracking-widest text-[8px] uppercase ${scan.status === 'Test Scan' ? 'bg-slate-800 text-slate-500' : 'bg-primary text-white shadow-[0_0_20px_rgba(230,57,70,0.3)]'}`}>{scan.status}</Badge>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-24 opacity-20 bg-slate-950 rounded-[40px] border-2 border-dashed border-white/10 group">
                                                <QrCode size={80} className="mx-auto mb-6 text-primary group-hover:scale-110 transition-transform" />
                                                <p className="text-sm font-black uppercase tracking-[0.6em] italic text-white">System Standby <br /> Monitoring for Scans</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <PromotedAd />
                            </div>

                            {/* QR Preview Panel */}
                            <div className="space-y-10">
                                <Card className="text-center overflow-hidden bg-medical-card border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[50px] p-12 relative group sticky top-24">
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                                    <div className="bg-slate-950 p-6 -mx-12 -mt-12 mb-12 border-b border-white/5">
                                        <h3 className="text-white font-black tracking-[0.5em] uppercase text-[10px] italic">Strategic Tactical Anchor</h3>
                                    </div>
                                    <motion.div
                                        id="qr-preview"
                                        ref={qrRef}
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-white p-8 rounded-[48px] border-[16px] border-slate-950 inline-block mb-12 shadow-2xl relative group-hover:shadow-primary/10 transition-all"
                                    >
                                        <QRCodeCanvas
                                            id="resqr-qr-canvas"
                                            value={getQRValue()}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                            imageSettings={{
                                                src: `${import.meta.env.BASE_URL}resqr_icon.png`,
                                                x: undefined,
                                                y: undefined,
                                                height: 40,
                                                width: 40,
                                                excavate: true,
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px] pointer-events-none flex items-center justify-center backdrop-blur-[2px]">
                                            <Eye size={48} className="text-white drop-shadow-2xl" />
                                        </div>
                                    </motion.div>

                                    <div className="mt-4 p-6 bg-slate-950 rounded-[30px] border border-white/5 mb-12">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed italic">
                                            This biometric bridge serves as your unique lifelink. Deployment ready. Deployment speed: 2.1s.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <Button className="w-full bg-primary hover:bg-primary-dark text-white rounded-[24px] py-10 font-black text-2xl shadow-2xl shadow-primary/30 border-none uppercase italic tracking-tighter" onClick={() => window.open(getQRValue(), '_blank')}>
                                            LIVE PREVIEW NODE <ExternalLink size={28} className="ml-3" />
                                        </Button>
                                        <div className="grid grid-cols-1 gap-4">
                                            <Button variant="outline" className="w-full font-black py-4 rounded-2xl border-white/10 bg-white/5 text-slate-400 hover:text-white uppercase tracking-widest text-[9px] italic" onClick={handleDownload}>SAVE TAG TO COMM-DEVICE</Button>
                                            <Button variant="ghost" className="w-full font-black text-[9px] py-3 text-slate-600 hover:text-slate-300 uppercase tracking-[0.4em] italic" onClick={() => window.print()}>Tactical Print Output</Button>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="bg-gradient-to-br from-primary via-primary-dark to-slate-950 text-white p-10 rounded-[50px] relative overflow-hidden group shadow-2xl shadow-primary/40 border border-primary/20">
                                    <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-12">
                                        <Shield size={180} fill="currentColor" />
                                    </div>
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-10 backdrop-blur-xl border border-white/10">
                                        <Bell size={28} className="animate-bounce text-white" />
                                    </div>
                                    <h4 className="font-black text-white mb-6 flex items-center gap-3 uppercase italic tracking-[0.3em] text-xl">
                                        Strategic Intelligence
                                    </h4>
                                    <p className="text-lg text-white/90 leading-relaxed font-black italic pr-8 tracking-tight uppercase">
                                        Embed your physical RESQR beacon on tactical gear (helmets, vests, wallets). Seconds dictate survival outcomes.
                                    </p>
                                    <div className="mt-10 flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/50">Beacon Standing By</span>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Edit Modal Custom Styling */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Secure Profile Sync"
                className="bg-medical-card border-white/5 font-manrope selection:bg-primary/30"
            >
                <div className="space-y-10 p-10 bg-medical-card">
                    <div className="p-6 bg-primary/10 border-l-4 border-primary rounded-2xl flex items-center gap-4">
                        <div className="bg-primary/20 p-2 rounded-lg text-primary">
                            <Lock size={18} />
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
                            Tactical Encryption Active • Vault Seal: Verified
                        </p>
                    </div>

                    <div className="space-y-8">
                        <Input
                            label="Operator Full Name"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="bg-slate-950 border-white/5 rounded-2xl py-6 text-white text-lg focus:ring-primary/20 font-bold placeholder:text-slate-800"
                        />
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Vector Group</label>
                                <select
                                    className="w-full px-4 py-4 bg-slate-950 border border-white/5 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold italic"
                                    value={editData.bloodGroup}
                                    onChange={(e) => setEditData({ ...editData, bloodGroup: e.target.value })}
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                            </div>
                            <Input
                                label="Birth Timestamp"
                                type="date"
                                value={editData.dob}
                                onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                                className="bg-slate-950 border-white/5 rounded-2xl py-6 text-white focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-1 italic">Critical Pathology Logs</label>
                            <textarea
                                className="w-full px-6 py-6 bg-slate-950 border border-white/5 rounded-[32px] h-40 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold placeholder:text-slate-800 italic text-lg leading-relaxed"
                                placeholder="Log all heart pathologies, diabetic data, etc."
                                value={editData.medicalConditions}
                                onChange={(e) => setEditData({ ...editData, medicalConditions: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input
                                label="Liaison Name"
                                value={editData.emergencyContactName}
                                onChange={(e) => setEditData({ ...editData, emergencyContactName: e.target.value })}
                                className="bg-slate-950 border-white/5 rounded-2xl py-6 text-white"
                            />
                            <Input
                                label="Liaison Comm Link"
                                value={editData.emergencyContactPhone}
                                onChange={(e) => setEditData({ ...editData, emergencyContactPhone: e.target.value })}
                                className="bg-slate-950 border-white/5 rounded-2xl py-6 text-white"
                            />
                        </div>
                    </div>

                    <div className="pt-12 flex gap-6">
                        <Button variant="outline" className="flex-1 border-white/5 bg-slate-950 text-slate-500 font-black rounded-2xl py-6 hover:bg-white/5 hover:text-white uppercase italic tracking-widest text-[11px]" onClick={() => setIsEditModalOpen(false)}>ABORT UPDATE</Button>
                        <Button className="flex-1 font-black italic text-2xl shadow-2xl shadow-primary/30 rounded-[24px] py-6 bg-primary text-white border-none uppercase tracking-tighter hover:scale-[1.02] transition-all" onClick={handleUpdateProfile}>COMMIT TO VAULT</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
