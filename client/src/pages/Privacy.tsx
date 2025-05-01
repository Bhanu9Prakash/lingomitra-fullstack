import { APP_NAME } from "@/lib/constants";
import React from "react";

export default function Privacy() {
  const lastUpdated = "April 30, 2023";

  return (
    <section className="page-content">
      <div className="container">
        <div className="page-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: {lastUpdated}</p>
        </div>
        
        <div className="content-section">
          <p>
            This Privacy Policy explains how {APP_NAME} collects, uses, and protects your personal information 
            when you use our language learning platform. We are committed to ensuring the privacy and security 
            of your data while providing you with a personalized learning experience.
          </p>
          
          <h2>Information We Collect</h2>
          <p>
            We collect the following types of information to provide and improve our services:
          </p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
            <li><strong>Profile Information:</strong> Language preferences, learning goals, and progress data</li>
            <li><strong>Usage Information:</strong> Interactions with lessons, chat conversations with our AI tutor, and learning patterns</li>
            <li><strong>Device Information:</strong> Device type, operating system, browser type, and IP address</li>
            <li><strong>Cookies and Similar Technologies:</strong> Information collected through cookies to enhance your experience</li>
          </ul>
          
          <h2>How We Use Your Information</h2>
          <p>We use your information for the following purposes:</p>
          <ul>
            <li>Provide and personalize our language learning services</li>
            <li>Track and analyze your learning progress</li>
            <li>Improve and develop new features</li>
            <li>Send important updates about our service</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Ensure the security and integrity of our platform</li>
          </ul>
          
          <h2>Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information from 
            unauthorized access, disclosure, alteration, and destruction. These measures include encryption, 
            secure server protocols, and regular security assessments.
          </p>
          
          <h2>Your Rights and Choices</h2>
          <p>You have the following rights regarding your personal information:</p>
          <ul>
            <li>Access and update your personal information</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications</li>
            <li>Manage cookie preferences</li>
            <li>Export your data in a portable format</li>
          </ul>
          
          <h2>Contact Us</h2>
          <p>
            If you have any questions or concerns about our Privacy Policy or how we handle your personal 
            information, please contact us at privacy@lingomitra.com.
          </p>
        </div>
      </div>
    </section>
  );
}