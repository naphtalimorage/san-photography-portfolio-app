import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
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

    // Lock body scroll when modal is open
    useEffect(() => {
        if (activeId) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [activeId]);

    return (
        <section id="video-reel" className="section-padding bg-secondary/20">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-10 md:mb-16"
                >
                    <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">Behind the Lens</p>
                    <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
                        Video <span className="italic">Showreel</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {reels.map((reel, i) => {
                        const thumbnailUrl = reel.thumbnail_url || getPublicUrl(reel.storage_thumbnail_path);
                        return (
                            <motion.div
                                key={reel.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="group relative aspect-video overflow-hidden bg-background cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
                                onClick={() => setActiveId(reel.id)}
                            >
                                <img
                                    src={thumbnailUrl}
                                    alt={reel.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex flex-col items-center justify-center">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                        <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-1" />
                                    </div>
                                    {/* Always visible on mobile, hover-only on desktop */}
                                    <div className={`absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 text-left transition-all duration-500 ${'sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 opacity-100 translate-y-0'
                                        }`}>
                                        <h3 className="text-white font-display text-base sm:text-lg leading-tight line-clamp-2 drop-shadow-md">
                                            {reel.title}
                                        </h3>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence>
                {activeReel && (
                    <motion.div
                        key="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-12 overscroll-none"
                        onClick={() => setActiveId(null)}
                    >
                        <button
                            className="absolute top-3 right-3 sm:top-6 sm:right-6 text-foreground/80 hover:text-foreground bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full p-2 transition-all z-50"
                            onClick={(e) => { e.stopPropagation(); setActiveId(null); }}
                            aria-label="Close video"
                        >
                            <X size={24} className="sm:w-8 sm:h-8" strokeWidth={1.5} />
                        </button>

                        <div
                            key={`video-${activeReel.id}`}
                            className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <video
                                src={getPublicUrl(activeReel.storage_video_path)}
                                controls
                                autoPlay
                                playsInline
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="absolute bottom-2 sm:bottom-6 left-0 right-0 text-center px-4 pointer-events-none">
                            <p className="text-white/80 text-xs sm:text-sm font-light tracking-wide drop-shadow-md">
                                {activeReel.title}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default VideoReelSection;