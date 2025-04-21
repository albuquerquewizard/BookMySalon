import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, Scissors } from 'lucide-react';
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive 
            ? 'bg-primary/20 text-primary' 
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-sm bg-background/90 border-border">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Scissors className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">BookMySalon</span>
          </Link>
          
          <nav className="ml-10 hidden md:flex items-center space-x-1">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/services">Services</NavLink>
            <NavLink to="/booking">Booking</NavLink>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="default" size="sm">Sign Up</Button>
                </Link>
              </>
            ) : (
              <LogoutButton />
            )}
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] pr-0">
              <nav className="flex flex-col gap-4 mt-6">
                <Link to="/" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" size="sm">Home</Button>
                </Link>
                <Link to="/services" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" size="sm">Services</Button>
                </Link>
                <Link to="/booking" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" size="sm">Booking</Button>
                </Link>
                <Link to="/signin" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <Button variant="default" className="w-full" size="sm">Sign Up</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
