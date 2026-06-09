import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const FloatingButton = () => {
    return (
        <motion.a
            href="https://wa.me/15551234567"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2, type: "spring" }}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-foreground text-background rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={24} />
        </motion.a>
    );
};

export default FloatingButton;
