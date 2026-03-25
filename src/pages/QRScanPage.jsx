import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, get, push, serverTimestamp } from 'firebase/database';
import { Phone, MapPin, AlertCircle, Heart, Activity, Loader2, Info, Car, Briefcase, Dog, Shield, Share2, Activity as HeartPulse } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import toast from 'react-hot-toast';

export default function QRScanPage() {
    const { profileId } = useParams();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [scanRecorded, setScanRecorded] = useState(false);
    const [hospitals, setHospitals] = useState([]);
    const [findingHospital, setFindingHospital] = useState(false);
    const [coords, setCoords] = useState(null);

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
                        else toast.error("Identity not found.");
                    }
                } else {
                    const legacy = await get(ref(db, `profiles/${profileId}`));
                    if (legacy.exists()) setProfile({ category: 'people', data: legacy.val() });
                }
            } catch (error) { toast.error("Failed to load secure data."); }
            finally { setLoading(false); }
        };
        fetchProfile();
    }, [profileId]);

    const recordScan = async (userId, pid) => {
        if (scanRecorded) return;
        try {
            let coords = null;
            let locationName = "Emergency Scan Detected";
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                });
                coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                locationName = `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
            } catch (err) {}

            const scanData = {
                timestamp: serverTimestamp(),
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                status: 'Emergency Alert',
                location: locationName,
                coords: coords
            };

            setCoords(coords);
            await push(ref(db, `users/${userId}/profiles/${pid}/scans`), scanData);
            setScanRecorded(true);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        const fetchNearestHospitals = async () => {
            if (!coords) return;
            setFindingHospital(true);
            try {
                const query = `[out:json];node["amenity"="hospital"](around:15000,${coords.lat},${coords.lng});out 5;`;
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
    if (!profile) return <div className="min-h-screen bg-[#040812] flex flex-col items-center justify-center text-white"><Shield size={64} className="text-primary mb-6 opacity-30" /><h1 className="text-2xl font-black uppercase italic">ID NOT FOUND</h1></div>;

    const { category, data } = profile;

    const renderPeopleTemplate = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-lg mx-auto pb-20">
            {/* STACKED CARDS STYLE AS PER SCREENSHOT 2 but DARK */}
            
            {/* Identity Card */}
            <div className="bg-[#11192A] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
                <div className="p-1.5 flex justify-between bg-[#050B18]">
                    <span className="text-[7px] font-black text-slate-500 px-4 py-1 uppercase tracking-widest italic">Identity Records</span>
                    <span className="text-[7px] font-black text-red-500 px-4 py-1 uppercase tracking-widest italic">SECURED</span>
                </div>
                <div className="p-10 text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Legal Identity</p>
                    <h1 className="text-5xl font-black uppercase text-white tracking-tighter italic font-poppins">{data.name}</h1>
                </div>
            </div>

            {/* Blood Type Card */}
            <div className="bg-[#11192A] rounded-[40px] border border-white/5 p-10 flex items-center justify-between shadow-xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 h-full w-48 opacity-[0.03] text-white">
                    <HeartPulse size={120} className="translate-x-12" />
                </div>
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <Heart size={32} className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Blood Type</p>
                        <p className="text-4xl font-black italic text-red-500 font-poppins">{data.bloodGroup || '--'}</p>
                    </div>
                </div>
                <div className="shrink-0 animate-pulse">
                     <div className="w-12 h-0.5 bg-red-500/10 flex items-center justify-center relative">
                        <div className="w-2 h-2 rounded-full bg-red-500/20" />
                     </div>
                </div>
            </div>

            {/* Diagnosis Card */}
            <div className="bg-[#11192A] rounded-[40px] border border-white/5 overflow-hidden shadow-xl">
                 <div className="p-1 flex items-center gap-2 bg-[#050B18] px-6 py-2">
                    <HeartPulse size={12} className="text-red-500" />
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Primary Diagnosis</span>
                </div>
                <div className="p-10">
                    <h2 className="text-3xl font-black italic text-white uppercase font-poppins leading-tight">{data.healthIssues || 'NO REPORTED CONDITIONS'}</h2>
                </div>
            </div>

            {/* Allergies Card */}
            <div className="bg-[#11192A] rounded-[40px] border border-white/5 overflow-hidden shadow-xl">
                 <div className="p-1 flex items-center gap-2 bg-[#050B18] px-6 py-2">
                    <AlertCircle size={12} className="text-red-500" />
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Critical Allergies / Alerts</span>
                </div>
                <div className="p-10">
                    <div className="bg-red-500/5 p-6 rounded-3xl border border-red-500/10">
                         <h2 className="text-3xl font-black italic text-red-400 uppercase font-poppins leading-tight">{data.allergies || 'NO KNOWN ALLERGIES'}</h2>
                    </div>
                </div>
            </div>

            {/* Emergency Action Section - Compact */}
            <div className="grid grid-cols-1 gap-4 pt-10">
                 <button onClick={() => window.location.href = `tel:${data.emergencyContactPhone}`} className="w-full h-20 bg-emerald-500 text-white p-6 rounded-[30px] font-black uppercase tracking-widest text-lg flex justify-center items-center gap-4 active:scale-95 transition-all shadow-2xl shadow-emerald-500/20">
                    <Phone size={24} /> Contact Guardian
                </button>
                <div className="flex gap-4">
                     <button onClick={() => {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition((pos) => {
                                const msg = `I am at your location! Coordinates: ${pos.coords.latitude}, ${pos.coords.longitude}`;
                                window.location.href = `https://wa.me/${data.emergencyContactPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
                            });
                        }
                    }} className="flex-1 h-16 bg-[#11192A] text-white p-4 rounded-[25px] font-black uppercase tracking-widest text-[10px] flex justify-center items-center gap-3 border border-white/5 active:scale-95 transition-all">
                        <MapPin size={18} /> Send Location
                    </button>
                    <button onClick={() => window.open(`https://www.google.com/maps/search/hospital+near+me`)} className="flex-1 h-16 bg-[#11192A] text-white p-4 rounded-[25px] font-black uppercase tracking-widest text-[10px] flex justify-center items-center gap-3 border border-white/5 active:scale-95 transition-all">
                        <Share2 size={18} /> Nearest Med
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#040812] py-12 px-6 selection:bg-red-500/30">
            <div className="max-w-xl mx-auto">
                <div className="flex flex-col items-center mb-12">
                     <img src="/logo.png" alt="RESQR" className="h-10 w-auto mb-6 grayscale brightness-200 opacity-80" />
                     <Badge className="bg-red-500/10 text-red-500 border-none px-6 py-1.5 tracking-[0.4em] uppercase italic font-black text-[9px]">Emergency Medical Profile</Badge>
                     <p className="text-slate-600 text-[8px] font-black uppercase tracking-[0.5em] mt-2">Digital Identification Vault</p>
                </div>
                {category === 'people' ? renderPeopleTemplate() : (
                    <div className="bg-[#11192A] p-12 rounded-[50px] border border-white/5 text-center">
                        <Badge className="bg-primary/10 text-primary border-none mb-6 px-6 py-1 font-black italic uppercase tracking-widest text-[10px]">{category}</Badge>
                        <h2 className="text-4xl font-black italic uppercase text-white mb-6 font-poppins">{data.name || data.petName || data.itemName || data.vehicleNumber}</h2>
                        <button onClick={() => window.location.href = `tel:${data.ownerContact || data.contactNumber}`} className="w-full bg-primary h-20 rounded-[30px] font-black text-white italic uppercase tracking-widest flex items-center justify-center gap-4">
                             <Phone size={24} /> Contact Owner
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

