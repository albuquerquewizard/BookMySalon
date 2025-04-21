
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format, addDays, isBefore, isAfter, set } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

// Business hours
const OPENING_HOUR = 9; // 9 AM
const CLOSING_HOUR = 19; // 7 PM
const TIME_SLOT_DURATION = 30; // minutes

interface BookingFormValues {
  service: string;
  date: Date;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

const Booking = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Create form
  const form = useForm<BookingFormValues>({
    defaultValues: {
      service: "",
      name: "",
      email: "",
      phone: "",
    },
  });

  // Generate available time slots for the selected date
  const timeSlots = generateTimeSlots(selectedDate);
  
  // Submit handler
  const onSubmit = (data: BookingFormValues) => {
    console.log("Booking data:", data);
    // Store booking data in sessionStorage for use in the checkout page
    sessionStorage.setItem('bookingData', JSON.stringify(data));
    navigate('/checkout');
  };

  // Find service details by ID
  const getServiceDetails = (serviceId: string) => {
    return services.find(service => service.id.toString() === serviceId);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Book Your Appointment</h1>
          <p className="text-muted-foreground max-w-3xl">
            Select your preferred service, date, and time, and we'll schedule your appointment.
            Our stylists are ready to provide you with an exceptional salon experience.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Booking form - left side */}
          <div className="md:col-span-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Service</CardTitle>
                    <CardDescription>Choose the service you'd like to book</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="service"
                      rules={{ required: "Please select a service" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedService(value);
                              }} 
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                              <SelectContent>
                                {/* Fix: Changed from empty string to placeholder-option */}
                                <SelectItem value="placeholder-option" disabled>-- Select a service --</SelectItem>
                                {services.map((service) => (
                                  <SelectItem key={service.id} value={service.id.toString()}>
                                    {service.name} - ${service.price}
                                  </SelectItem>
                                ))}
                                <Separator className="my-2" />
                                {/* Fix: Changed from empty string to placeholder-packages */}
                                <SelectItem value="placeholder-packages" disabled>-- Packages --</SelectItem>
                                {packages.map((pkg) => (
                                  <SelectItem key={pkg.id} value={`package-${pkg.id}`}>
                                    {pkg.name} - ${pkg.price}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Select Date & Time</CardTitle>
                    <CardDescription>Choose your preferred appointment date and time</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Date picker */}
                      <FormField
                        control={form.control}
                        name="date"
                        rules={{ required: "Please select a date" }}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    setSelectedDate(date);
                                  }}
                                  disabled={(date) => 
                                    isBefore(date, new Date()) || 
                                    isAfter(date, addDays(new Date(), 30))
                                  }
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Time picker */}
                      <FormField
                        control={form.control}
                        name="time"
                        rules={{ required: "Please select a time" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                                disabled={!selectedDate}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={selectedDate ? "Select a time" : "Pick a date first"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeSlots.length > 0 ? (
                                    timeSlots.map((slot) => (
                                      <SelectItem key={slot.value} value={slot.value}>
                                        {slot.label}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-slots" disabled>
                                      No available slots
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Your Information</CardTitle>
                    <CardDescription>Please provide your contact details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      rules={{ required: "Your name is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        rules={{ 
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Please enter a valid email address"
                          } 
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        rules={{ 
                          required: "Phone number is required" 
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Any special requests or information" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full md:w-auto">Continue to Checkout</Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </div>
          
          {/* Booking summary - right side */}
          <div className="md:col-span-4">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedService ? (
                    <div>
                      <h3 className="font-medium">Selected Service</h3>
                      <div className="bg-secondary/50 p-3 rounded-md mt-2">
                        {selectedService.startsWith('package') ? (
                          <div>
                            <div className="font-medium">
                              {packages.find(pkg => `package-${pkg.id}` === selectedService)?.name}
                            </div>
                            <div className="text-primary font-medium mt-1">
                              ${packages.find(pkg => `package-${pkg.id}` === selectedService)?.price}
                            </div>
                            <div className="text-sm text-muted-foreground mt-2">
                              Duration: {packages.find(pkg => `package-${pkg.id}` === selectedService)?.duration} mins
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">
                              {getServiceDetails(selectedService)?.name}
                            </div>
                            <div className="text-primary font-medium mt-1">
                              ${getServiceDetails(selectedService)?.price}
                            </div>
                            <div className="text-sm text-muted-foreground mt-2">
                              Duration: {getServiceDetails(selectedService)?.duration} mins
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-secondary/50 p-3 rounded-md text-muted-foreground text-center">
                      Select a service to see details
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium">Date & Time</h3>
                    <div className="bg-secondary/50 p-3 rounded-md mt-2">
                      {selectedDate ? (
                        <div>
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                          </div>
                          {form.watch("time") && (
                            <div className="flex items-center mt-2">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{form.watch("time")}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-center">
                          No date selected
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Salon Hours</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Monday - Friday</span>
                        <span>{OPENING_HOUR}:00 AM - {CLOSING_HOUR - 12}:00 PM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Saturday</span>
                        <span>{OPENING_HOUR}:00 AM - {CLOSING_HOUR - 12}:00 PM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sunday</span>
                        <span>Closed</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Need help with your booking?
                </p>
                <p className="text-sm font-medium">
                  Call us at (555) 123-4567
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate time slots
function generateTimeSlots(date: Date | null) {
  if (!date) return [];
  
  // Check if the selected date is today
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  // Check if it's Sunday (0 is Sunday in JavaScript)
  const isSunday = date.getDay() === 0;
  if (isSunday) return [];
  
  const slots = [];
  let startHour = OPENING_HOUR;
  
  // If booking for today, only show future time slots
  if (isToday) {
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();
    
    // Round up to the next 30-minute slot
    if (currentMinutes > 30) {
      startHour = currentHour + 1;
    } else {
      startHour = currentHour;
    }
    
    // Ensure we're not starting before opening hour
    startHour = Math.max(startHour, OPENING_HOUR);
  }
  
  // Generate 30-minute slots
  for (let hour = startHour; hour < CLOSING_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += TIME_SLOT_DURATION) {
      // Skip past times if it's today
      if (isToday && hour === startHour && minute < 30 && today.getMinutes() > 0) {
        continue;
      }
      
      const timeString = formatTimeSlot(hour, minute);
      slots.push({
        value: timeString,
        label: timeString
      });
    }
  }
  
  return slots;
}

// Helper function to format time slot
function formatTimeSlot(hour: number, minute: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

// Sample service data
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

// Sample package data
const packages = [
  { id: 1, name: "Complete Makeover Package", price: 189, duration: 180 },
  { id: 2, name: "Men's Grooming Special", price: 129, duration: 120 }
];

export default Booking;
