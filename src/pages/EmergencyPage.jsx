import { useState, useEffect } from 'react';
import { Phone, MapPin, AlertCircle, Heart, Activity, Info, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, get, push, serverTimestamp } from 'firebase/database';
import toast from 'react-hot-toast';

export default function EmergencyPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [scanRecorded, setScanRecorded] = useState(false);
    const [user, setUser] = useState({
        name: "LOADING...",
        bloodGroup: "--",
        allergies: "Loading...",
        conditions: "Loading...",
        emergencyContact: {
            name: "Loading...",
            relation: "--",
            phone: ""
        }
    });

    const recordScan = async () => {
        if (scanRecorded) return;
        try {
            const scanData = {
                timestamp: serverTimestamp(),
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                status: 'QR Scan',
                location: 'Emergency Scan'
            };

            // Try to get city/region if possible via a simple API or just log as 'Verified Scan'
            await push(ref(db, `profiles/${id}/scans`), scanData);
            setScanRecorded(true);
        } catch (e) {
            console.error("Scan recording failed", e);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const snapshot = await get(ref(db, `profiles/${id}`));
                if (snapshot.exists()) {
                    const decodedUser = snapshot.val();
                    setUser({
                        name: decodedUser.name.toUpperCase(),
                        bloodGroup: decodedUser.bloodGroup,
                        allergies: decodedUser.allergies || "None reported",
                        conditions: decodedUser.medicalConditions || "No chronic conditions reported",
                        emergencyContact: {
                            name: decodedUser.emergencyContactName,
                            relation: decodedUser.emergencyContactRelation,
                            phone: decodedUser.emergencyContactPhone
                        }
                    });
                    // Log the scan!
                    recordScan();
                } else {
                    toast.error("Profile not found");
                }
            } catch (error) {
                console.error("Failed to load emergency data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="text-primary animate-spin" size={48} />
            </div>
        );
    }

    const handleCall = () => {
        window.location.href = `tel:${user.emergencyContact.phone}`;
    };

    const handleSendLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const msg = encodeURIComponent(`Emergency! My location: https://www.google.com/maps?q=${latitude},${longitude}`);
                window.location.href = `https://wa.me/${user.emergencyContact.phone.replace(/\D/g, '')}?text=${msg}`;
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Urgency Header - Clean Light */}
            <div className="bg-white border-b border-slate-100 p-8 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                    <img
                        src={`${import.meta.env.BASE_URL}logo2.png`}
                        alt="RESQR Medical Profile"
                        style={{ height: '72px', width: 'auto' }}
                        className="drop-shadow-sm"
                    />
                    <div className="flex flex-col items-center">
                        <Badge variant="primary" className="px-6 py-1 font-black italic shadow-lg shadow-primary/10 mb-2">
                            EMERGENCY MEDICAL PROFILE
                        </Badge>
                        <p className="font-bold text-xs opacity-40 uppercase tracking-[0.4em]">Scan ID: #{id?.toUpperCase()}</p>
                    </div>
                </div>
            </div>

            <main className="p-4 sm:p-8 space-y-8 max-w-4xl mx-auto">
                {/* Name Block - Premium White text on dark */}
                <section className="text-center py-10 border-b-2 border-slate-900 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 pointer-events-none">
                        <Activity size={120} />
                    </div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-4">Patient Identity</span>
                    <h2 className="text-5xl sm:text-7xl font-black text-white uppercase leading-none tracking-tighter drop-shadow-sm break-words">
                        {user.name}
                    </h2>
                </section>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-primary/5 p-8 rounded-[40px] border border-primary/10 flex flex-col items-center justify-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Heart size={48} className="text-primary mb-4" />
                        <span className="text-xs font-black text-primary uppercase tracking-widest mb-1">Blood Registry</span>
                        <span className="text-8xl font-black text-primary drop-shadow-lg">{user.bloodGroup}</span>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 flex flex-col items-center justify-center text-center">
                        <Activity size={48} className="text-primary mb-4" />
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 text-center">Primary Medical Condition</span>
                        <span className="text-3xl font-black text-white uppercase italic tracking-tight break-words">{user.conditions}</span>
                    </div>
                </div>

                {/* Info Blocks */}
                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <AlertCircle size={64} />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-500 rounded-2xl text-white shadow-lg shadow-red-500/20">
                                <AlertCircle size={24} />
                            </div>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Crucial Allergies</span>
                        </div>
                        <p className="text-3xl font-black text-white uppercase tracking-tight italic">{user.allergies}</p>
                    </div>

                    <div className="bg-slate-950 p-8 rounded-[40px] text-white shadow-2xl relative group overflow-hidden">
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-3 bg-primary rounded-2xl text-white">
                                <Phone size={24} />
                            </div>
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">Emergency Contact Information</span>
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div>
                                <h4 className="text-xl font-black text-white uppercase italic">{user.emergencyContact.name}</h4>
                                <p className="text-primary font-bold uppercase text-xs tracking-widest">{user.emergencyContact.relation}</p>
                            </div>
                            <p className="text-4xl font-black text-white tracking-widest">{user.emergencyContact.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Actions - Massive Buttons */}
                <div className="grid grid-cols-1 gap-6 pt-10">
                    <button
                        onClick={handleCall}
                        className="w-full bg-green-500 hover:bg-green-600 text-white p-10 rounded-[40px] flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-green-500/20 group"
                    >
                        <Phone size={64} fill="currentColor" className="group-hover:translate-y-[-4px] transition-transform" />
                        <div className="text-center">
                            <span className="text-4xl font-black uppercase tracking-tighter italic block">Initiate Emergency Call</span>
                            <span className="text-lg font-bold opacity-80 uppercase tracking-widest">Contact Family Instantly</span>
                        </div>
                    </button>

                    <button
                        onClick={handleSendLocation}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white p-10 rounded-[40px] flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-slate-900/10 border-b-8 border-slate-950 group"
                    >
                        <MapPin size={64} fill="currentColor" className="group-hover:translate-y-[-4px] transition-transform" />
                        <div className="text-center">
                            <span className="text-4xl font-black uppercase tracking-tighter italic block">Broadcast GPS Location</span>
                            <span className="text-lg font-bold opacity-80 uppercase tracking-widest">Notify via WhatsApp / SMS</span>
                        </div>
                    </button>
                </div>

                <footer className="text-center py-16 opacity-30">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <img src={`${import.meta.env.BASE_URL}logo2.png`} alt="RESQR Logo" className="h-12 w-auto grayscale" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Advanced Identity Guardian • Universal Access</p>
                </footer>
            </main>
        </div>
    );
}
