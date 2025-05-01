import { APP_NAME } from "@/lib/constants";
import React from "react";

export default function Contact() {
  // Using React.FormEvent to ensure proper typing
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Thank you for your message! We'll get back to you soon.");
  };

  return (
    <section className="page-content">
      <div className="container">
        <div className="page-header">
          <h1>Contact Us</h1>
        </div>
        
        <div className="content-section">
          <p>
            Have questions, feedback, or need assistance with {APP_NAME}? We're here to help! 
            Fill out the form below, and our team will get back to you as soon as possible.
          </p>
          
          <div className="contact-container">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <div className="contact-method">
                <i className="fas fa-envelope"></i>
                <p>info@lingomitra.com</p>
              </div>
              <div className="contact-method">
                <i className="fas fa-phone"></i>
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="contact-method">
                <i className="fas fa-map-marker-alt"></i>
                <p>123 Language Way<br />San Francisco, CA 94103</p>
              </div>
              
              <h3>Office Hours</h3>
              <p>Monday - Friday: 9:00 AM - 6:00 PM PT</p>
              <p>Saturday - Sunday: Closed</p>
            </div>
            
            <div className="contact-form">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership Opportunity</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="primary-btn">
                    Submit Message
                  </button>
                </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}