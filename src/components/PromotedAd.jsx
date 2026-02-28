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
            className="block group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-all"
        >
            <div className="flex flex-col md:flex-row items-center gap-6 p-6">
                <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 bg-slate-950 border border-slate-800">
                    <img
                        src={ad.imageUrl}
                        alt="Promoted"
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                        <Info size={12} /> Sponsored content
                    </div>
                    <h4 className="text-xl font-black text-white italic leading-tight group-hover:text-primary transition-colors">
                        {ad.text}
                    </h4>
                </div>
                <div className="p-4 bg-slate-950 text-white rounded-full border border-slate-800 group-hover:bg-primary transition-colors shrink-0">
                    <ExternalLink size={20} />
                </div>
            </div>
        </a>
    );
}
