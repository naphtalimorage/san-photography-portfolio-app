import { motion } from "framer-motion";

const WhatsAppGlyph = ({ size = 24 }: { size?: number }) => {
    // Simple inline “WhatsApp-like” glyph to avoid dependency on a specific icon set.
    // White mark on the button background.
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {/* outer bubble */}
            <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.9781 2.57297 15.8238 3.56072 17.3813L2.5 22L7.24184 20.965C8.6131 21.6831 10.196 22 12 22Z"
                fill="currentColor"
                fillOpacity="0.18"
            />
            {/* whatsapp logo approximation (phone/chat) */}
            <path
                d="M9.2 9.05C9.4 8.6 9.73 8.55 10.02 8.56C10.25 8.56 10.48 8.56 10.67 8.56C10.93 8.56 11.18 8.46 11.3 8.86C11.42 9.26 11.62 10.13 11.66 10.29C11.71 10.44 11.76 10.56 11.68 10.73C11.6 10.9 11.39 11.1 11.25 11.26C11.11 11.42 10.99 11.61 11.13 11.85C11.27 12.09 11.73 12.86 12.43 13.49C13.4 14.37 14.29 14.69 14.6 14.83C14.81 14.93 14.98 14.91 15.13 14.77C15.35 14.56 15.58 14.24 15.79 13.98C15.98 13.75 16.19 13.69 16.43 13.78C16.67 13.87 17.5 14.26 17.68 14.33C17.86 14.4 18.02 14.46 18.03 14.59C18.05 14.72 18.05 15.22 17.79 15.74C17.55 16.25 16.95 16.75 16.39 16.76C15.83 16.77 15.18 16.65 14.15 16.24C13.12 15.83 12.07 15.14 11.05 14.12C9.96 13.03 9.17 11.74 8.87 10.99C8.58 10.24 8.79 9.62 9.06 9.33C9.12 9.27 9.25 9.17 9.2 9.05Z"
                fill="currentColor"
            />
        </svg>
    );
};

const FloatingButton = () => {
    return (
        <motion.a
            href="https://wa.me/15551234567"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2, type: "spring" }}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] text-background rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
            aria-label="Chat on WhatsApp"
        >
            <WhatsAppGlyph size={26} />
        </motion.a>
    );
};

export default FloatingButton;

