
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import React, { useState } from "react";

interface PaymentFormProps {
  isLoading: boolean;
  onPay: () => Promise<void>;
  error?: string | null;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ isLoading, onPay, error }) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const handlePayClick = async () => {
    if (isLoading || redirecting) return;
    
    setLocalError(null);
    setRedirecting(true);
    
    try {
      await onPay();
      // If we get here without redirecting, show an error
      setTimeout(() => {
        if (document.visibilityState !== 'hidden') {
          setLocalError("Stripe checkout didn't open. Please try again or contact support.");
          setRedirecting(false);
        }
      }, 5000);
    } catch (err: any) {
      setLocalError(err?.message || "Payment processing failed. Please try again.");
      setRedirecting(false);
    }
  };

  const currentError = error || localError;
  const buttonText = isLoading 
    ? "Processing..." 
    : redirecting 
      ? "Redirecting to Stripe..." 
      : "Pay with Stripe";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>Click the button below to pay using Stripe securely</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-6">
        {currentError && (
          <Alert variant="destructive" className="mb-4 w-full max-w-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{currentError}</AlertDescription>
          </Alert>
        )}
        <Button
          className="w-full md:w-2/3"
          onClick={handlePayClick}
          disabled={isLoading || redirecting}
        >
          {isLoading || redirecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {buttonText}
            </>
          ) : (
            buttonText
          )}
        </Button>
      </CardContent>
      <div className="flex items-center mt-4 text-sm text-muted-foreground px-6 pb-6">
        <AlertCircle className="w-4 h-4 mr-2" />
        <span>This is a demo. No actual payment will be processed.</span>
      </div>
    </Card>
  );
};

export default PaymentForm;
