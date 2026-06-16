import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/intergration/supabase/client";

const AdminShieldLink = () => {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHasSession(!!data.session);
    };

    bootstrap();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!hasSession) return (
    <span className="inline-flex items-center justify-center p-2 rounded-md border border-border/60 bg-background/50 opacity-50 select-none" aria-hidden="true">
      <Shield size={18} />
    </span>
  );

  return (
    <Link
      to="/admin"
      aria-label="Admin dashboard"
      className="inline-flex items-center justify-center p-2 rounded-md border border-border/60 bg-background/70 hover:bg-background transition-colors hover:cursor-pointer"
    >
      <Shield size={18} />
    </Link>
  );
};

export default AdminShieldLink;

