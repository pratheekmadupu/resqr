import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, User, QrCode, Settings, Bell, ChevronRight, Edit3, ExternalLink, Download, Clock, Loader2, Shield } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { QRCodeCanvas } from 'qrcode.react';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import PromotedAd from '../components/PromotedAd';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const slug = localStorage.getItem('resqr_active_slug');
            if (!slug) {
                setLoading(false);
                return;
            }

            try {
                const snapshot = await get(ref(db, `profiles/${slug}`));
                if (snapshot.exists()) {
                    setProfile(snapshot.val());
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

    const userDisplayName = profile?.name || 'User';
    const userBloodGroup = profile?.bloodGroup || '--';
    const userContact = profile?.emergencyContactName || '--';

    const stats = [
        { label: 'Total Scans', value: '14', icon: <QrCode size={20} />, color: 'bg-blue-600' },
        { label: 'Health Status', value: profile ? 'Verified' : 'Incomplete', icon: <User size={20} />, color: 'bg-green-600' },
        { label: 'Safety Index', value: profile ? 'High' : 'Low', icon: <Bell size={20} />, color: 'bg-primary' },
    ];

    const recentScans = [
        { location: 'Bengaluru, KA', time: '2 hours ago', status: 'Test Scan' },
        { location: 'Hyderabad, TS', time: 'Yesterday', status: 'Public Scan' },
        { location: 'Unknown', time: '3 days ago', status: 'System Check' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 py-10 px-4 text-white">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Welcome back, {userDisplayName.split(' ')[0]}</h1>
                        <p className="text-white opacity-60 font-medium">Your emergency profile is {profile ? 'active and protecting you' : 'incomplete'}.</p>
                    </div>
                    <div className="flex gap-3">
                        {profile && (
                            <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900 font-bold group">
                                <Download size={18} className="group-hover:translate-y-0.5 transition-transform" /> Download Tag
                            </Button>
                        )}
                        <Button className="font-black italic shadow-lg shadow-primary/20" size="sm" onClick={() => profile ? setIsEditModalOpen(true) : window.location.href = '/create-profile'}>
                            {profile ? <Edit3 size={18} /> : <QrCode size={18} />} {profile ? 'Edit Profile' : 'Create Profile'}
                        </Button>
                    </div>
                </header>

                {!profile ? (
                    <Card className="p-16 text-center border-primary/20 bg-slate-900 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                            <QrCode size={120} />
                        </div>
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary border border-primary/20">
                            <QrCode size={48} />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4 italic uppercase tracking-tighter">Complete Your Setup</h2>
                        <p className="text-white opacity-60 mb-10 max-w-md mx-auto text-lg leading-relaxed">
                            You haven't created your emergency profile yet. Without a profile, your RESQR tag won't show any information to first responders.
                        </p>
                        <Button size="lg" className="px-12 font-black italic scale-110" onClick={() => window.location.href = '/create-profile'}>
                            Create My Profile Now
                        </Button>
                    </Card>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stats.map((stat, i) => (
                                <Card key={i} className="flex items-center gap-5 p-6 bg-slate-900 border-slate-800 hover:border-primary/30 transition-all group">
                                    <div className={`${stat.color} p-4 rounded-2xl text-white shadow-xl shadow-black/20 group-hover:scale-110 transition-transform`}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white opacity-40 uppercase tracking-widest">{stat.label}</p>
                                        <p className="text-3xl font-black text-white italic">{stat.value}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Profile Info */}
                            <div className="lg:col-span-2 space-y-8">
                                <Card className="bg-slate-900 border-slate-800 p-8">
                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
                                        <div>
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Emergency Passport</h3>
                                            <p className="text-xs font-bold text-white opacity-40 uppercase tracking-widest mt-1">Live Responder Data</p>
                                        </div>
                                        <Shield className="text-primary opacity-20" size={32} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div>
                                                <span className="text-[10px] font-black text-white opacity-40 uppercase tracking-[0.2em]">Blood Group</span>
                                                <p className="text-4xl font-black text-primary italic leading-none mt-1">{userBloodGroup}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-white opacity-40 uppercase tracking-[0.2em]">Primary Conditions</span>
                                                <p className="font-bold text-white italic text-lg mt-1">{profile?.medicalConditions || 'No conditions listed'}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-white opacity-40 uppercase tracking-[0.2em]">Allergies</span>
                                                <p className="font-bold text-white italic text-lg mt-1">{profile?.allergies || 'No allergies listed'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <span className="text-[10px] font-black text-white opacity-40 uppercase tracking-[0.2em]">Primary Contact</span>
                                                <p className="font-black text-white text-xl uppercase italic mt-1">{userContact}</p>
                                                <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{profile?.emergencyContactRelation || '--'}</p>
                                                <p className="text-2xl font-black text-white mt-1 opacity-80">{profile?.emergencyContactPhone || '--'}</p>
                                            </div>
                                            <div className="pt-2">
                                                <Badge variant="success" className="px-4 py-1 font-black italic shadow-lg shadow-green-500/10">VERIFIED CONTACT</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-10 pt-6 border-t border-slate-800">
                                        <Button variant="ghost" className="w-full text-primary hover:bg-primary/5 italic font-black text-lg gap-2" onClick={() => setIsEditModalOpen(true)}>
                                            UPDATE HEALTH RECORDS <ChevronRight size={18} />
                                        </Button>
                                    </div>
                                </Card>

                                <Card className="bg-slate-900 border-slate-800 p-8">
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6">Recent Scan History</h2>
                                    <div className="space-y-4">
                                        {recentScans.map((scan, i) => (
                                            <div key={i} className="flex items-center justify-between p-5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                                                        <Clock size={16} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-white uppercase tracking-tight">{scan.location}</p>
                                                        <p className="text-[10px] font-black text-white opacity-30 uppercase tracking-widest">{scan.time}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={scan.status === 'Test Scan' ? 'gray' : 'primary'} className="font-black">{scan.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                <PromotedAd />
                            </div>

                            {/* QR Preview Panel */}
                            <div className="space-y-6">
                                <Card className="text-center overflow-hidden bg-slate-900 border-slate-800 p-8">
                                    <div className="bg-primary p-4 -mx-8 -mt-8 mb-8">
                                        <h3 className="text-white font-black tracking-[0.3em] uppercase text-xs">Live Identity Tag</h3>
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-white p-5 rounded-3xl border-4 border-slate-800 inline-block mb-8 shadow-2xl relative group"
                                    >
                                        <QRCodeCanvas
                                            value={getQRValue()}
                                            size={180}
                                            level="H"
                                            includeMargin={true}
                                        />
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none flex items-center justify-center">
                                            <ExternalLink size={32} className="text-white" />
                                        </div>
                                    </motion.div>
                                    <p className="text-xs font-bold text-white opacity-40 mb-8 px-4 uppercase tracking-widest leading-relaxed">
                                        This QR links directly to your public emergency profile.
                                    </p>
                                    <div className="space-y-3">
                                        <Button variant="secondary" className="w-full border-slate-800 bg-slate-950 hover:bg-slate-900 font-black italic shadow-xl text-lg py-6" onClick={() => window.open(getQRValue(), '_blank')}>
                                            PREVIEW PAGE <ExternalLink size={20} />
                                        </Button>
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <Button variant="outline" size="sm" className="w-full text-[10px] font-black border-slate-800 bg-slate-900 tracking-widest">PNG</Button>
                                            <Button variant="outline" size="sm" className="w-full text-[10px] font-black border-slate-800 bg-slate-900 tracking-widest">PDF</Button>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="bg-primary/5 border-primary/20 p-6 relative overflow-hidden group">
                                    <div className="absolute -bottom-4 -right-4 text-primary opacity-5 group-hover:scale-150 transition-transform duration-700">
                                        <Bell size={100} />
                                    </div>
                                    <h4 className="font-black text-primary mb-3 flex items-center gap-2 uppercase italic tracking-widest text-sm">
                                        <Bell size={18} /> Safety Tip
                                    </h4>
                                    <p className="text-sm text-white opacity-70 leading-relaxed font-bold italic">
                                        Add your RESQR QR to your phone's lock screen for even faster access by paramedics.
                                    </p>
                                </Card>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Health Passport"
            >
                <div className="space-y-6 p-4">
                    <Input label="Full Name" defaultValue={profile?.name || ""} className="bg-slate-950" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Blood Group" defaultValue={profile?.bloodGroup || ""} className="bg-slate-950" />
                        <Input label="DOB" type="date" defaultValue={profile?.dob || ""} className="bg-slate-950" />
                    </div>
                    <div className="w-full">
                        <label className="block text-xs font-black text-white opacity-40 uppercase tracking-[0.2em] mb-2">Medical Conditions</label>
                        <textarea className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl h-32 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold" defaultValue={profile?.medicalConditions || ""} />
                    </div>
                    <div className="pt-6 flex gap-4">
                        <Button variant="outline" className="flex-1 border-slate-800 bg-slate-900 font-bold" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1 font-black italic text-lg" onClick={() => {
                            toast.success('Passport updated!');
                            setIsEditModalOpen(false);
                        }}>Save Changes</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
