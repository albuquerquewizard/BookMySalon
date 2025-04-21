import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { CheckCircle, Clock, Calendar, CreditCard, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface BookingData {
  service: string;
  date: string; // ISO string
  time: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const getServiceDetails = (serviceId: string) => {
    if (serviceId.startsWith('package-')) {
      const id = parseInt(serviceId.replace('package-', ''));
      return packages.find(pkg => pkg.id === id);
    }
    return services.find(service => service.id.toString() === serviceId);
  };

  useEffect(() => {
    const data = sessionStorage.getItem('bookingData');
    if (data) {
      const parsed = JSON.parse(data);
      setBookingData(parsed);
    } else {
      navigate('/booking');
    }
  }, [navigate]);

  const { toast } = useToast();

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const bookingToSend = { ...bookingData };
      delete bookingToSend.date;
      const response = await fetch("/functions/v1/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sb-xqyqegtuurhybxlftnas-auth-token")}`,
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: "usd",
          bookingData: bookingData,
          successUrl: window.location.origin + "/checkout?success=1",
          cancelUrl: window.location.origin + "/checkout?canceled=1",
        }),
      });

      const data = await response.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create payment session.");
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error?.message || "An error occurred processing your payment.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (!bookingData) {
    return <div className="container mx-auto py-12 text-center">Loading...</div>;
  }

  const serviceDetails = getServiceDetails(bookingData.service);
  const subtotal = serviceDetails?.price || 0;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const formattedDate = format(new Date(bookingData.date), "EEEE, MMMM d, yyyy");

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {isComplete ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center pb-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
              <CardDescription>
                Thank you for booking with BookMySalon. Your appointment has been confirmed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-secondary/30 p-4 rounded-md">
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                    <span className="font-medium">{formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-primary" />
                    <span className="font-medium">{bookingData.time}</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-primary" />
                    <span className="font-medium">
                      {serviceDetails?.name} - ${serviceDetails?.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Booking reference: #BKSLN{Math.floor(Math.random() * 10000)}</p>
                <p>A confirmation email has been sent to {bookingData.email}</p>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <Button 
                onClick={() => navigate('/')} 
                className="w-full md:w-auto"
              >
                Return to Home
              </Button>
              <p className="text-sm text-muted-foreground">
                Need to reschedule? Please contact us at (555) 123-4567
              </p>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-6">Checkout</h1>
              <p className="text-muted-foreground mb-8">
                Review your booking details and complete payment to confirm your appointment.
              </p>
              
              <Tabs defaultValue="card" className="mb-8">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card">Credit Card</TabsTrigger>
                  <TabsTrigger value="paypal">PayPal</TabsTrigger>
                </TabsList>
                
                <TabsContent value="card" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Credit Card Details</CardTitle>
                      <CardDescription>Enter your card information securely</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="1234 5678 9012 3456" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="card-name">Name on Card</Label>
                        <Input id="card-name" placeholder="John Doe" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={handlePayment}
                        disabled={isLoading}
                      >
                        {isLoading ? "Processing..." : "Pay Now"}
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <div className="flex items-center mt-4 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>This is a demo. No actual payment will be processed.</span>
                  </div>
                </TabsContent>
                
                <TabsContent value="paypal" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pay with PayPal</CardTitle>
                      <CardDescription>Click the button below to pay using PayPal</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                      <Button className="w-full md:w-2/3" onClick={handlePayment} disabled={isLoading}>
                        {isLoading ? "Processing..." : "Continue to PayPal"}
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <div className="flex items-center mt-4 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>This is a demo. No actual payment will be processed.</span>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="md:col-span-4">
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Selected Service</h3>
                      <div className="bg-secondary/50 p-3 rounded-md">
                        <div className="font-medium">
                          {serviceDetails?.name}
                        </div>
                        <div className="text-primary font-medium mt-1">
                          ${serviceDetails?.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Duration: {serviceDetails?.duration} mins
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Appointment</h3>
                      <div className="bg-secondary/50 p-3 rounded-md">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{bookingData.time}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Customer</h3>
                      <div className="bg-secondary/50 p-3 rounded-md">
                        <p className="font-medium">{bookingData.name}</p>
                        <p className="text-sm text-muted-foreground">{bookingData.email}</p>
                        <p className="text-sm text-muted-foreground">{bookingData.phone}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Tax (8%)</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <p>
                    By completing this booking, you agree to our{" "}
                    <a href="#" className="text-primary hover:underline">Terms of Service</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const services = [
  { id: 1, name: "Haircut & Style", price: 45, duration: 45 },
  { id: 2, name: "Classic Facial", price: 60, duration: 60 },
  { id: 3, name: "Beard Grooming", price: 35, duration: 30 },
  { id: 4, name: "Hair Coloring", price: 90, duration: 90 },
  { id: 5, name: "Highlights & Balayage", price: 120, duration: 120 },
  { id: 6, name: "Men's Haircut", price: 35, duration: 30 },
  { id: 7, name: "Luxury Facial", price: 85, duration: 75 },
  { id: 8, name: "Blowout & Styling", price: 50, duration: 45 },
  { id: 9, name: "Root Touch-Up", price: 65, duration: 60 }
];

const packages = [
  { id: 1, name: "Complete Makeover Package", price: 189, duration: 180 },
  { id: 2, name: "Men's Grooming Special", price: 129, duration: 120 }
];

export default Checkout;
