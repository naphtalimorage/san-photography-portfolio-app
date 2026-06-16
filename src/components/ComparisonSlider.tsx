import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import beforeImg from "@/assets/before-edit.jpeg";
import afterImg from "@/assets/after-edit.jpeg";

const BeforeAfterSection = () => {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const updatePosition = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        setSliderPos((x / rect.width) * 100);
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        isDragging.current = true;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        updatePosition(e.clientX);
    }, [updatePosition]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDragging.current) return;
        updatePosition(e.clientX);
    }, [updatePosition]);

    const handlePointerUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    return (
        <section className="section-padding bg-secondary">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-10 md:mb-16"
                >
                    <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">
                        The Process
                    </p>
                    <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
                        Before & <span className="italic">After</span>
                    </h2>
                    <p className="text-muted-foreground mt-4 max-w-lg sm:max-w-xl mx-auto font-light text-sm sm:text-base">
                        Every image is carefully edited to bring out its full potential while maintaining a natural, timeless look.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl mx-auto"
                >
                    <div
                        ref={containerRef}
                        // Responsive aspect ratio: portrait on mobile, landscape on desktop
                        className="relative aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/3] lg:aspect-[16/10] overflow-hidden cursor-col-resize select-none touch-none shadow-xl rounded-lg"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                    >
                        {/* After (bottom layer) */}
                        <img
                            src={afterImg}
                            alt="After editing"
                            className="absolute inset-0 w-full h-full object-cover"
                            draggable={false}
                        />

                        {/* Before (clipped layer) - Using clipPath for cleaner, more performant rendering */}
                        <img
                            src={beforeImg}
                            alt="Before editing"
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                            draggable={false}
                        />

                        {/* Slider line */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white/90 z-10 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                            style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
                        >
                            {/* Increased handle size for better mobile touch targets */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg border border-black/10">
                                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" className="text-foreground/80">
                                    <path d="M7 4L3 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M13 4L17 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        {/* Labels */}
                        <span className="absolute top-3 left-3 sm:top-4 sm:left-4 text-[10px] sm:text-xs tracking-widest uppercase bg-black/50 text-white px-2 sm:px-3 py-1 backdrop-blur-sm z-20 rounded">
                            Before
                        </span>
                        <span className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[10px] sm:text-xs tracking-widest uppercase bg-black/50 text-white px-2 sm:px-3 py-1 backdrop-blur-sm z-20 rounded">
                            After
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default BeforeAfterSection;