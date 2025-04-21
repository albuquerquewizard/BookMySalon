
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import React from "react";

interface PaymentFormProps {
  isLoading: boolean;
  onPay: () => void;
  error?: string | null;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ isLoading, onPay, error }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>Click the button below to pay using Stripe securely</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-6">
        {error && (
          <Alert variant="destructive" className="mb-4 w-full max-w-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button
          className="w-full md:w-2/3"
          onClick={onPay}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Pay with Stripe"}
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
