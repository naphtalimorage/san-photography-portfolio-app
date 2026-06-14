import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ArrowLeft, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/intergration/supabase/client.ts";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

const categories = ["All", "Weddings", "Portraits", "Events", "Lifestyle", "Safaris"];
const PAGE_SIZE = 12;

const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    return data.publicUrl;
};

const getPhotoUrl = (photo: { image_url?: string | null; storage_path: string }) => {
    return photo.image_url || getPublicUrl(photo.storage_path);
};

const PortfolioPage = () => {
    const [active, setActive] = useState("All");
    const [lightbox, setLightbox] = useState<number | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["portfolio-photos-full", active],
        queryFn: async ({ pageParam = 0 }) => {
            let query = supabase
                .from("photos")
                .select("*")
                .order("sort_order", { ascending: true })
                .range(pageParam, pageParam + PAGE_SIZE - 1);

            if (active !== "All") {
                query = query.eq("category", active);
            }

            const { data, error } = await query;
            if (error) throw error;
            
            return data.map((p) => ({
                id: p.id,
                src: getPhotoUrl(p),
                category: p.category,
                title: p.title,
            }));
        },
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < PAGE_SIZE) return undefined;
            return allPages.length * PAGE_SIZE;
        },
        initialPageParam: 0,
    });

    const photos = data?.pages.flat() || [];

    const nextImage = useCallback(() => {
        if (lightbox !== null) {
            setLightbox((prev) => (prev! + 1) % photos.length);
        }
    }, [lightbox, photos.length]);

    const prevImage = useCallback(() => {
        if (lightbox !== null) {
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
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft size={16} /> Back Home
                            </Link>
                            <Link
                                to="/admin"
                                className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                            >
                                <Shield size={16} /> Admin
                            </Link>
                        </div>
                        <h1 className="font-display text-4xl md:text-6xl font-light text-foreground mb-4 text-left">
                            Full <span className="italic">Portfolio</span>
                        </h1>
                        <p className="text-muted-foreground max-w-2xl text-left">
                            Browse through our complete collection of captured moments across all categories.
                        </p>
                    </motion.div>

                    {/* Category filters */}
                    <div className="flex flex-wrap justify-start gap-3 mb-12">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActive(cat)}
                                className={`text-sm tracking-widest uppercase px-5 py-2 transition-all duration-300 ${
                                    active === cat
                                        ? "bg-foreground text-background"
                                        : "text-muted-foreground hover:text-foreground border border-border"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[300px] grid-flow-dense gap-4">
                        <AnimatePresence mode="popLayout">
                            {photos.map((photo, i) => {
                                const isLeft = i % 2 === 0;
                                return (
                                    <motion.div
                                        key={photo.id}
                                        layout
                                        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className={`group cursor-pointer overflow-hidden rounded-lg ${
                                            i % 6 === 0 ? "md:col-span-2 md:row-span-2" :
                                            i % 6 === 3 ? "md:col-span-1 md:row-span-2" :
                                            ""
                                        } aspect-[4/5] md:aspect-auto`}
                                        onClick={() => setLightbox(i)}
                                    >
                                        <div className="relative h-full w-full overflow-hidden">
                                            <img
                                                src={photo.src}
                                                alt={photo.title}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 transition-all duration-500 flex items-end">
                                                <div className="p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                    <p className="text-primary-foreground text-sm tracking-widest uppercase">
                                                        {photo.category}
                                                    </p>
                                                    <p className="text-primary-foreground font-display text-xl mt-1">
                                                        {photo.title}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Infinite Load Trigger */}
                    <div ref={loadMoreRef} className="w-full py-20 flex justify-center items-center">
                        {isFetchingNextPage ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                <p className="text-xs tracking-widest uppercase text-muted-foreground">Loading more...</p>
                            </div>
                        ) : hasNextPage ? (
                            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Scroll to load more</p>
                        ) : photos.length > 0 && (
                            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">End of gallery</p>
                        )}
                    </div>
                </div>
            </main>

            <Footer />

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-3 md:p-12 overflow-y-auto"

                        onClick={() => setLightbox(null)}
                    >
                        {/* Close button */}
                        <button 
                            className="absolute top-6 right-6 text-foreground hover:opacity-70 transition-opacity z-50"
                            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
                        >
                            <X size={32} strokeWidth={1.5} />
                        </button>

                        {/* Navigation Arrows */}
                        <button 
                            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors z-50 hidden md:block"
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        >
                            <ChevronLeft size={48} strokeWidth={1} />
                        </button>
                        <button 
                            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors z-50 hidden md:block"
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        >
                            <ChevronRight size={48} strokeWidth={1} />
                        </button>

                        <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
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

                            {/* Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-center">

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    key={`info-${lightbox}`}
                                    transition={{ delay: 0.2 }}
                                >
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">
                                        {photos[lightbox]?.category} — {lightbox + 1} / {photos.length}
                                    </p>
                                    <h3 className="font-display text-2xl font-light text-foreground">
                                        {photos[lightbox]?.title}
                                    </h3>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PortfolioPage;
