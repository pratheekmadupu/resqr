import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    User, QrCode, Bell, ChevronRight,
    Edit3, ExternalLink, Download, Clock, Loader2, Shield,
    Eye, CheckCircle2, Lock, Phone, MapPin
} from 'lucide-react';
import { Card } from '../components/ui/Card';
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
    const [scans, setScans] = useState([]);
    const qrRef = useRef(null);

    // Defensive calculations
    const activeSlug = typeof window !== 'undefined' ? localStorage.getItem('resqr_active_slug') : null;
    const userDisplayName = String(profile?.name || 'User');
    const userBloodGroup = String(profile?.bloodGroup || '--');
    const userContactName = String(profile?.emergencyContactName || '--');
    const familyPhone = String(profile?.emergencyContactPhone || '');
    const familyRelation = String(profile?.emergencyContactRelation || '--');

    const handleDownload = () => {
        try {
            const canvas = document.getElementById('resqr-qr-canvas') ||
                qrRef.current?.querySelector('canvas') ||
                document.querySelector('#qr-preview canvas');

            if (!canvas) {
                toast.error('Preview not ready');
                return;
            }

            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = url;
            link.download = `RESQR_TAG_${userDisplayName.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('QR DOWNLOADED');
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Download error');
        }
    };

    useEffect(() => {
        if (profile) {
            setEditData({
                name: profile.name || "",
                bloodGroup: profile.bloodGroup || "",
                dob: profile.dob || "",
                medicalConditions: profile.medicalConditions || "",
                allergies: profile.allergies || "",
                emergencyContactName: profile.emergencyContactName || "",
                emergencyContactPhone: profile.emergencyContactPhone || "",
                emergencyContactRelation: profile.emergencyContactRelation || ""
            });
        }
    }, [profile]);

    const handleUpdateProfile = async () => {
        if (!activeSlug) return;
        try {
            const updates = {};
            updates[`profiles/${activeSlug}`] = { ...profile, ...editData };
            await update(ref(db), updates);
            setProfile({ ...profile, ...editData });
            toast.success('Vault Updated');
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Update error:", error);
            toast.error('Update Failed');
        }
    };

    const handleCallFamily = () => {
        if (!familyPhone) {
            toast.error("No family contact");
            return;
        }
        window.location.href = `tel:${familyPhone}`;
    };

    const handleShareLocationWithFamily = () => {
        if (!familyPhone) {
            toast.error("No family contact");
            return;
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const msg = encodeURIComponent(`Emergency! Localize me: https://www.google.com/maps?q=${latitude},${longitude}`);
                window.location.href = `https://wa.me/${familyPhone.replace(/\D/g, '')}?text=${msg}`;
            }, () => {
                toast.error("Could not get location");
            });
        } else {
            toast.error("GPS missing");
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!activeSlug) {
                setLoading(false);
                return;
            }

            try {
                const profileSnapshot = await get(ref(db, `profiles/${activeSlug}`));
                if (profileSnapshot.exists()) {
                    const profileData = profileSnapshot.val();
                    setProfile(profileData);
                    if (profileData.scans) {
                        const scanList = Object.entries(profileData.scans)
                            .map(([id, data]) => ({ id, ...data }))
                            .reverse();
                        setScans(scanList);
                    }
                }
            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [activeSlug]);

    const getQRValue = () => {
        if (!activeSlug) return `${window.location.origin}/e/demo`;
        return `${window.location.origin}/e/${activeSlug}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-medical-bg flex items-center justify-center">
                <Loader2 className="text-primary animate-spin" size={48} />
                <p className="ml-4 text-white uppercase tracking-widest font-black italic">Syncing Vault...</p>
            </div>
        );
    }

    const stats = [
        { label: 'Total Scans', value: scans.length.toString(), icon: <QrCode size={20} />, color: 'bg-blue-600' },
        { label: 'Health Status', value: profile ? 'Verified' : 'Incomplete', icon: <User size={20} />, color: 'bg-green-600' },
        { label: 'Safety Index', value: profile ? 'High' : 'Low', icon: <Bell size={20} />, color: 'bg-primary' },
    ];

    const recentScans = scans.slice(0, 3);

    return (
        <div className="min-h-screen bg-medical-bg py-24 px-4 text-white font-manrope">
            <div className="max-w-7xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
                    <div>
                        <Badge className="bg-primary/20 text-primary border-none mb-4 px-6 py-1 font-black italic tracking-widest uppercase text-[10px]">
                            GUARDIAN NODE: {activeSlug?.toUpperCase() || 'DEMO'}
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none font-poppins">
                            Unit: <span className="text-primary">{userDisplayName.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] italic mt-4 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${profile ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                            {profile ? 'ENCRYPTED PROTECTION ACTIVE' : 'SYSTEM OFFLINE: PROFILE REQUIRED'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {profile && (
                            <Button className="rounded-2xl font-black shadow-2xl px-10 py-6 bg-primary text-white border-none text-lg italic uppercase tracking-tighter hover:scale-[1.05] transition-all" onClick={handleDownload}>
                                <Download size={24} className="mr-3" /> EXPORT IDENTITY
                            </Button>
                        )}
                        <Button variant="outline" className="font-black border-white/10 bg-white/5 rounded-2xl px-8 py-6 text-slate-300 uppercase italic tracking-widest text-[11px]" onClick={() => profile ? setIsEditModalOpen(true) : window.location.href = '/create-profile'}>
                            {profile ? 'Sync Records' : 'Initialize Node'}
                        </Button>
                    </div>
                </header>

                {!profile ? (
                    <Card className="p-24 text-center border-white/5 bg-medical-card rounded-[60px] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
                        <div className="w-28 h-28 bg-primary/20 rounded-[40px] flex items-center justify-center mx-auto mb-10 text-primary border border-primary/20 shadow-2xl group-hover:scale-110 transition-transform">
                            <QrCode size={56} />
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 italic uppercase tracking-tighter font-poppins leading-none">Identity <br /><span className="text-primary">Not Found</span></h2>
                        <p className="text-slate-500 mb-12 max-w-xl mx-auto text-xl leading-relaxed font-bold italic uppercase tracking-tight">
                            Strategic medical data gap detected. Initialize your medical vault to ensure coverage.
                        </p>
                        <Button size="lg" className="px-16 py-8 rounded-full font-black text-2xl shadow-2xl bg-primary text-white border-none uppercase italic tracking-tighter hover:scale-[1.05] transition-all" onClick={() => window.location.href = '/create-profile'}>
                            START INITIALIZATION
                        </Button>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {stats.map((stat, i) => (
                                <Card key={i} className="flex items-center gap-8 p-10 bg-medical-card border-white/5 shadow-2xl rounded-[40px] hover:-translate-y-2 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent group-hover:via-primary transition-all duration-700" />
                                    <div className={`${stat.color === 'bg-primary' ? 'bg-primary' : 'bg-slate-900 border border-white/5'} w-20 h-20 rounded-[28px] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-all`}>
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
                            <div className="lg:col-span-2 space-y-12">
                                <Card className="bg-white border-slate-200 shadow-xl rounded-[40px] p-10 relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                                        <div className="flex items-center gap-5 focus-within:ring-2">
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
                                            <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] italic">SECURED</span>
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
                                                <p className="font-bold text-slate-700 text-lg mt-3 p-5 bg-slate-50 rounded-2xl border border-slate-100 italic">{profile?.medicalConditions || 'None'}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Allergies</span>
                                                <p className="font-bold text-red-600 text-lg mt-2 p-5 bg-red-50 rounded-2xl border border-red-100 italic">{profile?.allergies || 'None'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <div className="p-8 bg-slate-900 rounded-[32px] text-white relative overflow-hidden group">
                                                <div className="flex justify-between items-start relative z-10">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Emergency Contact</span>
                                                        <p className="font-black text-white text-2xl uppercase mt-4 truncate max-w-[150px]">{userContactName}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge className="bg-primary/20 text-primary border-none text-[8px] px-3 py-1 font-bold uppercase">{familyRelation}</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <button
                                                            onClick={handleCallFamily}
                                                            className="p-4 bg-green-500 hover:bg-green-600 rounded-2xl shadow-lg transition-all active:scale-95"
                                                        >
                                                            <Phone size={20} fill="currentColor" />
                                                        </button>
                                                        <button
                                                            onClick={handleShareLocationWithFamily}
                                                            className="p-4 bg-primary hover:bg-primary/80 rounded-2xl shadow-lg transition-all active:scale-95"
                                                        >
                                                            <MapPin size={20} fill="currentColor" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">Family Number</span>
                                                    <p className="text-3xl font-black text-white tracking-tighter font-poppins">{familyPhone || '--'}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-6">
                                                <div className="flex items-center gap-5 p-6 bg-green-500/5 rounded-[30px] border border-green-500/10 transition-colors">
                                                    <div className="w-10 h-10 rounded-2xl bg-green-500 flex items-center justify-center text-white">
                                                        <CheckCircle2 size={20} />
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-widest text-white italic">Blockchain Verified</span>
                                                </div>
                                                <div className="flex items-center gap-5 p-6 bg-blue-500/5 rounded-[30px] border border-blue-500/10 transition-colors">
                                                    <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white">
                                                        <Lock size={20} />
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-widest text-white italic">Encrypted Vault</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-12">
                                        <Button className="w-full bg-slate-950 hover:bg-slate-800 text-white rounded-2xl py-6 font-bold text-lg uppercase group" onClick={() => setIsEditModalOpen(true)}>
                                            Update Medical Records <ChevronRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </Card>

                                <Card className="bg-medical-card border-white/5 shadow-2xl rounded-[50px] p-12 relative overflow-hidden">
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-10 font-poppins text-white flex items-center justify-between">
                                        Intelligence Logs
                                        <span className="text-[10px] font-black text-slate-500 tracking-[0.5em] italic uppercase">Analytic Scans</span>
                                    </h2>
                                    <div className="space-y-6">
                                        {recentScans.length > 0 ? (
                                            recentScans.map((scan, i) => (
                                                <div key={i} className="flex items-center justify-between p-8 bg-slate-950/50 rounded-[32px] border border-white/5 hover:border-primary/30 transition-all group">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 bg-medical-bg rounded-2xl flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110">
                                                            <Clock size={28} className="text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none mb-2 font-poppins">{scan.location}</p>
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono italic">{scan.time} \u2022 {scan.date}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant={scan.status === 'Test Scan' ? 'gray' : 'primary'}>{scan.status}</Badge>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-24 opacity-20 bg-slate-950 rounded-[40px] border-2 border-dashed border-white/10">
                                                <QrCode size={80} className="mx-auto mb-6 text-primary" />
                                                <p className="text-sm font-black uppercase tracking-[0.6em] italic text-white text-center">Monitoring Active</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <PromotedAd />
                            </div>

                            <div className="space-y-10">
                                <Card className="text-center bg-medical-card border-white/5 shadow-2xl rounded-[50px] p-12 relative group sticky top-24">
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                                    <div className="bg-slate-900 p-8 rounded-[48px] border-[16px] border-slate-950 inline-block mb-12 shadow-2xl relative">
                                        <QRCodeCanvas
                                            id="resqr-qr-canvas"
                                            value={getQRValue()}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                            imageSettings={{
                                                src: `${import.meta.env.BASE_URL}resqr_icon.png`,
                                                height: 40,
                                                width: 40,
                                                excavate: true,
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-6">
                                        <Button className="w-full bg-primary hover:bg-primary-dark text-white rounded-[24px] py-10 font-black text-2xl shadow-2xl border-none uppercase italic" onClick={() => window.open(getQRValue(), '_blank')}>
                                            Public Vault <ExternalLink size={28} className="ml-3" />
                                        </Button>
                                        <Button variant="outline" className="w-full font-black py-4 rounded-2xl border-white/10 bg-white/5 text-slate-400 uppercase text-[9px] italic" onClick={handleDownload}>Save Tag to Device</Button>
                                    </div>
                                </Card>

                            </div>
                        </div>
                    </>
                )}
            </div>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Secure Profile Sync">
                <div className="space-y-6">
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-4">
                        <Lock size={18} className="text-primary" />
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">
                            Encryption Active: Your medical data is protected
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Basic Identity */}
                        <div className="space-y-4 p-6 bg-slate-900/50 rounded-3xl border border-white/5">
                            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Primary Identity</h4>
                            <Input
                                label="Operator Full Name (Legal Name)"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Blood Group</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-white appearance-none font-bold"
                                        value={editData.bloodGroup}
                                        onChange={(e) => setEditData({ ...editData, bloodGroup: e.target.value })}
                                    >
                                        <option value="">Select Group</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                                <Input
                                    label="Date of Birth"
                                    type="date"
                                    value={editData.dob}
                                    onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Medical Data */}
                        <div className="space-y-4 p-6 bg-slate-900/50 rounded-3xl border border-white/5">
                            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Clinical Intelligence</h4>
                            <Input
                                label="Medical Conditions (e.g., Diabetes, Hypertension)"
                                value={editData.medicalConditions}
                                onChange={(e) => setEditData({ ...editData, medicalConditions: e.target.value })}
                            />
                            <Input
                                label="Critical Allergies & Alerts"
                                value={editData.allergies}
                                onChange={(e) => setEditData({ ...editData, allergies: e.target.value })}
                            />
                        </div>

                        {/* Emergency Liaison */}
                        <div className="space-y-4 p-6 bg-slate-900/50 rounded-3xl border border-white/5">
                            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Emergency Liaison (Family)</h4>
                            <Input
                                label="Family Member Name"
                                value={editData.emergencyContactName}
                                onChange={(e) => setEditData({ ...editData, emergencyContactName: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Relation"
                                    placeholder="e.g. Father, Spouse"
                                    value={editData.emergencyContactRelation}
                                    onChange={(e) => setEditData({ ...editData, emergencyContactRelation: e.target.value })}
                                />
                                <Input
                                    label="Phone Number"
                                    value={editData.emergencyContactPhone}
                                    onChange={(e) => setEditData({ ...editData, emergencyContactPhone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <Button variant="outline" className="flex-1 rounded-2xl h-14 font-bold border-white/10 text-slate-400 hover:text-white" onClick={() => setIsEditModalOpen(false)}>ABORT SYNC</Button>
                        <Button className="flex-1 rounded-2xl h-14 font-black bg-primary text-white shadow-lg shadow-primary/20 italic" onClick={handleUpdateProfile}>COMMIT CHANGES</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
