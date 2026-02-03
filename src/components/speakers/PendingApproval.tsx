import { Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PendingApprovalProps {
  type: "speaker" | "organizer";
}

const PendingApproval = ({ type }: PendingApprovalProps) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md text-center p-8">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Pending Approval
        </h2>
        <p className="text-muted-foreground mb-6">
          {type === "speaker"
            ? "Your speaker profile is currently under review. Our admin team will verify your details and approve your account within 24-48 hours."
            : "Your organizer account is pending approval. You'll be able to book speakers once your account is verified."}
        </p>
        <div className="bg-muted/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            <strong>What happens next?</strong>
          </p>
          <ul className="text-sm text-muted-foreground mt-2 text-left space-y-2">
            <li>• Admin reviews your profile information</li>
            <li>• You'll receive an email once approved</li>
            <li>• {type === "speaker" ? "You can then manage your availability and receive bookings" : "You can then browse and book speakers"}</li>
          </ul>
        </div>
        <Button variant="outline" className="gap-2" asChild>
          <a href="mailto:support@bookyourguest.in">
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
        </Button>
      </div>
    </div>
  );
};

export default PendingApproval;
