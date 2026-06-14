import { motion, useMotionValue, useTransform, animate, useInView, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import aboutImg from "@/assets/WhatsApp Image 2026-06-09 at 9.01.10 PM.jpeg";

const Counter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
    const ref = useRef<HTMLParagraphElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const [displayValue, setDisplayValue] = useState(0);

    useMotionValueEvent(rounded, "change", (latest) => {
        setDisplayValue(latest);
    });

    useEffect(() => {
        if (inView) {
            animate(count, value, { duration: 2, ease: "easeOut" });
        }
    }, [inView, value, count]);

    return (
        <motion.p ref={ref} className="font-display text-3xl text-foreground">
            {displayValue}
            {suffix}
        </motion.p>
    );
};

const AboutSection = () => {
    return (
        <section id="about" className="section-padding bg-secondary">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    <img
                        src={aboutImg}
                        alt="Senet Ryan - Photographer"
                        loading="lazy"
                        width={800}
                        height={1000}
                        className="w-full max-w-md mx-auto md:max-w-none object-cover"
                    />
                    <div className="absolute -bottom-4 -right-4 w-full h-full border border-foreground/10 -z-10" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">
                        About Me
                    </p>
                    <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-6">
                        Hello, I'm <span className="italic">San</span>
                    </h2>
                    <div className="space-y-4 text-muted-foreground font-light leading-relaxed">
                        <p>
                            SAN PHOTOGRAPHY is a photography brand based in the world-famous
                            Maasai Mara, dedicated to capturing authentic moments,
                            breathtaking landscapes, and the beauty of wildlife. Specializing
                            in wildlife, nature, tourism, events, and lifestyle 
                            photography, every image is crafted to tell a powerful story.
                        </p>
                        <p>
                            With a strong eye for detail, lighting, and composition, SAN PHOTOGRAPHY transforms ordinary moments into timeless memories. From African sunsets and wildlife encounters to special events and personal portraits, each photograph reflects emotion, beauty, and professionalism.
                        </p>
                        <p>
                           Driven by creativity and a passion for excellence, SAN PHOTOGRAPHY creates high-quality imagery that celebrates nature, adventure, and the unique stories behind every moment.
Capturing Nature. Preserving Moments. Telling Stories.
                        </p>
                    </div>
                    <div className="flex gap-12 mt-8">
                        <div>
                            <Counter value={4} suffix="+" />
                            <p className="text-sm text-muted-foreground tracking-wide uppercase mt-1">
                                Years Experience
                            </p>
                        </div>
                        <div>
                            <Counter value={140} suffix="+" />
                            <p className="text-sm text-muted-foreground tracking-wide uppercase mt-1">
                                Sessions
                            </p>
                        </div>
                        <div>
                            <Counter value={3} />
                            <p className="text-sm text-muted-foreground tracking-wide uppercase mt-1">
                                Awards
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default AboutSection;
