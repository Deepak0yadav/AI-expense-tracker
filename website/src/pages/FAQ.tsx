import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const faqData: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: "Account",
    items: [
      { q: "How do I create an account?", a: "Download the app or visit the website, tap Sign Up, and follow the instructions. You'll verify your email to complete setup." },
      { q: "How do I reset my password?", a: "On the login screen, click Forgot password and enter your email. We'll send a reset link to help you set a new password." }
    ],
  },
  {
    category: "Payments",
    items: [
      { q: "What payment methods are accepted?", a: "We currently support major credit/debit cards and UPI/NetBanking (region dependent)." },
      { q: "How do I get a refund?", a: "Contact support with your transaction ID. Refunds are processed back to the original payment method as per our refund policy." }
    ],
  },
  {
    category: "Features",
    items: [
      { q: "How do I track my expenses?", a: "Add transactions manually or import from bank statements. View insights in the dashboard with categories and trends." },
      { q: "Can I export my data?", a: "Yes. Go to Settings > Data Export to download your data as CSV for backups or external analysis." }
    ],
  },
  {
    category: "Support",
    items: [
      { q: "Need more help?", a: "If your question isn’t answered here, please reach out to our support team." }
    ],
  },
];

export default function FAQ() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <section className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">Frequently Asked Questions</h1>
  <p className="text-muted-foreground mb-8">Quick answers to common questions. Can’t find what you’re looking for? <Link to="/#contact" className="text-primary underline-offset-4 hover:underline">Contact support</Link>.</p>

        <div className="space-y-8">
          {faqData.map((group) => (
            <div key={group.category}>
              <h2 className="text-xl font-semibold mb-3">{group.category}</h2>
              <Accordion type="single" collapsible className="w-full border rounded-lg divide-y">
                {group.items.map((item, idx) => (
                  <AccordionItem key={idx} value={`${group.category}-${idx}`}>
                    <AccordionTrigger className="text-left px-4">{item.q}</AccordionTrigger>
                    <AccordionContent className="px-4 text-muted-foreground">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-10 text-sm text-muted-foreground">
          Couldn’t find an answer? <Link to="/#contact" className="text-primary underline-offset-4 hover:underline">Get in touch</Link> and we’ll help you out.
        </div>
      </section>
    </main>
  );
}
