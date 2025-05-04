import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { sendContactFormEmail, sendAutoResponseEmail } from '../utils/email';
import { storage } from '../storage';

// Contact form schema validation
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

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Create a router for contact form endpoints
const contactRouter = Router();

// POST endpoint for contact form submissions
contactRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const formData = contactFormSchema.parse(req.body);
    
    // Check honeypot field to prevent spam
    if (req.body.company && req.body.company.length > 0) {
      // This is likely a spam submission, but return 200 to not alert the bot
      return res.status(200).json({ success: true });
    }

    console.log('Contact form submission:', {
      name: formData.name,
      email: formData.email,
      category: formData.category,
      message: formData.message,
      company: formData.company
    });
    
    // Store submission in the database
    await storage.createContactSubmission({
      name: formData.name,
      email: formData.email,
      category: formData.category,
      message: formData.message
    });
    
    // Send notification email to the admin/team
    const emailResult = await sendContactFormEmail(formData);
    
    // Send auto-response to the user
    await sendAutoResponseEmail(formData);
    
    // Return response with preview URL for development environments
    return res.status(200).json({
      success: true,
      message: "Your message has been received. We'll get back to you soon!",
      previewUrl: emailResult.previewUrl
    });
  } catch (error) {
    console.error('Contact form error:', error);
    
    if (error instanceof z.ZodError) {
      // Return validation errors
      return res.status(400).json({
        success: false,
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    
    // Return a generic error message
    return res.status(500).json({
      success: false,
      message: "There was a problem processing your request. Please try again later."
    });
  }
});

export default contactRouter;