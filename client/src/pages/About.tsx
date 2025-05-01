import { APP_NAME } from "@/lib/constants";
import React from "react";

export default function About() {
  return (
    <section className="page-content">
      <div className="container">
        <div className="page-header">
          <h1>About {APP_NAME}</h1>
        </div>
        
        <div className="content-section">
          <h2>Our Mission</h2>
          <p>
            At {APP_NAME}, we believe that language learning should be natural, engaging, and effective. 
            Our mission is to help you master new languages by recognizing patterns, building vocabulary step by step, 
            and developing a deep understanding of language structure through conversation.
          </p>
          
          <h2>Our Approach</h2>
          <p>
            Traditional language learning often focuses on memorization and rigid grammar rules. 
            We take a different approach - we believe in learning through interaction, conversation, 
            and pattern recognition. Our AI-powered tutor adapts to your learning style, providing 
            personalized guidance that helps you progress at your own pace.
          </p>
          
          <h2>Our Story</h2>
          <p>
            {APP_NAME} was founded by a group of linguists, educators, and technology enthusiasts who 
            were frustrated with traditional language learning methods. We combined our expertise in language 
            acquisition, artificial intelligence, and educational psychology to create a platform that makes 
            language learning more natural and effective.
          </p>
          
          <h2>Our Technology</h2>
          <p>
            Powered by advanced AI language models, {APP_NAME} creates a conversational learning 
            experience that adapts to your progress. Our system tracks what you've learned, identifies 
            areas where you might be struggling, and tailors future lessons to reinforce your knowledge 
            while introducing new concepts at the right pace.
          </p>
        </div>
      </div>
    </section>
  );
}