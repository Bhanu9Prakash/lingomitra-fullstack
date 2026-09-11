import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

// FAQ data structure
const faqs = [
  {
    category: "General",
    items: [
      {
        q: "What is LingoMitra?",
        a: "LingoMitra combines explanations, sentence practice and later review. All seven languages have authored opening checks; the full courses also offer notes and self-practice. Optional AI coaching is separate from assessment. Language Transfer is an inspiration for guided thinking; LingoMitra is independent and is not affiliated with it."
      },
      {
        q: "Which languages are available today?",
        a: "German, Spanish, French, Hindi, Kannada, Japanese and Chinese."
      },
      {
        q: "Do I need to know English?",
        a: "The current teaching language is English. Your native language may be different from your strongest language for explanations. You can record languages you know in Settings. Hindi and Telugu teaching versions are not available yet."
      }
    ]
  },
  {
    category: "Accounts and access",
    items: [
      { q: "Why can optional AI have a daily limit?", a: "All lessons stay open. To keep the site free, AI coaching has a daily request allowance and voice has a separate clip allowance. A limit affects optional assistance; authored hints, typed practice and saved learning remain available. No upgrade is needed." },
      { q: "Is it free?", a: "All 209 lessons across seven languages are available without a LingoMitra subscription or payment." },
      { q: "How do I sign in?", a: "Use Continue with ChatGPT. LingoMitra does not need a separate password." },
      { q: "Will my progress sync?", a: "Yes. Sign in with the same ChatGPT account on another device to see your saved lesson progress, review queue and conversations." },
      { q: "Where is my old account history?", a: "Accounts from the previous hosting service are not automatically merged. Historical progress needs to be imported from the previous database after the account owner is verified." }
    ]
  },
  {
    category: "Features",
    items: [
      {
        q: "What do the guided opening lessons assess?",
        a: "Our focus is understanding a pattern well enough to make a new sentence and retrieve it later. We have not established that LingoMitra produces better learning than other products."
      },
      {
        q: "Can I speak instead of type?",
        a: "You can always type, listen when audio is available, or practice aloud privately. Optional submitted recordings are sent for transcription; check and edit the transcript before sending it. Speech-recognition uncertainty is not a language error, and transcription matching is not a pronunciation score."
      },
      {
        q: "Will it work offline?",
        a: "An internet connection is required to sign in, load lessons and sync learning. The installed app shows an offline notice when disconnected."
      },
      {
        q: "Does it support streaks and progress tracking?",
        a: "Your profile separates course completion from assessed starter attempts. Streaks and time describe activity, not mastery. You can reset a language from Settings."
      }
    ]
  },
  {
    category: "Privacy and Security",
    items: [
      {
        q: "Are my chats private?",
        a: "Your drafts, attempts and chats are account-scoped. Optional AI messages and submitted recordings are processed by the configured provider. LingoMitra does not store raw voice recordings; provider processing follows its own data terms."
      },
      {
        q: "How do I delete my data?",
        a: "Open Settings and choose Delete LingoMitra Data. This removes your account-linked progress, drafts, attempts, chats, contact messages and settings. Your ChatGPT account remains active."
      },
      {
        q: "Who can I contact for support?",
        a: "Use the Contact page to leave a message for the LingoMitra team."
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-24">
      <header className="mb-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-primary/10 p-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
          Everything you want to know before you start thinking in a new language.
        </p>
      </header>

      {/* Optional anchor list */}
      <nav className="mb-10 flex flex-wrap gap-4 justify-center">
        {faqs.map(({ category }) => (
          <a 
            key={category} 
            href={`#${category.toLowerCase().replace(/\s+/g, '-')}`} 
            className="text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            {category}
          </a>
        ))}
      </nav>

      <div className="space-y-12 mb-16">
        {faqs.map(({ category, items }) => (
          <section 
            key={category} 
            id={category.toLowerCase().replace(/\s+/g, '-')} 
            className="scroll-mt-24"
          >
            <h2 className="mb-6 text-2xl font-semibold">{category}</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {items.map(({ q, a }) => (
                <AccordionItem 
                  key={q} 
                  value={q}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="text-left py-4 font-medium">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 pt-1">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-4 bg-muted/30 p-8 rounded-xl">
        <p className="text-center text-lg font-medium">Still need help?</p>
        <Button asChild>
          <a href="/contact">Leave a support message</a>
        </Button>
      </div>
    </div>
  );
}