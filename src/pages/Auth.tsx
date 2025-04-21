
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Mode = "signin" | "signup";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    setTimeout(() => navigate("/"), 500);
    return <div className="text-center py-20">You are already signed in. Redirecting...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (mode === "signin") {
      const { error } = await signIn(email, password);
      setIsLoading(false);
      if (error) {
        toast({
          title: "Error Signing In",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({ title: "Signed in successfully!" });
        navigate("/");
      }
    } else {
      const { error } = await signUp(email, password);
      setIsLoading(false);
      if (error) {
        toast({
          title: "Error Signing Up",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({ title: "Account created! Please check your email for confirmation." });
        setMode("signin");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{mode === "signin" ? "Sign In" : "Sign Up"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {mode === "signin" ? (
              <>
                Don't have an account?
                <button type="button" onClick={() => setMode("signup")} className="ml-2 text-primary underline">
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?
                <button type="button" onClick={() => setMode("signin")} className="ml-2 text-primary underline">
                  Sign In
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
