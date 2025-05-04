import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSimpleToast } from "@/hooks/use-simple-toast";
import { Loader2, Send, Mail, Wand2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTheme } from "@/components/ThemeProvider";

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  category: z.enum(["General", "Bug", "Feature", "Partnership", "Press"], { 
    errorMap: () => ({ message: "Please select a valid category" })
  }),
  message: z.string().min(30, { message: "Message must be at least 30 characters" }),
  // Honeypot field to catch spam bots - should be empty
  company: z.string().max(0).optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { theme } = useTheme();
  const toast = useSimpleToast();
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  // Initialize form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      category: "General",
      message: "",
      company: "",
    },
  });

  // Form submission handler using react-query
  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit contact form');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Thanks for writing in — a team member will respond at the email you provided.");
      
      // If there's a preview URL (for test emails), show another toast with the link
      if (data.previewUrl) {
        toast.toast({
          title: "Test Email Preview Available",
          description: (
            <div className="mt-2">
              <p className="mb-2">Since we're in development mode, emails are sent to a test service.</p>
              <a 
                href={data.previewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Click here to view the test email
              </a>
            </div>
          ),
          variant: 'default',
          duration: 10000, // Longer duration to give time to click
        });
      }
      
      form.reset();
      setIsSubmitSuccessful(true);
    },
    onError: (error) => {
      toast.error("Error submitting form", error.message);
    },
  });

  // Form submission handler
  const onSubmit = (data: ContactFormValues) => {
    contactMutation.mutate(data);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Wand2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Talk to the LingoMitra team</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Questions, bug reports or partnership ideas? Drop a note and we'll reply within two working days.
        </p>
      </div>
      
      {/* Main Content - Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Info Card */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl">Contact Information</CardTitle>
            <CardDescription>
              How to reach us through different channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Email Us Directly</p>
                <a href="mailto:product@lingomitra.com" className="text-primary hover:underline">
                  product@lingomitra.com
                </a>
              </div>
            </div>
            
            <div>
              <p className="font-medium mt-6 mb-2">Support Hours</p>
              <p className="text-muted-foreground">
                Mon–Fri · 10 am–6 pm IST
              </p>
            </div>
            
            <div className="border-t border-border pt-4 mt-6 space-y-2">
              <p>For press kits and logos visit <a href="#" className="text-primary hover:underline">/press</a></p>
              <p>For feature requests vote on our <a href="#" className="text-primary hover:underline">Public Roadmap</a></p>
            </div>
          </CardContent>
        </Card>
        
        {/* Contact Form Card */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl">Send us a message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="space-y-6"
              >
                {/* Honeypot field - hidden from users but bots will fill it out */}
                <div className="hidden">
                  <input
                    type="text"
                    {...form.register("company")}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="you@example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="General">General Inquiry</SelectItem>
                          <SelectItem value="Bug">Bug Report</SelectItem>
                          <SelectItem value="Feature">Feature Request</SelectItem>
                          <SelectItem value="Partnership">Partnership</SelectItem>
                          <SelectItem value="Press">Press Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How can we help?" 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={contactMutation.isPending || isSubmitSuccessful}
                >
                  {contactMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send message
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      {/* FAQ Teaser */}
      <div className="mt-12 text-center bg-muted/50 p-6 rounded-lg">
        <h3 className="text-xl font-medium mb-2">Frequently Asked Questions</h3>
        <p className="mb-4">
          Find quick answers to common questions about LingoMitra features and policies.
        </p>
        <Button variant="outline" onClick={() => window.location.href = "/faq"}>
          Visit our FAQ
        </Button>
      </div>
    </div>
  );
}