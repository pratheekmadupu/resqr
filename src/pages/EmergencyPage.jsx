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
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-100">
            {/* Urgency Header - Clean Professional White */}
            <div className="bg-white border-b border-slate-200 p-6 text-center sticky top-0 z-40 shadow-sm">
                <div className="flex flex-col items-center justify-center gap-2">
                    <img
                        src={`${import.meta.env.BASE_URL}logo.png`}
                        alt="RESQR Medical Profile"
                        style={{ height: '48px', width: 'auto' }}
                    />
                    <div className="flex flex-col items-center">
                        <Badge className="px-4 py-1 font-bold bg-primary text-white border-none text-[10px] tracking-widest uppercase">
                            EMERGENCY MEDICAL PROFILE
                        </Badge>
                        <p className="font-semibold text-[8px] text-slate-400 mt-1 uppercase tracking-widest">Digital Identification Vault</p>
                    </div>
                </div>
            </div>

            <main className="p-4 sm:p-8 space-y-6 max-w-2xl mx-auto">
                {/* Name Block - Passport Style */}
                <section className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 p-3 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Identity Records</span>
                        <span className="text-primary">Secured</span>
                    </div>
                    <div className="p-10 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Legal Identity</span>
                        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight break-words font-poppins">
                            {user.name}
                        </h2>
                    </div>
                </section>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200 flex items-center justify-between relative overflow-hidden">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Heart size={32} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Blood Type</span>
                                <h3 className="text-5xl font-black text-primary leading-none font-poppins">{user.bloodGroup}</h3>
                            </div>
                        </div>
                        <div className="hidden sm:block opacity-5">
                            <Activity size={100} />
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-3xl shadow-xl flex flex-col items-start gap-4 text-white relative overflow-hidden">
                        <div className="flex items-center gap-3">
                            <Activity size={24} className="text-primary" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Diagnosis</span>
                        </div>
                        <p className="text-2xl font-bold uppercase tracking-tight break-words leading-tight">{user.conditions}</p>
                    </div>
                </div>

                {/* Info Blocks */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <AlertCircle size={22} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Critical Allergies / Alerts</h3>
                        </div>
                        <p className="text-xl font-bold text-red-600 uppercase p-4 bg-red-50 rounded-2xl border border-red-100">{user.allergies}</p>
                    </div>

                    {/* RE-ADDED FAMILY CONTACT SECTION */}
                    <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
                        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
                                <Phone size={22} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Emergency Family Contact</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Contact Name</span>
                                    <h4 className="text-2xl font-black text-slate-900 uppercase italic">{user.emergencyContact.name}</h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Relation</span>
                                    <Badge className="bg-blue-500/10 text-blue-700 border-none font-bold uppercase py-1">{user.emergencyContact.relation}</Badge>
                                </div>
                            </div>
                            <div className="pt-2">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Family Number</span>
                                <p className="text-4xl font-black text-slate-900 tracking-tighter font-poppins">{user.emergencyContact.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions - Fast Response */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <button
                        onClick={handleCall}
                        className="w-full bg-green-600 hover:bg-green-700 text-white p-8 rounded-3xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-lg shadow-green-600/20"
                    >
                        <Phone size={24} fill="currentColor" />
                        <span className="text-xl font-bold uppercase tracking-tight">Call Home</span>
                    </button>

                    <button
                        onClick={handleSendLocation}
                        className="w-full bg-primary hover:bg-primary-dark text-white p-8 rounded-3xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        <MapPin size={24} fill="currentColor" />
                        <span className="text-xl font-bold uppercase tracking-tight">Share GPS</span>
                    </button>
                </div>

                <footer className="text-center py-12 opacity-50">
                    <div className="flex items-center justify-center gap-4 mb-3">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR Logo" className="h-8 w-auto grayscale" />
                    </div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-500">Secured Identity Network • Universal Emergency Portal</p>
                </footer>
            </main>
        </div>
    );
}
