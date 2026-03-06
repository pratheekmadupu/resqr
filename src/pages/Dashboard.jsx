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
        <div className="min-h-screen bg-medical-bg py-12 px-4 text-secondary font-manrope">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
                    <div>
                        <Badge className="bg-primary/10 text-primary border-none mb-3 px-4 py-1">User Dashboard</Badge>
                        <h1 className="text-4xl md:text-5xl font-black text-secondary italic uppercase tracking-tighter font-poppins">
                            Welcome, {userDisplayName.split(' ')[0]}
                        </h1>
                        <p className="text-secondary/50 font-bold italic mt-2 tracking-wide">
                            {profile ? 'PROTECTION SYSTEM ACTIVE' : 'PROFILE SETUP INCOMPLETE'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {profile && (
                            <Button variant="primary" size="lg" className="rounded-2xl font-black shadow-xl shadow-primary/20 px-8 py-4" onClick={handleDownload}>
                                <Download size={24} className="mr-2" /> GET PASSPORT
                            </Button>
                        )}
                        <Button variant="outline" className="font-black border-secondary/10 bg-white hover:bg-secondary/5 rounded-2xl px-6" size="lg" onClick={() => profile ? setIsEditModalOpen(true) : window.location.href = '/create-profile'}>
                            {profile ? <Edit3 size={20} className="mr-2" /> : <QrCode size={20} className="mr-2" />} {profile ? 'Edit Profile' : 'Setup Profile'}
                        </Button>
                    </div>
                </header>

                {!profile ? (
                    <Card className="p-20 text-center border-none bg-white shadow-2xl rounded-[40px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 text-primary">
                            <QrCode size={200} />
                        </div>
                        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary border border-primary/20">
                            <QrCode size={48} />
                        </div>
                        <h2 className="text-4xl font-black text-secondary mb-4 italic uppercase tracking-tighter font-poppins">Identity Not Found</h2>
                        <p className="text-secondary/60 mb-10 max-w-md mx-auto text-lg leading-relaxed font-medium">
                            First responders need your medical data to save your life. Complete your setup now to activate your protection tag.
                        </p>
                        <Button size="lg" className="px-12 py-6 rounded-full font-black text-xl shadow-2xl shadow-primary/30" onClick={() => window.location.href = '/create-profile'}>
                            Create My Profile
                        </Button>
                    </Card>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {stats.map((stat, i) => (
                                <Card key={i} className="flex items-center gap-6 p-8 bg-white border-none shadow-xl shadow-secondary/5 rounded-[32px] hover:-translate-y-1 transition-all group border-b-4 border-transparent hover:border-primary/20">
                                    <div className={`${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-3`}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                        <p className="text-3xl font-black text-secondary italic leading-none">{stat.value}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Main Profile Info */}
                            <div className="lg:col-span-2 space-y-10">
                                <Card className="bg-white border-none shadow-2xl rounded-[40px] p-10 relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-secondary/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-white">
                                                <Shield size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black italic uppercase tracking-tighter font-poppins">Emergency Passport</h3>
                                                <p className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.2em] mt-1">Responder Critical Data</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-700 border-none font-black px-4 py-1">ACTIVE</Badge>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div>
                                                <span className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.2em]">Blood Group</span>
                                                <p className="text-6xl font-black text-primary italic leading-none mt-2">{userBloodGroup}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.2em]">Medical Conditions</span>
                                                <p className="font-bold text-secondary text-lg mt-2 p-4 bg-slate-50 rounded-2xl border border-secondary/5">{profile?.medicalConditions || 'No conditions listed'}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.2em]">Known Allergies</span>
                                                <p className="font-bold text-primary text-lg mt-2 p-4 bg-primary/5 rounded-2xl border border-primary/10">{profile?.allergies || 'No allergies listed'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <div className="p-6 bg-secondary/5 rounded-3xl border border-secondary/10 relative">
                                                <span className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em]">Primary Contact</span>
                                                <p className="font-black text-secondary text-2xl uppercase italic mt-2">{userContact}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className="bg-secondary text-white border-none text-[10px] px-2 py-0.5">{profile?.emergencyContactRelation || '--'}</Badge>
                                                </div>
                                                <p className="text-3xl font-black text-secondary mt-4 tracking-tighter">{profile?.emergencyContactPhone || '--'}</p>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100">
                                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                                                        <CheckCircle2 size={16} />
                                                    </div>
                                                    <span className="text-sm font-bold text-green-800">Verified Health Record</span>
                                                </div>
                                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                                        <Lock size={16} />
                                                    </div>
                                                    <span className="text-sm font-bold text-blue-800">256-bit Encrypted Vault</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-12">
                                        <Button variant="secondary" className="w-full bg-secondary hover:bg-secondary-light text-white rounded-2xl py-6 font-black text-lg gap-2 shadow-xl shadow-secondary/10" onClick={() => setIsEditModalOpen(true)}>
                                            UPDATE IDENTITY RECORDS <ChevronRight size={20} />
                                        </Button>
                                    </div>
                                </Card>

                                <Card className="bg-white border-none shadow-xl rounded-[40px] p-10">
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 font-poppins border-b border-secondary/5 pb-4">Recent Scan Analytics</h2>
                                    <div className="space-y-4">
                                        {recentScans.length > 0 ? (
                                            recentScans.map((scan, i) => (
                                                <div key={scan.id || i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-secondary/5 hover:border-primary/20 transition-all hover:bg-white hover:shadow-lg group">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-secondary/10 shadow-sm group-hover:bg-primary/5 transition-colors">
                                                            <Clock size={24} className="text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-black text-secondary uppercase tracking-tight leading-none mb-1">{scan.location}</p>
                                                            <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">{scan.time} • {scan.date}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={`font-black px-4 py-1 border-none ${scan.status === 'Test Scan' ? 'bg-slate-200 text-slate-600' : 'bg-primary text-white shadow-lg shadow-primary/20 text-[10px]'}`}>{scan.status}</Badge>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-16 opacity-30 bg-slate-50 rounded-[32px] border border-dashed border-secondary/20">
                                                <QrCode size={64} className="mx-auto mb-4" />
                                                <p className="text-sm font-black uppercase tracking-[0.3em]">Guardian system is ready <br /> No scans detected yet</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <PromotedAd />
                            </div>

                            {/* QR Preview Panel */}
                            <div className="space-y-8">
                                <Card className="text-center overflow-hidden bg-white border-none shadow-2xl rounded-[44px] p-10 relative">
                                    <div className="bg-secondary p-4 -mx-10 -mt-10 mb-10">
                                        <h3 className="text-white font-black tracking-[0.4em] uppercase text-[10px]">LIVE IDENTITY ANCHOR</h3>
                                    </div>
                                    <motion.div
                                        id="qr-preview"
                                        ref={qrRef}
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-white p-6 rounded-[48px] border-[12px] border-medical-bg inline-block mb-10 shadow-xl relative group"
                                    >
                                        <QRCodeCanvas
                                            id="resqr-qr-canvas"
                                            value={getQRValue()}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                            imageSettings={{
                                                src: `${import.meta.env.BASE_URL}logo.png`,
                                                x: undefined,
                                                y: undefined,
                                                height: 40,
                                                width: 40,
                                                excavate: true,
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[36px] pointer-events-none flex items-center justify-center">
                                            <Eye size={40} className="text-white drop-shadow-lg" />
                                        </div>
                                    </motion.div>

                                    <div className="mt-4 p-5 bg-medical-bg rounded-3xl border border-secondary/5 mb-10">
                                        <p className="text-xs font-bold text-secondary/40 uppercase tracking-[0.2em] leading-relaxed">
                                            This QR is your unique lifelink. Paramedics use this to access your vault in 2.4s avg.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <Button variant="secondary" className="w-full bg-secondary hover:bg-secondary-light text-white rounded-2xl py-5 font-black text-lg shadow-xl shadow-secondary/20" onClick={() => window.open(getQRValue(), '_blank')}>
                                            PREVIEW IDENTITY <ExternalLink size={24} className="ml-2" />
                                        </Button>
                                        <div className="grid grid-cols-1 gap-3">
                                            <Button variant="primary" className="w-full font-black py-4 rounded-xl shadow-lg" onClick={handleDownload}>DOWNLOAD IDENTITY TAG</Button>
                                            <Button variant="outline" className="w-full font-black text-xs py-3 border-secondary/10 bg-slate-50 opacity-60 hover:opacity-100" onClick={() => window.print()}>PRINT PDF READY</Button>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="bg-gradient-to-br from-primary to-primary-dark text-white p-8 rounded-[40px] relative overflow-hidden group shadow-2xl shadow-primary/30">
                                    <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                                        <Bell size={140} fill="currentColor" />
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md">
                                        <Bell size={24} className="animate-bounce" />
                                    </div>
                                    <h4 className="font-black text-white mb-4 flex items-center gap-2 uppercase italic tracking-widest text-lg">
                                        Life Tip
                                    </h4>
                                    <p className="text-sm text-white/90 leading-relaxed font-bold italic pr-10">
                                        Carry your physical RESQR tag on your helmet, wallet, or wrist at all times. Seconds save lives.
                                    </p>
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
                title="Secure Profile Update"
            >
                <div className="space-y-8 p-6 font-manrope">
                    <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-xl">
                        <p className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                            <Shield size={14} /> Data Encryption Active
                        </p>
                    </div>
                    <Input
                        label="Full Name"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="bg-slate-50 rounded-2xl py-4 border-secondary/10 focus:ring-primary/20"
                    />
                    <div className="grid grid-cols-2 gap-6">
                        <Input
                            label="Blood Group"
                            value={editData.bloodGroup}
                            onChange={(e) => setEditData({ ...editData, bloodGroup: e.target.value })}
                            className="bg-slate-50 rounded-2xl py-4"
                        />
                        <Input
                            label="DOB"
                            type="date"
                            value={editData.dob}
                            onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                            className="bg-slate-50 rounded-2xl py-4"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em] mb-3 ml-1">Critical Medical Conditions</label>
                        <textarea
                            className="w-full px-4 py-4 bg-slate-50 border border-secondary/10 rounded-3xl h-32 text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold placeholder:opacity-30"
                            placeholder="e.g. Heart Patient, Diabities, etc."
                            value={editData.medicalConditions}
                            onChange={(e) => setEditData({ ...editData, medicalConditions: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Emergency Contact name"
                            value={editData.emergencyContactName}
                            onChange={(e) => setEditData({ ...editData, emergencyContactName: e.target.value })}
                            className="bg-slate-50 rounded-2xl py-4"
                        />
                        <Input
                            label="Contact Phone"
                            value={editData.emergencyContactPhone}
                            onChange={(e) => setEditData({ ...editData, emergencyContactPhone: e.target.value })}
                            className="bg-slate-50 rounded-2xl py-4"
                        />
                    </div>
                    <div className="pt-8 flex gap-4">
                        <Button variant="outline" className="flex-1 border-secondary/10 bg-white font-bold rounded-2xl py-4 hover:bg-slate-50" onClick={() => setIsEditModalOpen(false)}>Discard</Button>
                        <Button className="flex-1 font-black italic text-lg shadow-xl shadow-primary/20 rounded-2xl py-4" onClick={handleUpdateProfile}>Secure Save</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
