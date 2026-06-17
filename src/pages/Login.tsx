import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/intergration/supabase/client.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import hero2 from "@/assets/WhatsApp Image 2026-06-09 at 9.01.10 PM.jpeg";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else {
            navigate("/admin");
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Visual side */}
            <div className="hidden lg:block relative overflow-hidden bg-foreground">
                <img
                    src={hero2}
                    alt="Login Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="font-display text-4xl text-white font-light mb-4">
                            Welcome <span className="italic">Back</span>
                        </h2>
                        <p className="text-white/70 max-w-sm font-light">
                            Manage your portfolio and showcase your timeless moments to the world.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Form side */}
            <div className="flex flex-col items-center justify-center p-8 bg-background">
                <div className="w-full max-w-sm space-y-8">
                    <div className="flex flex-col gap-2">
                        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Back to site
                        </Link>
                        <h1 className="font-display text-3xl font-light text-foreground">
                            Admin <span className="italic">Login</span>
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Please enter your credentials to access the manager.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="email@example.com"
                                    className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground transition-all h-12"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground transition-all h-12"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-none tracking-widest uppercase text-xs transition-all"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
