import React, { useMemo, useState } from "react";

interface SmartImageProps {
    src: string;
    alt: string;
    className?: string;
    loading?: "lazy" | "eager";
    priority?: boolean;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
}

const SmartImage: React.FC<SmartImageProps> = ({
    src,
    alt,
    className = "",
    loading = "lazy",
    priority = false,
    width,
    height,
    style,
}) => {
    const [loaded, setLoaded] = useState(false);

    // Prevent layout “popping” by keeping the same box even before load.
    const placeholderStyle = useMemo<React.CSSProperties>(() => {
        return {
            opacity: loaded ? 1 : 0,
            transition: "opacity 300ms ease, transform 300ms ease",
            transform: loaded ? "none" : "scale(1.02)",
            ...style,
        };
    }, [loaded, style]);

    return (
        <div
            className={`relative overflow-hidden bg-muted ${className}`}
            aria-label={alt}
        >
            {/* Placeholder */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-muted/60 via-muted to-muted/30 animate-pulse"
                style={{ opacity: loaded ? 0 : 1, transition: "opacity 200ms ease" }}
            />

            {/* Actual image */}
            <img
                src={src}
                alt={alt}
                loading={loading}
                decoding="async"
                fetchPriority={priority ? "high" : undefined}
                width={width}
                height={height}
                onLoad={() => setLoaded(true)}
                style={placeholderStyle}
                className="h-full w-full object-cover"
            />
        </div>
    );
};

export default SmartImage;

