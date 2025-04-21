
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CheckCircle, Clock, Calendar, CreditCard, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BookingSummary from "@/components/BookingSummary";
import PaymentForm from "@/components/PaymentForm";
import ConfirmationView from "@/components/ConfirmationView";

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
  const [searchParams] = useSearchParams();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getServiceDetails = (serviceId: string) => {
    if (serviceId.startsWith('package-')) {
      const id = parseInt(serviceId.replace('package-', ''));
      return packages.find(pkg => pkg.id === id);
    }
    return services.find(service => service.id.toString() === serviceId);
  };

  useEffect(() => {
    const success = searchParams.get('success');
    if (success === '1') {
      setIsComplete(true);
    }

    const canceled = searchParams.get('canceled');
    if (canceled === '1') {
      toast({
        title: "Payment Canceled",
        description: "Your payment process was canceled. You can try again when ready.",
        variant: "destructive",
      });
    }

    const data = sessionStorage.getItem('bookingData');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setBookingData(parsed);
      } catch (e) {
        console.error("Error parsing booking data:", e);
        toast({
          title: "Error",
          description: "There was a problem loading your booking data. Please try again.",
          variant: "destructive",
        });
        navigate('/booking');
      }
    } else {
      navigate('/booking');
    }
  }, [navigate, searchParams, toast]);

  const handlePayment = async () => {
    if (!bookingData) return;
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Sending payment request with data:", {
        amount: Math.round(total * 100),
        currency: "usd",
        bookingData: bookingData,
      });
      
      const { data, error: apiError } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: Math.round(total * 100),
          currency: "usd",
          bookingData: bookingData,
          successUrl: window.location.origin + "/checkout?success=1",
          cancelUrl: window.location.origin + "/checkout?canceled=1",
        }
      });

      if (apiError) {
        throw new Error(apiError.message || "Failed to create payment session");
      }

      console.log("Payment response:", data);

      if (!data?.url) {
        throw new Error("No checkout URL returned from payment service");
      }

      // Redirect to Stripe
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Payment error:", error);
      setError(error?.message || "An error occurred processing your payment.");
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
          <ConfirmationView
            serviceDetails={serviceDetails}
            bookingData={bookingData}
            formattedDate={formattedDate}
            onHome={() => navigate("/")}
          />
        ) : (
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-6">Checkout</h1>
              <p className="text-muted-foreground mb-8">
                Review your booking details and complete payment to confirm your appointment.
              </p>

              <PaymentForm
                isLoading={isLoading}
                onPay={handlePayment}
                error={error}
              />
            </div>
            <div className="md:col-span-4">
              <BookingSummary
                serviceDetails={serviceDetails}
                bookingData={bookingData}
                subtotal={subtotal}
                tax={tax}
                total={total}
                formattedDate={formattedDate}
              />
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
