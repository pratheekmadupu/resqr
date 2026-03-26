import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, get, push, serverTimestamp } from 'firebase/database';
import { Phone, MapPin, AlertCircle, Heart, Activity, Loader2, Info, Car, Briefcase, Dog, Shield, Share2, Activity as HeartPulse, Navigation, Siren, Users, ChevronRight } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function QRScanPage() {
    const { profileId, username } = useParams();
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
                let pid = profileId;
                let uid = null;

                if (username) {
                    const registrySnap = await get(ref(db, `usernames/${username.toLowerCase()}`));
                    if (registrySnap.exists()) {
                        const path = registrySnap.val(); // e.g., "userId/profileId"
                        uid = path.split('/')[0];
                        pid = path.split('/')[1];
                    } else {
                        // try searching legacy profiles if username is used as ID
                         const legacy = await get(ref(db, `profiles/${username}`));
                         if (legacy.exists()) { setProfile({ category: 'people', data: legacy.val() }); setLoading(false); return; }
                    }
                }

                if (!uid && pid) {
                    if (pid.includes('_')) uid = pid.split('_')[0];
                }

                if (uid && pid) {
                    const snap = await get(ref(db, `users/${uid}/profiles/${pid}`));
                    if (snap.exists()) {
                        setProfile(snap.val());
                        recordScan(uid, pid);
                    } else {
                        const legacy = await get(ref(db, `profiles/${pid}`));
                        if (legacy.exists()) setProfile({ category: 'people', data: legacy.val() });
                    }
                } else if (pid) {
                    const legacy = await get(ref(db, `profiles/${pid}`));
                    if (legacy.exists()) setProfile({ category: 'people', data: legacy.val() });
                }
            } catch (error) {} finally { setLoading(false); }
        };
        fetchProfile();
    }, [profileId, username]);

    const recordScan = async (userId, pid) => {
        if (scanRecorded) return;
        try {
            let userCoords = null;
            let locationName = "Scan Location Data Pending";
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
                        setCoords(userCoords);
                        locationName = `${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`;
                        updateScanNode(userId, pid, locationName, userCoords);
                    },
                    (err) => {
                        setGeoError("Location access denied.");
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
                const query = `[out:json];node["amenity"="hospital"](around:25000,${coords.lat},${coords.lng});out 5;`;
                const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                const data = await response.json();
                if (data.elements && data.elements.length > 0) {
                    setHospitals(data.elements.map(h => ({ name: h.tags.name || "Medical Center", lat: h.lat, lng: h.lon, addr: h.tags['addr:street'] || "Facility" })));
                }
            } catch (err) {} finally { setFindingHospital(false); }
        };
        if (coords && profile?.category === 'people') fetchNearestHospitals();
    }, [coords, profile]);

    if (loading) return <div className="min-h-screen bg-[#040812] flex items-center justify-center"><Loader2 className="text-primary animate-spin" size={48} /></div>;
    if (!profile) return <div className="min-h-screen bg-[#040812] flex flex-col items-center justify-center text-white p-10 text-center"><Shield size={64} className="text-primary mb-6 opacity-30" /><h1 className="text-2xl font-black uppercase italic tracking-tighter">DATA UNAVAILABLE</h1><p className="text-slate-500 text-[9px] uppercase tracking-widest mt-2 max-w-xs">If you just registered, please allow a few moments for data synchronization across the network.</p></div>;

    const { category, data } = profile;

    return (
        <div className="min-h-screen bg-[#040812] py-8 px-5 selection:bg-red-500/30">
            <div className="max-w-xl mx-auto space-y-8 pb-32">
                
                <div className="flex flex-col items-center mb-8 text-center animate-in fade-in duration-700">
                     <img src="/logo.png" alt="RESQR" className="h-10 w-auto mb-4" />
                     <Badge className="bg-red-500/10 text-red-500 border-none px-4 md:px-6 py-1.5 tracking-[0.2em] md:tracking-[0.4em] uppercase italic font-black text-[8px] md:text-[9px]">Emergency Responder System</Badge>
                     <p className="text-slate-700 text-[8px] font-black uppercase tracking-[0.5em] mt-2 italic">Official Identity Record</p>
                </div>

                {category === 'people' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-[#11192A] rounded-[48px] border border-white/5 overflow-hidden shadow-2xl">
                            <div className="p-4 md:p-10 text-center relative overflow-hidden flex flex-col justify-center items-center min-h-[140px] md:min-h-[160px] w-full">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 font-poppins">Legal Representative</p>
                                <h1 className="text-[min(8.5vw,3.75rem)] sm:text-5xl md:text-6xl font-black uppercase text-white tracking-tighter italic font-poppins break-words leading-none w-full px-1">{data.name}</h1>
                                <div className="absolute top-4 right-4"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#11192A] rounded-[40px] border border-white/5 p-5 md:p-8 flex flex-col items-center justify-center shadow-xl">
                                <Heart size={24} className="text-red-500 mb-4" />
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 font-poppins">Blood Vector</p>
                                <p className="text-3xl sm:text-5xl font-black italic text-red-500 font-poppins tracking-tighter leading-none">{data.bloodGroup || 'B-'}</p>
                            </div>
                            <div className="bg-[#11192A] rounded-[40px] border border-white/5 p-5 md:p-8 flex flex-col items-center justify-center text-center shadow-xl">
                                <Activity size={24} className="text-indigo-500 mb-4" />
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 font-poppins">Primary State</p>
                                <h2 className="text-sm sm:text-lg font-black italic text-white uppercase font-poppins line-clamp-2 md:line-clamp-1 max-w-full break-words">{data.healthIssues || 'STABLE'}</h2>
                            </div>
                        </div>

                        <div className="bg-[#080F1D] rounded-[40px] border border-red-500/20 shadow-xl p-6 md:p-8 group">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle size={18} className="text-red-500" />
                                <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em] font-poppins italic">Critical Allergies / Alerts</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-black italic text-white uppercase font-poppins leading-tight break-words">{data.allergies || 'NO KNOWN VULNERABILITIES'}</h2>
                        </div>

                        <div className="bg-[#11192A] rounded-[48px] border border-white/5 overflow-hidden shadow-xl">
                            <div className="p-6 md:p-10 flex flex-row items-center justify-between gap-4">
                                <div className="space-y-4 min-w-0 flex-1">
                                    <div className="flex items-center gap-3">
                                        <Users size={18} className="text-indigo-500" />
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] italic font-poppins">Family Relation</p>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-2xl sm:text-4xl font-black italic text-white uppercase font-poppins mb-1 leading-none break-words line-clamp-2">{data.emergencyContactName}</h4>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">{data.emergencyContactRelation || 'PRIMARY GUARDIAN'}</p>
                                    </div>
                                </div>
                                 <div className="text-right flex flex-col items-center shrink-0">
                                    <button onClick={() => window.location.href = `tel:${data.emergencyContactPhone}`} className="h-14 w-14 md:h-20 md:w-20 bg-emerald-500 text-white rounded-[15px] md:rounded-[25px] flex items-center justify-center shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                                        <Phone size={24} className="md:w-8 md:h-8" />
                                    </button>
                                    <p className="text-[6px] md:text-[7px] text-slate-500 font-black uppercase tracking-widest mt-4">PRIVATE NETWORK ID</p>
                                </div>
                            </div>
                        </div>

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
                                            <div className="min-w-0 pr-4">
                                                <p className="text-white font-black italic uppercase text-lg truncate tracking-tighter">{h.name}</p>
                                                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1 italic">{h.addr}</p>
                                            </div>
                                            <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`)} className="h-12 w-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                                                <Navigation size={20} />
                                            </button>
                                        </div>
                                    ))
                                ) : coords ? (
                                    <div className="text-center py-6">
                                        <p className="text-[10px] italic text-slate-500 font-black uppercase tracking-widest mb-4 font-poppins">No hospitals found within 25km grid.</p>
                                        <button onClick={() => window.open(`https://www.google.com/maps/search/hospital+near+me/@${coords.lat},${coords.lng},15z`)} className="px-6 py-2 bg-slate-800 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Manual Search</button>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4 py-6">
                                         <p className="text-[10px] italic text-slate-600 font-black uppercase tracking-widest font-poppins">Awaiting GPS Target Sync...</p>
                                         <button onClick={() => window.location.reload()} className="px-6 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">Retry Positioning</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-10">
                             <button onClick={() => window.location.href = `tel:108`} className="w-full h-24 bg-red-600 text-white rounded-[40px] font-black uppercase tracking-widest relative active:scale-95 transition-all shadow-2xl shadow-red-600/30 border-b-8 border-red-800 group overflow-hidden">
                                <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-10">
                                    <Siren size={32} className="animate-pulse" />
                                </div>
                                <div className="w-full flex flex-col items-center justify-center relative z-0">
                                    <span className="text-lg md:text-xl leading-none mb-1">DIAL 108</span>
                                    <span className="text-xl md:text-2xl leading-none">AMBULANCE</span>
                                </div>
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

                        {/* Join ResQR CTA */}
                        <div className="pt-20 pb-16 text-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
                            <div className="inline-block p-[1px] rounded-[40px] bg-gradient-to-r from-emerald-500/20 via-primary/20 to-indigo-500/20 mb-8 max-w-full">
                                <div className="bg-[#080F1D] rounded-[39px] p-10 md:p-14 border border-white/5 relative overflow-hidden group">
                                    {/* Background Glow */}
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
                                    
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                                            <Shield size={32} className="text-white" />
                                        </div>
                                        
                                        <h3 className="text-3xl md:text-4xl font-black italic text-white uppercase font-poppins mb-4 tracking-tighter leading-none">
                                            Mission Accomplished?
                                        </h3>
                                        <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-10 max-w-[300px] mx-auto leading-relaxed italic opacity-70">
                                            Thank you for being a responder. Now, protect your own family with ResQR.
                                        </p>
                                        
                                        <button 
                                            onClick={() => window.location.href = '/login?redirect_to=/create-profile'}
                                            className="w-full py-6 bg-white text-[#040812] rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-emerald-500 hover:text-white transition-all transform hover:translate-y-[-4px] active:translate-y-[0px] shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 group/btn"
                                        >
                                            Create My Medical ID
                                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 bg-[#040812]/95 backdrop-blur-xl p-6 border-t border-white/5 text-center">
                 <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] italic mb-1 font-poppins">In Extremis • All Nodes Active</p>
                 <p className="text-[7px] text-slate-600 uppercase tracking-widest italic font-poppins">SECURE MEDICAL IDENTITY RECORD • ResQR Digital Global Vault Protocol v2.1</p>
            </div>
        </div>
    );
}

