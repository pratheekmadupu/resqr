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
            let locationName = 'Emergency Scan';
            let coords = null;

            // Try to get precise location
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                });
                coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                locationName = `Precise Location: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
            } catch (err) {
                console.log("Could not get precise location, logging general scan.");
            }

            const scanData = {
                timestamp: serverTimestamp(),
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                status: 'QR Scan',
                location: locationName,
                coords: coords
            };

            await push(ref(db, `profiles/${id}/scans`), scanData);
            setScanRecorded(true);

            if (coords) {
                toast.success('Your location has been logged for emergency contacts.', {
                    icon: '📍',
                    duration: 5000
                });
            }
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
        <div className="min-h-screen bg-medical-bg text-secondary font-manrope">
            {/* Urgency Header - Clean Light */}
            <div className="bg-white border-b border-secondary/5 p-8 text-center sticky top-0 z-40 backdrop-blur-md bg-white/80">
                <div className="flex flex-col items-center justify-center gap-4">
                    <img
                        src={`${import.meta.env.BASE_URL}logo.png`}
                        alt="RESQR Medical Profile"
                        style={{ height: '60px', width: 'auto' }}
                        className="drop-shadow-sm"
                    />
                    <div className="flex flex-col items-center">
                        <Badge className="px-6 py-1 font-black shadow-lg shadow-primary/10 mb-2 bg-primary text-white border-none">
                            EMERGENCY MEDICAL PROFILE
                        </Badge>
                        <p className="font-bold text-[10px] text-secondary/40 uppercase tracking-[0.4em]">Scan ID: #{id?.toUpperCase()}</p>
                    </div>
                </div>
            </div>

            <main className="p-4 sm:p-8 space-y-8 max-w-4xl mx-auto">
                {/* Name Block */}
                <section className="text-center py-12 bg-white rounded-[40px] shadow-xl shadow-secondary/5 border border-secondary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 pointer-events-none text-primary">
                        <Activity size={120} />
                    </div>
                    <span className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em] block mb-4">Patient Identity</span>
                    <h2 className="text-5xl sm:text-7xl font-black text-secondary uppercase leading-tight tracking-tighter break-words px-6 font-poppins">
                        {user.name}
                    </h2>
                </section>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-primary/5 border border-primary/10 flex flex-col items-center justify-center relative group overflow-hidden">
                        <Heart size={48} className="text-primary mb-6 animate-pulse" />
                        <span className="text-xs font-black text-primary/60 uppercase tracking-widest mb-2">Blood Group</span>
                        <span className="text-9xl font-black text-primary leading-none">{user.bloodGroup}</span>
                    </div>

                    <div className="bg-secondary p-10 rounded-[40px] shadow-xl shadow-secondary/20 flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                        <Activity size={48} className="text-primary mb-6" />
                        <span className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">Primary Medical Condition</span>
                        <span className="text-3xl font-black uppercase italic tracking-tight break-words leading-tight">{user.conditions}</span>
                    </div>
                </div>

                {/* Info Blocks */}
                <div className="grid grid-cols-1 gap-8">
                    <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-secondary/5 border border-secondary/5 relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                                <AlertCircle size={28} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em] block">Crucial Allergies</span>
                                <h3 className="text-2xl font-black text-secondary uppercase tracking-tight italic">Medical Alert</h3>
                            </div>
                        </div>
                        <p className="text-3xl font-black text-primary uppercase tracking-tight italic bg-primary/5 p-6 rounded-3xl border border-primary/10">{user.allergies}</p>
                    </div>

                    <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-secondary/5 border border-secondary/5 relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-8 border-b border-secondary/5 pb-6">
                            <div className="p-4 bg-secondary rounded-2xl text-white shadow-lg">
                                <Phone size={28} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em] block">Emergency Contact</span>
                                <h3 className="text-2xl font-black text-secondary uppercase tracking-tight">Family Representative</h3>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div>
                                <h4 className="text-3xl font-black text-secondary uppercase italic leading-tight">{user.emergencyContact.name}</h4>
                                <Badge className="bg-secondary/10 text-secondary border-none mt-2 px-4 py-1 font-bold">{user.emergencyContact.relation}</Badge>
                            </div>
                            <p className="text-4xl font-black text-secondary tracking-tighter font-poppins">{user.emergencyContact.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Actions - Massive Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                    <button
                        onClick={handleCall}
                        className="w-full bg-green-500 hover:bg-green-600 text-white p-10 rounded-[40px] flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-green-500/20 group"
                    >
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-2">
                            <Phone size={40} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                        </div>
                        <div className="text-center">
                            <span className="text-3xl font-black uppercase tracking-tighter italic block">Call Family</span>
                            <span className="text-xs font-bold opacity-80 uppercase tracking-[0.2em]">Contact Instantly</span>
                        </div>
                    </button>

                    <button
                        onClick={handleSendLocation}
                        className="w-full bg-primary hover:bg-primary-dark text-white p-10 rounded-[40px] flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/20 group"
                    >
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-2">
                            <MapPin size={40} fill="currentColor" className="group-hover:translate-y-[-4px] transition-transform" />
                        </div>
                        <div className="text-center">
                            <span className="text-3xl font-black uppercase tracking-tighter italic block">Share Location</span>
                            <span className="text-xs font-bold opacity-80 uppercase tracking-[0.2em]">Send GPS via WhatsApp</span>
                        </div>
                    </button>
                </div>

                <footer className="text-center py-20 opacity-30">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR Logo" className="h-10 w-auto" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">Advanced Identity Guardian • Universal Access</p>
                </footer>
            </main>
        </div>
    );
}
