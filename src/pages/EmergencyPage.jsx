import { useState, useEffect } from 'react';
import { Phone, MapPin, AlertCircle, Heart, Activity, Info, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import toast from 'react-hot-toast';

export default function EmergencyPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
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
            {/* Urgency Header */}
            <div className="bg-primary p-6 text-white text-center animate-pulse-slow">
                <div className="flex flex-col items-center justify-center gap-2 mb-2">
                    <img src="/logo.png" alt="RESQR Logo" style={{ height: '48px', width: 'auto' }} className="mb-2" />
                    <p className="font-bold text-lg opacity-90 uppercase tracking-widest text-white">Emergency QR</p>
                </div>
            </div>

            <main className="p-4 sm:p-8 space-y-6">
                {/* Name Block - Massive */}
                <section className="text-center py-6 border-b-4 border-slate-900">
                    <span className="text-xs font-black text-white uppercase tracking-widest block mb-2">Patient name</span>
                    <h2 className="text-5xl sm:text-7xl font-black text-white uppercase leading-none break-words">
                        {user.name}
                    </h2>
                </section>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-950/20 p-8 rounded-3xl border-2 border-primary/20 flex flex-col items-center justify-center">
                        <Heart size={48} className="text-primary mb-4" />
                        <span className="text-sm font-black text-primary uppercase tracking-widest">Blood group</span>
                        <span className="text-7xl font-black text-primary">{user.bloodGroup}</span>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
                        <Activity size={48} className="text-primary mb-4" />
                        <span className="text-sm font-black text-white uppercase tracking-widest">Primary condition</span>
                        <span className="text-3xl font-black text-white mt-2 break-words">{user.conditions}</span>
                    </div>
                </div>

                {/* Info Blocks */}
                <div className="space-y-4">
                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Info size={24} className="text-primary" />
                            <span className="text-sm font-black text-white uppercase tracking-widest">Allergies</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{user.allergies}</p>
                    </div>
                </div>

                {/* Actions - Massive Buttons */}
                <div className="grid grid-cols-1 gap-4 pt-6">
                    <button
                        onClick={handleCall}
                        className="w-full bg-green-600 hover:bg-green-700 text-white p-8 rounded-3xl flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl shadow-green-950/20"
                    >
                        <Phone size={48} fill="currentColor" />
                        <span className="text-3xl font-black uppercase tracking-tighter">Call Family</span>
                        <span className="text-lg font-medium opacity-80">{user.emergencyContact.name} ({user.emergencyContact.relation})</span>
                    </button>

                    <button
                        onClick={handleSendLocation}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white p-8 rounded-3xl flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 border-b-8 border-slate-800 shadow-xl"
                    >
                        <MapPin size={48} fill="currentColor" />
                        <span className="text-3xl font-black uppercase tracking-tighter">Send My location</span>
                        <span className="text-lg font-medium opacity-80">Via WhatsApp / SMS</span>
                    </button>
                </div>

                <footer className="text-center py-10 opacity-30">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <img src="/logo.png" alt="RESQR Logo" className="h-8 w-auto" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white">Powered by Smart ID Technology</p>
                </footer>
            </main>
        </div>
    );
}
