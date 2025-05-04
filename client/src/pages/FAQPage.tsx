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
        a: "LingoMitra is a chat-based tutor that uses large language models to teach you how to think in a new language. It follows the Thinking Method, which means you answer first, then the AI helps you correct yourself."
      },
      {
        q: "Which languages are available today?",
        a: "German, Spanish, French, Hindi, Kannada, Japanese and Chinese. More languages are on the roadmap and you can vote inside the app."
      },
      {
        q: "Do I need to know English?",
        a: "Lessons are written in English for now. We plan to add full Telugu and Hindi interfaces soon."
      }
    ]
  },
  {
    category: "Pricing",
    items: [
      {
        q: "Is it free?",
        a: "The first two lessons in every language are free forever. After that you can unlock the full course with the Pro plan."
      },
      {
        q: "How much is Pro?",
        a: "Pro is ₹799 per year. That gives you unlimited lessons, offline caching and priority support."
      },
      {
        q: "Can I cancel any time?",
        a: "Yes. Go to Settings → Subscription → Cancel. You keep access until the renewal date."
      }
    ]
  },
  {
    category: "Features",
    items: [
      {
        q: "How is LingoMitra different from Duolingo or Memrise?",
        a: "We focus on guided discovery not flashcards. Every lesson is a live conversation where the tutor adapts after each sentence you produce."
      },
      {
        q: "Can I speak instead of type?",
        a: "Yes. Tap the mic icon to enable speech. The app transcribes locally, sends only the text to the AI, then speaks the reply back."
      },
      {
        q: "Will it work offline?",
        a: "If you install the app as a PWA you can cache favourite lessons and review them without a connection. Speaking features need internet."
      },
      {
        q: "Does it support streaks and progress tracking?",
        a: "A streak calendar and per-language progress bars motivate you. You can also reset or hide streaks if you prefer zero-pressure learning."
      }
    ]
  },
  {
    category: "Privacy and Security",
    items: [
      {
        q: "Are my chats private?",
        a: "Chats are encrypted in transit and at rest. We never sell or share your data."
      },
      {
        q: "How do I delete my data?",
        a: "Open Settings → Privacy → Delete account. This wipes all messages, streaks and subscription info within 24 hours."
      },
      {
        q: "Who can I contact for support?",
        a: "Use the in-app chat or email product@lingomitra.com. We reply within one business day."
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
          <a href="mailto:product@lingomitra.com">Chat with support</a>
        </Button>
      </div>
    </div>
  );
}