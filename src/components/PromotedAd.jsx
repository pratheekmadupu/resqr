import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { ExternalLink, Info } from 'lucide-react';

export default function PromotedAd() {
    const [ads, setAds] = useState([]);

    useEffect(() => {
        const adsRef = ref(db, 'config/ads');
        const unsub = onValue(adsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const activeAds = Object.entries(data)
                    .map(([id, val]) => ({ id, ...val }))
                    .filter(ad => ad.active);
                setAds(activeAds);
            }
        });
        return () => unsub();
    }, []);

    if (ads.length === 0) return null;

    // Pick a random ad
    const ad = ads[Math.floor(Math.random() * ads.length)];

    return (
        <a
            href={ad.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block group relative overflow-hidden rounded-[40px] border border-white/5 bg-medical-card/50 hover:bg-medical-card transition-all shadow-xl"
        >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/10 to-transparent group-hover:via-primary transition-all duration-700" />
            <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                <div className="w-full md:w-40 h-40 rounded-[32px] overflow-hidden shrink-0 bg-slate-950 border border-white/5 shadow-2xl">
                    <img
                        src={ad.imageUrl}
                        alt="Promoted"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </div>
                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">
                        <Info size={12} className="text-primary" /> Tactical Spotlight
                    </div>
                    <h4 className="text-2xl font-black text-white italic leading-none font-poppins tracking-tighter group-hover:text-primary transition-colors">
                        {ad.text}
                    </h4>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">COMMUNITY PARTNER REQUISITION</p>
                </div>
                <div className="p-5 bg-slate-950 text-primary rounded-[24px] border border-white/5 group-hover:bg-primary group-hover:text-white transition-all shadow-xl transform group-hover:rotate-12">
                    <ExternalLink size={24} />
                </div>
            </div>
        </a>
    );
}
