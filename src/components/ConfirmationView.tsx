
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Clock, CreditCard } from "lucide-react";

interface ConfirmationViewProps {
  serviceDetails?: {
    name: string;
    price: number;
  };
  bookingData: {
    time: string;
    email: string;
    date: string;
  };
  formattedDate: string;
  onHome: () => void;
}

const ConfirmationView = ({
  serviceDetails,
  bookingData,
  formattedDate,
  onHome,
}: ConfirmationViewProps) => {
  return (
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
          onClick={onHome}
          className="w-full md:w-auto"
        >
          Return to Home
        </Button>
        <p className="text-sm text-muted-foreground">
          Need to reschedule? Please contact us at (555) 123-4567
        </p>
      </CardFooter>
    </Card>
  );
};

export default ConfirmationView;
