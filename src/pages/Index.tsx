import Navbar from "@/components/common/Navbar";
import HeroSection from "@/components/HeroSection";
import VideoReelSection from "@/components/VideoReelSection";
import PortfolioSection from "@/components/PortfolioSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/common/Footer";
import FloatingButton from "@/components/common/FloatingButton";
import TestimonialsSection from "@/components/TestmonialSection.tsx";
import BeforeAfterSection from "@/components/ComparisonSlider";

const Index = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <HeroSection />
            <VideoReelSection />
            <PortfolioSection />
            <BeforeAfterSection />
            <AboutSection />
            <ServicesSection />
            <TestimonialsSection />
            <FAQSection />
            <ContactSection />
            <Footer />
            <FloatingButton />
        </div>
    );
};

export default Index;
