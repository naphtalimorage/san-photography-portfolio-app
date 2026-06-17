import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/intergration/supabase/client";

const AdminShieldLink = () => {
  const navigate = useNavigate();

  const handleClick = async () => {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      navigate("/admin");
    } else {
      navigate("/login");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Admin dashboard"
      className="inline-flex items-center justify-center p-2 rounded-md border border-border/60 bg-background/70 hover:bg-background transition-colors hover:cursor-pointer"
    >
      <Shield size={18} />
    </button>
  );
};

export default AdminShieldLink;



