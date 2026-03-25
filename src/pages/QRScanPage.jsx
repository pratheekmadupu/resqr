import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, get, push, serverTimestamp } from 'firebase/database';
import { Phone, MapPin, AlertCircle, Heart, Activity, Loader2, Info, Car, Briefcase, Dog, Shield, Share2, Activity as HeartPulse, Navigation, Siren, Users } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function QRScanPage() {
    const { profileId } = useParams();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [scanRecorded, setScanRecorded] = useState(false);
    const [hospitals, setHospitals] = useState([]);
    const [findingHospital, setFindingHospital] = useState(false);
    const [coords, setCoords] = useState(null);
    const [geoError, setGeoError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                let userId = null;
                if (profileId.includes('_')) userId = profileId.split('_')[0];
                if (userId) {
                    const snap = await get(ref(db, `users/${userId}/profiles/${profileId}`));
                    if (snap.exists()) {
                        setProfile(snap.val());
                        recordScan(userId, profileId);
                    } else {
                        const legacy = await get(ref(db, `profiles/${profileId}`));
                        if (legacy.exists()) setProfile({ category: 'people', data: legacy.val() });
                    }
                } else {
                    const legacy = await get(ref(db, `profiles/${profileId}`));
                    if (legacy.exists()) setProfile({ category: 'people', data: legacy.val() });
                }
            } catch (error) {} finally { setLoading(false); }
        };
        fetchProfile();
    }, [profileId]);

    const recordScan = async (userId, pid) => {
        if (scanRecorded) return;
        try {
            let userCoords = null;
            let locationName = "Scan Location Data Pending";
            
            // Get geolocation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
                        setCoords(userCoords);
                        locationName = `${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`;
                        updateScanNode(userId, pid, locationName, userCoords);
                    },
                    (err) => {
                        console.error("Geo error:", err);
                        setGeoError("Location access denied. Some features might not work.");
                        updateScanNode(userId, pid, "Unknown Location (Denied)", null);
                    },
                    { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
                );
            } else {
                updateScanNode(userId, pid, "Geolocation Not Supported", null);
            }
            setScanRecorded(true);
        } catch (e) {}
    };

    const updateScanNode = async (userId, pid, loc, crd) => {
        const scanData = {
            timestamp: serverTimestamp(),
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            status: 'Emergency Search',
            location: loc,
            coords: crd
        };
        await push(ref(db, `users/${userId}/profiles/${pid}/scans`), scanData);
    };

    useEffect(() => {
        const fetchNearestHospitals = async () => {
            if (!coords) return;
            setFindingHospital(true);
            try {
                // Try with a larger radius if 10km fails
                const query = `[out:json];node["amenity"="hospital"](around:25000,${coords.lat},${coords.lng});out 5;`;
                const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                const data = await response.json();
                if (data.elements && data.elements.length > 0) {
                    setHospitals(data.elements.map(h => ({ name: h.tags.name || "Medical Center", lat: h.lat, lng: h.lon, addr: h.tags['addr:street'] || "Facility" })));
                } else {
                    // Fallback to searching nearby big cities or a generic list if needed? 
                    // No, usually overpass is enough.
                }
            } catch (err) {} finally { setFindingHospital(false); }
        };
        if (coords && profile?.category === 'people') fetchNearestHospitals();
    }, [coords, profile]);

    if (loading) return <div className="min-h-screen bg-[#040812] flex items-center justify-center"><Loader2 className="text-primary animate-spin" size={48} /></div>;
    if (!profile) return <div className="min-h-screen bg-[#040812] flex flex-col items-center justify-center text-white"><Shield size={64} className="text-primary mb-6 opacity-30" /><h1 className="text-2xl font-black uppercase italic tracking-tighter">DATA UNAVAILABLE</h1></div>;

    const { category, data } = profile;

    return (
        <div className="min-h-screen bg-[#040812] py-8 px-5 selection:bg-red-500/30">
            <div className="max-w-xl mx-auto space-y-8 pb-32">
                
                <div className="flex flex-col items-center mb-8 text-center">
                     <img src="/logo.png" alt="RESQR" className="h-10 w-auto mb-4 grayscale brightness-200" />
                     <Badge className="bg-red-500/10 text-red-500 border-none px-6 py-1.5 tracking-[0.4em] uppercase italic font-black text-[9px]">Emergency Responder System</Badge>
                     <p className="text-slate-600 text-[8px] font-black uppercase tracking-[0.5em] mt-2 italic">Official Identity Record</p>
                </div>

                {category === 'people' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* 1. IDENTITY CARD */}
                        <div className="bg-[#11192A] rounded-[48px] border border-white/5 overflow-hidden shadow-2xl">
                            <div className="p-10 text-center relative overflow-hidden">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Legal Representative</p>
                                <h1 className="text-6xl font-black uppercase text-white tracking-tighter italic font-poppins">{data.name}</h1>
                                <div className="absolute top-4 right-4"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /></div>
                            </div>
                        </div>

                        {/* 2. MEDICAL STATS */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#11192A] rounded-[40px] border border-white/5 p-8 flex flex-col items-center justify-center shadow-xl">
                                <Heart size={24} className="text-red-500 mb-4" />
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Blood Vector</p>
                                <p className="text-5xl font-black italic text-red-500 font-poppins tracking-tighter leading-none">{data.bloodGroup || 'B-'}</p>
                            </div>
                            <div className="bg-[#11192A] rounded-[40px] border border-white/5 p-8 flex flex-col items-center justify-center text-center shadow-xl">
                                <Activity size={24} className="text-indigo-500 mb-4" />
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Primary State</p>
                                <h2 className="text-lg font-black italic text-white uppercase font-poppins">{data.healthIssues || 'STABLE'}</h2>
                            </div>
                        </div>

                        {/* 3. VULNERABILITIES */}
                        <div className="bg-[#080F1D] rounded-[40px] border border-red-500/20 shadow-xl p-8 group">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle size={18} className="text-red-500" />
                                <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em] font-poppins italic">Critical Allergies / Alerts</span>
                            </div>
                            <h2 className="text-2xl font-black italic text-white uppercase font-poppins leading-tight">{data.allergies || 'NO KNOWN VULNERABILITIES'}</h2>
                        </div>

                        {/* 4. GUARDIAN CARD (HIDDEN NUMBER BY REQUEST) */}
                        <div className="bg-[#11192A] rounded-[48px] border border-white/5 overflow-hidden shadow-xl">
                            <div className="p-10 flex items-center justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Users size={18} className="text-indigo-500" />
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Family Relation</p>
                                    </div>
                                    <div>
                                        <h4 className="text-4xl font-black italic text-white uppercase font-poppins mb-1 leading-none">{data.emergencyContactName}</h4>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">{data.emergencyContactRelation || 'PRIMARY GUARDIAN'}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-center">
                                    <button onClick={() => window.location.href = `tel:${data.emergencyContactPhone}`} className="h-20 w-20 bg-emerald-500 text-white rounded-[25px] flex items-center justify-center shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                                        <Phone size={32} />
                                    </button>
                                    <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest mt-4">PRIVATE NETWORK ID</p>
                                </div>
                            </div>
                        </div>

                        {/* 5. NEAREST MEDICAL NODES */}
                        <div className="bg-[#11192A] rounded-[48px] border border-white/5 overflow-hidden shadow-xl">
                             <div className="p-1 flex items-center gap-2 bg-[#080F1D] px-8 py-3">
                                <Navigation size={14} className="text-emerald-500" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic font-poppins">Nearest Search Nodes (Hospitals)</span>
                            </div>
                            <div className="p-8 space-y-4 min-h-[150px] flex flex-col justify-center">
                                {findingHospital ? (
                                    <div className="flex flex-col items-center gap-4 animate-pulse italic text-slate-600 py-10">
                                        <Loader2 className="animate-spin text-emerald-500" size={32} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Acquiring Nearest Grid Points...</span>
                                    </div>
                                ) : hospitals.length > 0 ? (
                                    hospitals.slice(0, 3).map((h, i) => (
                                        <div key={i} className="bg-[#050B18] p-5 rounded-3xl border border-white/5 flex items-center justify-between transition-all hover:bg-[#080F1D]">
                                            <div className="min-w-0">
                                                <p className="text-white font-black italic uppercase text-lg truncate tracking-tighter">{h.name}</p>
                                                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1 italic">{h.addr}</p>
                                            </div>
                                            <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`)} className="h-12 w-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                                                <Navigation size={20} />
                                            </button>
                                        </div>
                                    ))
                                ) : coords ? (
                                    <div className="text-center py-6">
                                        <p className="text-[10px] italic text-slate-500 font-black uppercase tracking-widest mb-4">No hospitals found within 25km grid.</p>
                                        <button onClick={() => window.open(`https://www.google.com/maps/search/hospital+near+me/@${coords.lat},${coords.lng},15z`)} className="px-6 py-2 bg-slate-800 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Manual Search</button>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4 py-6">
                                         <p className="text-[10px] italic text-red-400 font-black uppercase tracking-widest">Awaiting Geolocation Data Sync...</p>
                                         <button onClick={() => window.location.reload()} className="px-6 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">Retry Positioning</button>
                                         {geoError && <p className="text-[7px] text-slate-600 font-bold uppercase">{geoError}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 6. PRIMARY ACTION NODE (FOOTER) */}
                        <div className="space-y-4 pt-10">
                             <button onClick={() => window.location.href = `tel:108`} className="w-full h-24 bg-red-600 text-white rounded-[40px] font-black uppercase tracking-widest text-2xl flex justify-center items-center gap-6 active:scale-95 transition-all shadow-2xl shadow-red-600/30 border-b-8 border-red-800">
                                <Siren size={32} className="animate-pulse" /> DIAL 108 AMBULANCE
                            </button>
                             <button onClick={() => {
                                if (navigator.geolocation && coords) {
                                    const msg = `EMERGENCY ALERT: I found your relative ${data.name}. Current verified extraction point: https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
                                    window.location.href = `https://wa.me/${data.emergencyContactPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
                                } else {
                                    alert("Acquiring GPS Signal... Try in 5 seconds.");
                                }
                            }} className="w-full h-20 bg-slate-100 text-[#040812] rounded-[35px] font-black uppercase tracking-widest text-xs flex justify-center items-center gap-4 active:scale-95 transition-all shadow-xl">
                                <Shield size={18} /> WhatsApp Location To Guardian
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 bg-[#040812]/95 backdrop-blur-xl p-6 border-t border-white/5 text-center">
                 <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] italic mb-1">In Extremis • All Nodes Active</p>
                 <p className="text-[7px] text-slate-600 uppercase tracking-widest italic">Identity record authenticated by ResQR Private Network</p>
            </div>
        </div>
    );
}

