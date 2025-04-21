
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, Clock, Calendar, CheckCircle } from "lucide-react";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background z-10"></div>
        
        <div className="container mx-auto relative z-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Premium Salon Experience
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-xl">
              Book your next salon appointment with ease. Experience luxury and style at your convenience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/booking">
                <Button size="lg" className="rounded-full">
                  Book Appointment
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="rounded-full">
                  View Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Premium Salon Experience</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-card rounded-lg p-6 shadow-lg flex flex-col items-center text-center">
              <div className="bg-primary/20 p-4 rounded-full mb-4">
                <Scissors className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Stylists</h3>
              <p className="text-muted-foreground">Our professional stylists specialize in the latest trends and techniques.</p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-lg flex flex-col items-center text-center">
              <div className="bg-primary/20 p-4 rounded-full mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Hours</h3>
              <p className="text-muted-foreground">Open 7 days a week with early and late appointments available.</p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-lg flex flex-col items-center text-center">
              <div className="bg-primary/20 p-4 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-muted-foreground">Book, reschedule, or cancel appointments with just a few clicks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Popular Services</h2>
            <Link to="/services">
              <Button variant="ghost">View All Services</Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularServices.map((service) => (
              <div key={service.id} className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-48 bg-secondary/50" style={{ 
                  backgroundImage: `url(${service.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    <span className="text-primary font-medium">${service.price}</span>
                  </div>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{service.duration} mins</span>
                    <Link to="/booking">
                      <Button size="sm">Book Now</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready for a New Look?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their style.
          </p>
          <Link to="/booking">
            <Button size="lg" className="rounded-full px-8">
              Book Your Appointment
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Scissors className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-xl">BookMySalon</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 BookMySalon. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sample data
const popularServices = [
  {
    id: 1,
    name: "Haircut & Style",
    description: "Professional cutting and styling for any hair type.",
    price: 45,
    duration: 45,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80"
  },
  {
    id: 2,
    name: "Facial Treatment",
    description: "Revitalizing facial for glowing and healthy skin.",
    price: 75,
    duration: 60,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
  },
  {
    id: 3,
    name: "Beard Grooming",
    description: "Expert beard trimming and styling service.",
    price: 35,
    duration: 30,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
  }
];

export default Home;
