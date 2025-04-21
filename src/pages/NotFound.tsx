import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center px-4 max-w-md">
        <Scissors className="h-12 w-12 text-primary mx-auto mb-6" />
        <h1 className="text-6xl font-bold mb-6">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! The page you're looking for has been styled out of existence.
        </p>
        <Link to="/">
          <Button size="lg" className="rounded-full px-8">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
