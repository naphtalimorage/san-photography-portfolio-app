import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, X } from "lucide-react";

import { supabase } from "@/intergration/supabase/client";

type VideoReel = {
    id: string;
    title: string;
    storage_video_path: string;
    storage_thumbnail_path: string;
    thumbnail_url: string | null;
    sort_order: number;
};

const VideoReelSection = () => {
    const [activeId, setActiveId] = useState<string | null>(null);

    const { data: reels = [] } = useQuery({
        queryKey: ["video-reels"],
        queryFn: async () => {
            const res = await (supabase as any)
                .from("video_reels")
                .select("id,title,storage_video_path,storage_thumbnail_path,thumbnail_url,sort_order")
                .order("sort_order", { ascending: true });
            if (res.error) throw res.error;
            return (res.data ?? []) as VideoReel[];
        },
    });


    const activeReel = useMemo(() => reels.find((r) => r.id === activeId) ?? null, [reels, activeId]);

    const getPublicUrl = (path: string) => {
        const { data } = supabase.storage.from("video_reels").getPublicUrl(path);
        return data?.publicUrl || "";
    };

    return (
        <section id="video-reel" className="section-padding bg-secondary/20">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">Behind the Lens</p>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
                        Video <span className="italic">Showreel</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reels.map((reel, i) => {
                        const thumbnailUrl = reel.thumbnail_url || getPublicUrl(reel.storage_thumbnail_path);
                        return (
                            <motion.div
                                key={reel.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="group relative aspect-video overflow-hidden bg-background cursor-pointer shadow-lg"
                                onClick={() => setActiveId(reel.id)}
                            >
                                <img
                                    src={thumbnailUrl}
                                    alt={reel.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                                    </div>
                                    <div className="absolute bottom-6 left-6 right-6 text-left transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <h3 className="text-white font-display text-lg leading-tight">{reel.title}</h3>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {activeReel ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
                    onClick={() => setActiveId(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-foreground hover:opacity-70 transition-opacity z-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveId(null);
                        }}
                        aria-label="Close video"
                    >
                        <X size={32} strokeWidth={1.5} />
                    </button>

                    <div
                        className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <video
                            src={getPublicUrl(activeReel.storage_video_path)}
                            controls
                            autoPlay
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="absolute bottom-6 left-0 right-0 text-center px-4">
                        <p className="text-white/70 text-sm">{activeReel.title}</p>
                    </div>
                </motion.div>
            ) : null}
        </section>
    );
};

export default VideoReelSection;

