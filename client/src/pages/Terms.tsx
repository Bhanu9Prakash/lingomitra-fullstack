import { APP_NAME } from "@/lib/constants";
import React from "react";

export default function Terms() {
  const lastUpdated = "April 30, 2023";

  return (
    <section className="page-content">
      <div className="container">
        <div className="page-header">
          <h1>Terms of Service</h1>
          <p className="last-updated">Last Updated: {lastUpdated}</p>
        </div>
        
        <div className="content-section">
          <p>
            These Terms of Service ("Terms") govern your access to and use of {APP_NAME}'s website, 
            applications, and services. By using our platform, you agree to these Terms. Please read 
            them carefully.
          </p>
          
          <h2>1. Account Registration</h2>
          <p>
            To access certain features of {APP_NAME}, you may need to create an account. You are responsible 
            for maintaining the confidentiality of your account credentials and for all activities that occur 
            under your account. You must provide accurate and complete information when creating your account 
            and keep your information updated.
          </p>
          
          <h2>2. User Conduct</h2>
          <p>When using {APP_NAME}, you agree not to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Attempt to gain unauthorized access to any part of our service</li>
            <li>Use our platform for any illegal or unauthorized purpose</li>
            <li>Interfere with or disrupt the functionality of our service</li>
            <li>Share your account credentials with others</li>
            <li>Post offensive, harmful, or inappropriate content</li>
          </ul>
          
          <h2>3. Intellectual Property</h2>
          <p>
            All content and materials available on {APP_NAME}, including but not limited to text, graphics, 
            logos, images, audio clips, and software, are the property of {APP_NAME} or its licensors and 
            are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, 
            distribute, modify, or create derivative works from any content without our explicit permission.
          </p>
          
          <h2>4. Subscription and Payments</h2>
          <p>
            {APP_NAME} offers various subscription plans. By subscribing to a paid plan, you agree to pay 
            the applicable fees as they become due. We may change our fees at any time, but will provide 
            advance notice before changes take effect. All payments are non-refundable unless required by law.
          </p>
          
          <h2>5. Termination</h2>
          <p>
            We may terminate or suspend your account and access to our service at our sole discretion, without 
            prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, 
            or third parties, or for any other reason.
          </p>
          
          <h2>6. Disclaimer of Warranties</h2>
          <p>
            {APP_NAME} is provided "as is" without warranties of any kind, either express or implied. We do not 
            guarantee that our service will be uninterrupted, secure, or error-free, or that defects will be corrected.
          </p>
          
          <h2>7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, {APP_NAME} shall not be liable for any indirect, incidental, 
            special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly 
            or indirectly, or any loss of data, use, goodwill, or other intangible losses.
          </p>
          
          <h2>8. Changes to Terms</h2>
          <p>
            We may revise these Terms from time to time. The most current version will always be posted on our website. 
            By continuing to use {APP_NAME} after any changes, you accept the revised Terms.
          </p>
          
          <h2>9. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at terms@lingomitra.com.
          </p>
        </div>
      </div>
    </section>
  );
}