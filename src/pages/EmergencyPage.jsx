import { useState, useEffect } from 'react';
import { Phone, MapPin, AlertCircle, Heart, Activity, Info, Loader2, Lock, Navigation, Building2 } from 'lucide-react';
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
    const [coords, setCoords] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [findingHospital, setFindingHospital] = useState(false);
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
                setCoords(coords);
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
        const fetchNearestHospitals = async () => {
            if (!coords) return;
            setFindingHospital(true);
            try {
                // Using Overpass API to find nearest hospitals
                // node["amenity"="hospital"](around:10000,lat,lng); -> 10km radius
                const query = `[out:json];node["amenity"="hospital"](around:15000,${coords.lat},${coords.lng});out 5;`;
                const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                const data = await response.json();

                if (data.elements && data.elements.length > 0) {
                    const hospitalList = data.elements.map(h => ({
                        name: h.tags.name || "Unnamed Medical Center",
                        lat: h.lat,
                        lng: h.lon,
                        addr: h.tags['addr:street'] || h.tags['addr:full'] || "Secondary Facility"
                    }));
                    setHospitals(hospitalList);
                } else {
                    setHospitals([{
                        name: "Emergency Medical Facility",
                        searchQuery: "hospital",
                        dist: "Nearby"
                    }]);
                }
            } catch (err) {
                console.error("Failed to fetch nearest hospitals", err);
            } finally {
                setFindingHospital(false);
            }
        };

        if (coords && hospitals.length === 0) {
            fetchNearestHospitals();
        }
    }, [coords, hospitals.length]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const snapshot = await get(ref(db, `profiles/${id}`));
                if (snapshot.exists()) {
                    const decodedUser = snapshot.val();
                    setUser({
                        name: decodedUser.name.toUpperCase(),
                        bloodGroup: decodedUser.bloodGroup,
                        payment_status: decodedUser.payment_status,
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

    if (user.payment_status === 'pending' && user.name !== "DEMO") {
        return (
            <div className="min-h-screen bg-medical-bg text-white flex items-center justify-center p-8 font-manrope">
                <div className="max-w-md w-full bg-medical-card rounded-[40px] p-12 text-center border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                    <div className="w-24 h-24 bg-primary/20 rounded-[30px] flex items-center justify-center mx-auto mb-10 text-primary border border-primary/20 shadow-2xl animate-pulse">
                        <Lock size={40} />
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-6 font-poppins text-white">Profile Pending Activation</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-10 italic">This medical profile has not been activated yet. Please ensure the identity owner has completed the secure activation process.</p>
                    <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-tight">
                        <span>Secured by Guardian Network</span>
                    </div>
                </div>
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
        <div className="min-h-screen bg-medical-bg text-white font-manrope selection:bg-primary/30">
            {/* Urgency Header - Dark Professional Hub */}
            <div className="bg-slate-950/80 backdrop-blur-md border-b border-white/5 p-6 text-center sticky top-0 z-40 shadow-2xl">
                <div className="flex flex-col items-center justify-center gap-3">
                    <img
                        src={`${import.meta.env.BASE_URL}logo.png`}
                        alt="RESQR Medical Profile"
                        style={{ height: '48px', width: 'auto' }}
                    />
                    <div className="flex flex-col items-center">
                        <Badge className="px-5 py-1 font-black italic bg-primary/20 text-primary border-none text-[10px] tracking-widest uppercase">
                            ENCRYPTED MEDICAL PROFILE
                        </Badge>
                        <p className="font-bold text-[8px] text-slate-500 mt-1 uppercase tracking-widest italic">Secure Digital Identification Vault</p>
                    </div>
                </div>
            </div>

            <main className="p-4 sm:p-8 space-y-8 max-w-2xl mx-auto">
                {/* Name Block - Tactical ID Style */}
                <section className="bg-medical-card rounded-[40px] shadow-2xl border border-white/5 overflow-hidden relative">
                    <div className="bg-slate-950 p-4 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">
                        <span>Unit Identification</span>
                        <span className="text-emerald-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Verified
                        </span>
                    </div>
                    <div className="p-12 text-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-3 italic">Identity Owner</span>
                        <h2 className="text-4xl sm:text-6xl font-black text-white uppercase italic tracking-tighter break-words font-poppins leading-none">
                            {user.name}
                        </h2>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                </section>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 gap-8">
                    <div className="bg-medical-card p-10 rounded-[40px] shadow-2xl border border-white/5 flex items-center justify-between relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/20 transition-transform group-hover:scale-105">
                                <Heart size={36} fill="white" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-2 italic">Blood Type</span>
                                <h3 className="text-6xl font-black text-white leading-none font-poppins tracking-tighter italic">{user.bloodGroup}</h3>
                            </div>
                        </div>
                        <div className="hidden sm:block opacity-[0.03] absolute right-0 bottom-0 -mb-10 -mr-10">
                            <Activity size={240} />
                        </div>
                    </div>

                    <div className="bg-slate-950 p-10 rounded-[40px] shadow-2xl border border-white/5 flex flex-col items-start gap-6 text-white relative overflow-hidden group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/20 rounded-2xl text-primary border border-primary/20">
                                <Activity size={24} />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Clinical Diagnosis</span>
                        </div>
                        <p className="text-3xl font-black italic uppercase tracking-tight break-words leading-none text-white">{user.conditions}</p>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                    </div>
                </div>

                {/* Info Blocks */}
                <div className="space-y-8">
                    <div className="bg-medical-card p-10 rounded-[40px] shadow-2xl border border-white/5 relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-primary/20 rounded-2xl text-primary border border-primary/20 shadow-lg shadow-primary/20">
                                <AlertCircle size={22} />
                            </div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">Critical Alerts</h3>
                        </div>
                        <p className="text-2xl font-black text-primary uppercase italic p-8 bg-slate-950/50 rounded-3xl border border-primary/20 shadow-inner">
                            {user.allergies}
                        </p>
                    </div>

                    {/* NEAREST HOSPITAL SECTION */}
                    <div className="bg-medical-card p-10 rounded-[40px] shadow-2xl border border-white/5 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/20">
                                <Building2 size={22} />
                            </div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">Nearest Emergency Facility</h3>
                        </div>

                        {findingHospital ? (
                            <div className="flex items-center gap-4 p-6 bg-slate-950/50 rounded-3xl border border-white/5 animate-pulse">
                                <Loader2 className="animate-spin text-slate-500" size={20} />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500 italic">Scanning Local Perimeter...</span>
                            </div>
                        ) : hospitals.length > 0 ? (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {hospitals.map((hospital, idx) => (
                                    <div key={idx} className="p-6 bg-slate-950 border border-white/5 rounded-3xl shadow-inner hover:border-emerald-500/30 transition-all group/h">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] block mb-1 italic">Facility Node {idx + 1}</span>
                                                <h4 className="text-lg font-black text-white uppercase italic tracking-tight leading-none group-hover/h:text-emerald-400 transition-colors">
                                                    {hospital.name}
                                                </h4>
                                                {hospital.addr && <p className="text-[9px] text-slate-500 mt-2 uppercase font-bold italic tracking-wider">{hospital.addr}</p>}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const url = hospital.lat
                                                        ? `https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${hospital.lat},${hospital.lng}&travelmode=driving`
                                                        : `https://www.google.com/maps/search/hospital/@${coords.lat},${coords.lng}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white p-3 rounded-xl transition-all active:scale-90"
                                            >
                                                <Navigation size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 bg-slate-950 border border-white/5 rounded-3xl text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-4">Initial Position Lock Required</p>
                                <button
                                    onClick={recordScan}
                                    className="text-xs font-black text-primary uppercase italic tracking-widest hover:underline"
                                >
                                    Force GPS Initialization
                                </button>
                            </div>
                        )}
                        <div className="absolute -right-8 -bottom-8 opacity-[0.02] pointer-events-none">
                            <Building2 size={200} />
                        </div>
                    </div>

                    {/* RE-ADDED FAMILY CONTACT SECTION */}
                    <div className="bg-medical-card p-10 rounded-[40px] shadow-2xl border border-white/5">
                        <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-8">
                            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-500/20">
                                <Phone size={22} />
                            </div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Emergency Liaison</h3>
                        </div>
                        <div className="space-y-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-3 italic">Contact Name</span>
                                    <h4 className="text-3xl font-black text-white uppercase italic tracking-tight">{user.emergencyContact.name}</h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-3 italic">Relation</span>
                                    <Badge className="bg-blue-500/10 text-blue-400 border-none font-black uppercase py-2 px-6 italic tracking-widest">{user.emergencyContact.relation}</Badge>
                                </div>
                            </div>
                            <div className="pt-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-3 italic">Direct Secure Line</span>
                                <p className="text-2xl font-black text-white/20 tracking-[0.2em] font-poppins italic uppercase">Encrypted for Privacy</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions - Fast Response */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                    <button
                        onClick={handleCall}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-10 rounded-[35px] flex items-center justify-center gap-5 transition-all active:scale-95 shadow-2xl shadow-emerald-900/40 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Phone size={28} fill="white" className="relative z-10" />
                        <span className="text-2xl font-black uppercase italic tracking-tighter relative z-10">Call {user.emergencyContact.relation || 'Guardian'}</span>
                    </button>

                    <button
                        onClick={handleSendLocation}
                        className="w-full bg-primary hover:bg-primary-dark text-white p-10 rounded-[35px] flex items-center justify-center gap-5 transition-all active:scale-95 shadow-2xl shadow-primary/40 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <MapPin size={28} fill="white" className="relative z-10" />
                        <span className="text-2xl font-black uppercase italic tracking-tighter relative z-10">Send GPS to {user.emergencyContact.relation || 'Guardian'}</span>
                    </button>
                </div>

                <footer className="text-center py-20 opacity-30">
                    <div className="flex items-center justify-center gap-4 mb-5">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RESQR Logo" className="h-10 w-auto grayscale brightness-200" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500 italic">Global Identity Protection Network • Encrypted Portal</p>
                </footer>
            </main>
        </div>
    );
}
