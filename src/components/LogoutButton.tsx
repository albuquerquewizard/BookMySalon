
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await signOut();
        navigate("/");
      }}
    >
      Sign Out
    </Button>
  );
}
