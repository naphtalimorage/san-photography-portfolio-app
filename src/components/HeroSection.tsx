import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import hero4 from "@/assets/Join the 10 days wildlife photograph safari….jpg";
import hero6 from "@/assets/africa,wildlife,nature,african,sky,golden….jpg";
import hero7 from "@/assets/Kenya safari guide_ 10 unforgettable wildlife….jpg";
import hero8 from "@/assets/Leopard in the Golden Savannah 🐆🌾__Pin your….jpg";
import hero9 from "@/assets/lake.jpg";
import hero5 from "@/assets/maasai.jpg";

const slides = [
    { image: hero7, subtitle: "Kenya Safaris" },
    { image: hero5, subtitle: "Cultural Heritage" },
    { image: hero8, subtitle: "Leopard in the Golden Savannah" },
    { image: hero1, subtitle: "Weddings" },
    { image: hero4, subtitle: "Safaris" },
    { image: hero2, subtitle: "Portraits" },
    { image: hero6, subtitle: "Savannah Landscapes" },
    { image: hero9, subtitle: "Lake Manyara" },
    { image: hero3, subtitle: "Events" },
];

const HeroSection = () => {
    const [current, setCurrent] = useState(0);

    const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), []);
    const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), []);

    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);

    const scrollTo = (id: string) => {
        document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        // Used 100dvh for mobile to avoid browser UI overlap, falling back to 85vh
        <section className="relative z-10 min-h-[85vh] md:min-h-screen w-full overflow-hidden bg-background">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 z-0 pointer-events-none"
                >
                    <img
                        src={slides[current].image}
                        alt={slides[current].subtitle}
                        className="w-full h-full object-cover"
                        width={1920}
                        height={1080}
                    />
                    {/* Enhanced overlay for better text contrast on mobile */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 pointer-events-none" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 md:py-0 max-w-4xl mx-auto my-[100px]">
                <motion.p
                    key={`sub-${current}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-white/80 text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-4"
                >
                    {slides[current].subtitle}
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 1 }}
                    className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white font-light leading-tight sm:leading-snug md:leading-tight whitespace-normal break-words"
                >
                    <span className="block sm:inline">Capturing Timeless</span>
                    <span className="block sm:inline sm:ml-4 italic">Moments</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="text-white/70 text-sm sm:text-base md:text-xl mt-6 max-w-xs sm:max-w-lg font-light"
                >
                    Fine art photography for life's most meaningful moments
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto items-center justify-center"
                >
                    <button
                        onClick={() => scrollTo("#contact")}
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white text-black text-xs sm:text-sm tracking-widest uppercase hover:bg-white/90 transition-all duration-300 text-center"
                    >
                        Book a Session
                    </button>
                    <button
                        onClick={() => scrollTo("#portfolio")}
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 border border-white text-white text-xs sm:text-sm tracking-widest uppercase hover:bg-white/10 transition-all duration-300 text-center"
                    >
                        View Portfolio
                    </button>
                </motion.div>
            </div>

            {/* Navigation arrows with improved touch targets */}
            <button
                onClick={prev}
                className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-20 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full p-2 md:p-3 transition-all duration-300"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
                onClick={next}
                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-20 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full p-2 md:p-3 transition-all duration-300"
                aria-label="Next slide"
            >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Slide indicators - moved up slightly on mobile to avoid home bar */}
            <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-6 sm:w-12 h-0.5 transition-all duration-500 ${i === current ? "bg-white" : "bg-white/30"
                            }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroSection;