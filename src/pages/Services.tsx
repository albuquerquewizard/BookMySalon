
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Scissors, Star } from "lucide-react";

// Service type definition
interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  popular?: boolean;
  image: string;
}

// Combo deal type definition
interface ComboDeal {
  id: number;
  name: string;
  description: string;
  services: string[];
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  image: string;
}

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter services based on selected category
  const filteredServices = selectedCategory === "all" 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  return (
    <div className="min-h-screen">
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Our Services</h1>
          <p className="text-muted-foreground max-w-3xl mb-10">
            Discover our comprehensive range of beauty and grooming services. 
            We use premium products and the latest techniques to give you the 
            perfect look you desire.
          </p>
          
          {/* Service Categories */}
          <Tabs defaultValue="all" className="mb-12">
            <TabsList className="mb-8 flex flex-wrap">
              <TabsTrigger 
                value="all" 
                onClick={() => setSelectedCategory("all")}
                className="rounded-full"
              >
                All Services
              </TabsTrigger>
              <TabsTrigger 
                value="haircut" 
                onClick={() => setSelectedCategory("haircut")}
                className="rounded-full"
              >
                Haircuts
              </TabsTrigger>
              <TabsTrigger 
                value="coloring" 
                onClick={() => setSelectedCategory("coloring")}
                className="rounded-full"
              >
                Coloring
              </TabsTrigger>
              <TabsTrigger 
                value="facial" 
                onClick={() => setSelectedCategory("facial")}
                className="rounded-full"
              >
                Facials
              </TabsTrigger>
              <TabsTrigger 
                value="styling" 
                onClick={() => setSelectedCategory("styling")}
                className="rounded-full"
              >
                Styling
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="haircut" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="coloring" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="facial" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="styling" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Combo Deals */}
          <div className="mt-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Special Combo Offers</h2>
            <p className="text-muted-foreground max-w-3xl mb-10">
              Save more with our specially curated combo packages designed to give you
              the complete salon experience at a discounted price.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {comboDeals.map((combo) => (
                <ComboDealCard key={combo.id} combo={combo} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ServiceCard = ({ service }: { service: Service }) => {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-border">
      <div className="h-48 relative">
        <img 
          src={service.image} 
          alt={service.name} 
          className="w-full h-full object-cover"
        />
        {service.popular && (
          <Badge className="absolute top-2 right-2 bg-primary text-white">
            Popular
          </Badge>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{service.name}</h3>
          <span className="text-primary font-medium">${service.price}</span>
        </div>
        <p className="text-muted-foreground mb-4">{service.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>{service.duration} mins</span>
          </div>
          <Link to="/booking">
            <Button size="sm">Book Now</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const ComboDealCard = ({ combo }: { combo: ComboDeal }) => {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-border">
      <div className="sm:flex">
        <div className="sm:w-1/3">
          <img 
            src={combo.image} 
            alt={combo.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6 sm:w-2/3">
          <h3 className="text-xl font-semibold mb-2">{combo.name}</h3>
          <p className="text-muted-foreground mb-4">{combo.description}</p>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Includes:</h4>
            <ul className="space-y-1">
              {combo.services.map((service, index) => (
                <li key={index} className="flex items-start text-sm">
                  <Star className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-wrap items-end gap-4 mb-4">
            <div>
              <span className="text-sm text-muted-foreground line-through">${combo.originalPrice}</span>
              <div className="text-xl font-bold text-primary">${combo.discountedPrice}</div>
            </div>
            <Badge variant="outline" className="text-green-500 border-green-500">
              Save ${combo.savings}
            </Badge>
          </div>
          
          <Link to="/booking">
            <Button>Book This Package</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Sample services data
const services: Service[] = [
  {
    id: 1,
    name: "Haircut & Style",
    description: "Professional cutting and styling for any hair type.",
    price: 45,
    duration: 45,
    category: "haircut",
    popular: true,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80"
  },
  {
    id: 2,
    name: "Classic Facial",
    description: "Deep cleansing facial for all skin types.",
    price: 60,
    duration: 60,
    category: "facial",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
  },
  {
    id: 3,
    name: "Beard Grooming",
    description: "Expert beard trimming and styling service.",
    price: 35,
    duration: 30,
    category: "styling",
    popular: true,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
  },
  {
    id: 4,
    name: "Hair Coloring",
    description: "Full hair coloring with premium products.",
    price: 90,
    duration: 90,
    category: "coloring",
    image: "https://images.unsplash.com/photo-1554519515-242161756769?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
  },
  {
    id: 5,
    name: "Highlights & Balayage",
    description: "Customized highlighting for dimension and depth.",
    price: 120,
    duration: 120,
    category: "coloring",
    popular: true,
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80"
  },
  {
    id: 6,
    name: "Men's Haircut",
    description: "Classic or modern cuts for men of all ages.",
    price: 35,
    duration: 30,
    category: "haircut",
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
  },
  {
    id: 7,
    name: "Luxury Facial",
    description: "Premium facial with anti-aging treatment.",
    price: 85,
    duration: 75,
    category: "facial",
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
  },
  {
    id: 8,
    name: "Blowout & Styling",
    description: "Professional blow-dry and styling service.",
    price: 50,
    duration: 45,
    category: "styling",
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80"
  },
  {
    id: 9,
    name: "Root Touch-Up",
    description: "Quick color application at the roots.",
    price: 65,
    duration: 60,
    category: "coloring",
    image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
  },
];

// Sample combo deals
const comboDeals: ComboDeal[] = [
  {
    id: 1,
    name: "Complete Makeover Package",
    description: "The ultimate package for a total transformation.",
    services: [
      "Haircut & Style",
      "Hair Coloring or Highlights",
      "Luxury Facial",
      "Eyebrow Shaping"
    ],
    originalPrice: 240,
    discountedPrice: 189,
    savings: 51,
    image: "https://images.unsplash.com/photo-1596123068611-c89d922a0f0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80"
  },
  {
    id: 2,
    name: "Men's Grooming Special",
    description: "Complete grooming experience for the modern man.",
    services: [
      "Men's Haircut",
      "Beard Grooming",
      "Classic Facial",
      "Neck & Shoulder Massage"
    ],
    originalPrice: 160,
    discountedPrice: 129,
    savings: 31,
    image: "https://images.unsplash.com/photo-1581071222361-2f86d8ee1c27?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
  }
];

export default Services;
