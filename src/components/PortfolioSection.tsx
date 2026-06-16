import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/intergration/supabase/client.ts";

const categories = ["All", "Weddings", "Portraits", "Events", "Lifestyle"];

const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    return data.publicUrl;
};

const getPhotoUrl = (photo: { image_url?: string | null; storage_path: string }) => {
    return photo.image_url || getPublicUrl(photo.storage_path);
};

const PortfolioSection = () => {
    const [active, setActive] = useState("All");
    const [lightbox, setLightbox] = useState<number | null>(null);

    const { data: photosData } = useQuery({
        queryKey: ["portfolio-photos-home", active],
        queryFn: async () => {
            let query = supabase
                .from("photos")
                .select("*", { count: "exact" })
                .order("sort_order", { ascending: true })
                .range(0, 19);

            if (active !== "All") {
                query = query.eq("category", active);
            }

            const { data, error, count } = await query;
            if (error) throw error;

            return {
                photos: data.map((p) => ({
                    id: p.id,
                    src: getPhotoUrl(p),
                    category: p.category,
                    title: p.title,
                })),
                totalCount: count || 0
            };
        },
    });

    const dbPhotos = photosData?.photos || [];
    const totalCount = photosData?.totalCount || 0;
    const photos = dbPhotos;

    const nextImage = useCallback(() => {
        if (lightbox !== null && photos.length > 0) {
            setLightbox((prev) => (prev! + 1) % photos.length);
        }
    }, [lightbox, photos.length]);

    const prevImage = useCallback(() => {
        if (lightbox !== null && photos.length > 0) {
            setLightbox((prev) => (prev! - 1 + photos.length) % photos.length);
        }
    }, [lightbox, photos.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightbox === null) return;
            if (e.key === "ArrowRight") nextImage();
            if (e.key === "ArrowLeft") prevImage();
            if (e.key === "Escape") setLightbox(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightbox, nextImage, prevImage]);

    useEffect(() => {
        if (lightbox !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [lightbox]);

    return (
        <section id="portfolio" className="section-padding bg-background">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-10 md:mb-16"
                >
                    <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">Portfolio</p>
                    <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
                        A Glimpse Of My <span className="italic">Lens</span>
                    </h2>
                </motion.div>

                {/* Category filters */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 md:mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActive(cat)}
                            className={`text-xs sm:text-sm tracking-widest uppercase px-3 sm:px-5 py-1.5 sm:py-2 transition-all duration-300 ${active === cat
                                    ? "bg-foreground text-background"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="w-full">
                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[250px] sm:auto-rows-[300px] grid-flow-dense gap-3 sm:gap-4 mb-8 md:mb-12">
                        <AnimatePresence mode="popLayout">
                            {photos.map((photo, i) => {
                                const isLeft = i % 2 === 0;
                                return (
                                    <motion.div
                                        key={photo.id || photo.title + i}
                                        layout
                                        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className={`group cursor-pointer overflow-hidden rounded-lg ${i % 6 === 0 ? "md:col-span-2 md:row-span-2" :
                                                i % 6 === 3 ? "md:row-span-2" :
                                                    ""
                                            } aspect-[4/5] sm:aspect-auto`}
                                        onClick={() => setLightbox(i)}
                                    >
                                        <div className="relative h-full w-full overflow-hidden">
                                            <img
                                                src={photo.src}
                                                alt={photo.title}
                                                loading="lazy"
                                                decoding="async"
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 transition-all duration-500 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100">
                                                <div className="p-4 sm:p-6">
                                                    <p className="text-white text-xs sm:text-sm tracking-widest uppercase">
                                                        {photo.category}
                                                    </p>
                                                    <p className="text-white font-display text-lg sm:text-xl mt-1 line-clamp-2">
                                                        {photo.title}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    {/* Portfolio actions - Mobile & Desktop Optimized */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-12 md:mt-16 w-full pt-8 border-t border-border/50">
                        {totalCount > 20 && (
                            <Link
                                to="/portfolio"
                                className="group w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 bg-foreground text-background text-sm tracking-widest uppercase hover:opacity-90 transition-all duration-300 rounded-lg min-h-[44px]"
                            >
                                View Full Portfolio <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}


                    </div>
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-12 overflow-hidden"
                        onClick={() => setLightbox(null)}
                    >
                        <button
                            className="absolute top-3 right-3 sm:top-6 sm:right-6 text-foreground/80 hover:text-foreground bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full p-2 transition-all z-50"
                            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
                            aria-label="Close lightbox"
                        >
                            <X size={24} className="sm:w-8 sm:h-8" strokeWidth={1.5} />
                        </button>

                        <button
                            className="absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 text-foreground/80 hover:text-foreground bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all z-50"
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8" strokeWidth={1.5} />
                        </button>
                        <button
                            className="absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 text-foreground/80 hover:text-foreground bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all z-50"
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8" strokeWidth={1.5} />
                        </button>

                        <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center px-12 sm:px-16 md:px-20" onClick={(e) => e.stopPropagation()}>
                            <div className="relative w-full h-full flex items-center justify-center">
                                <motion.img
                                    key={lightbox}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    src={photos[lightbox]?.src}
                                    alt={photos[lightbox]?.title}
                                    className="max-w-full max-h-full object-contain shadow-2xl"
                                />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-center bg-gradient-to-t from-background/90 via-background/60 to-transparent pointer-events-none">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    key={`info-${lightbox}`}
                                    transition={{ delay: 0.2 }}
                                >
                                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">
                                        {photos[lightbox]?.category} — {lightbox + 1} / {photos.length}
                                    </p>
                                    <h3 className="font-display text-xl sm:text-2xl font-light text-foreground line-clamp-1">
                                        {photos[lightbox]?.title}
                                    </h3>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default PortfolioSection;