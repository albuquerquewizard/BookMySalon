
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock } from "lucide-react";

interface BookingSummaryProps {
  serviceDetails?: {
    name: string;
    price: number;
    duration: number;
  };
  bookingData: {
    date: string;
    time: string;
    name: string;
    email: string;
    phone: string;
  };
  subtotal: number;
  tax: number;
  total: number;
  formattedDate: string;
}

const BookingSummary = ({
  serviceDetails,
  bookingData,
  subtotal,
  tax,
  total,
  formattedDate,
}: BookingSummaryProps) => {
  return (
    <div className="sticky top-24">
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Selected Service</h3>
            <div className="bg-secondary/50 p-3 rounded-md">
              <div className="font-medium">{serviceDetails?.name}</div>
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
  );
};

export default BookingSummary;
