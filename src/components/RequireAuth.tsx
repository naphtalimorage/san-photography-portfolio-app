import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import {supabase} from "@/intergration/supabase/client.ts";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const bootstrap = async () => {
            const { data } = await supabase.auth.getSession();
            if (!mounted) return;
            setSession(data.session);
            setLoading(false);
        };

        bootstrap();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, nextSession) => {
                setSession(nextSession);
                setLoading(false);
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (loading) return;
        if (!session) navigate("/login", { replace: true });
    }, [loading, session, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return session ? <>{children}</> : null;
};

export default RequireAuth;
