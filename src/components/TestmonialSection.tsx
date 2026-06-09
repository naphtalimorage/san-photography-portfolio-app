import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
    {
        name: "Sarah & James",
        role: "Wedding Clients",
        text: "Senet captured our wedding day with such artistry and grace. Every image tells a story, and we relive that magical day every time we look through our gallery. She made us feel completely at ease.",
        rating: 5,
    },
    {
        name: "Marcus Chen",
        role: "Portrait Client",
        text: "I've never felt more comfortable in front of a camera. Senet has an incredible ability to bring out your natural self. The portraits she delivered exceeded every expectation I had.",
        rating: 5,
    },
    {
        name: "Olivia & David",
        role: "Engagement Session",
        text: "Working with Senet was an absolute dream. Her eye for light and composition is unmatched. She turned a simple afternoon walk into the most beautiful engagement photos we could have imagined.",
        rating: 5,
    },
];

const TestimonialsSection = () => {
    const [current, setCurrent] = useState(0);

    const next = useCallback(() => setCurrent((p) => (p + 1) % testimonials.length), []);
    const prev = useCallback(
        () => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length),
        []
    );

    useEffect(() => {
        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
    }, [next]);

    return (
        <section id="testimonials" className="section-padding bg-secondary">
            <div className="max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-16"
                >
                    <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">
                        Testimonials
                    </p>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
                        Kind <span className="italic">Words</span>
                    </h2>
                </motion.div>

                <div className="relative min-h-[280px] flex items-center">
                    <button
                        onClick={prev}
                        className="absolute left-0 md:-left-12 text-muted-foreground hover:text-foreground transition-colors z-10"
                    >
                        <ChevronLeft size={28} />
                    </button>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="px-8 md:px-16"
                        >
                            <div className="flex justify-center gap-1 mb-6">
                                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                                    <Star key={i} size={16} className="fill-foreground text-foreground" />
                                ))}
                            </div>
                            <p className="font-display text-xl md:text-2xl text-foreground font-light italic leading-relaxed mb-8">
                                "{testimonials[current].text}"
                            </p>
                            <p className="text-sm tracking-widest uppercase text-foreground">
                                {testimonials[current].name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {testimonials[current].role}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    <button
                        onClick={next}
                        className="absolute right-0 md:-right-12 text-muted-foreground hover:text-foreground transition-colors z-10"
                    >
                        <ChevronRight size={28} />
                    </button>
                </div>

                <div className="flex justify-center gap-3 mt-8">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                i === current ? "bg-foreground scale-125" : "bg-foreground/30"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
