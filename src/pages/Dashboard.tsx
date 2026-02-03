import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";
import SpeakerDashboard from "@/components/dashboard/SpeakerDashboard";
import PendingApproval from "@/components/speakers/PendingApproval";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user, loading, userRole, speakerId } = useAuth();
  const navigate = useNavigate();
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [checkingApproval, setCheckingApproval] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkApproval = async () => {
      if (!user) return;

      if (userRole === "speaker" && speakerId) {
        const { data } = await supabase
          .from("speakers")
          .select("approval_status")
          .eq("id", speakerId)
          .single();
        setApprovalStatus(data?.approval_status || "pending");
      } else {
        const { data } = await supabase
          .from("profiles")
          .select("approval_status")
          .eq("user_id", user.id)
          .single();
        setApprovalStatus(data?.approval_status || "approved");
      }
      setCheckingApproval(false);
    };

    if (user && userRole) {
      checkApproval();
    }
  }, [user, userRole, speakerId]);

  if (loading || checkingApproval) {
    return (
      <Layout>
        <div className="pt-24 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  // Check if pending approval
  if (approvalStatus === "pending") {
    return (
      <Layout>
        <div className="pt-20 md:pt-24 min-h-screen bg-muted/30">
          <PendingApproval type={userRole === "speaker" ? "speaker" : "organizer"} />
        </div>
      </Layout>
    );
  }

  if (approvalStatus === "rejected") {
    return (
      <Layout>
        <div className="pt-20 md:pt-24 min-h-screen bg-muted/30">
          <div className="container-tight py-8">
            <div className="max-w-md mx-auto text-center p-8">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Account Rejected</h2>
              <p className="text-muted-foreground">
                Unfortunately, your account application was not approved. Please contact support for more information.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-20 md:pt-24 min-h-screen bg-muted/30">
        {userRole === "speaker" ? (
          <SpeakerDashboard />
        ) : (
          <OrganizerDashboard />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
