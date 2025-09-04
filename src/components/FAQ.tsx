import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQSchema } from '@/components/FAQSchema';

const faqData = [
  {
    question: "What are dividends?",
    answer: "Dividends are payments made by companies to their shareholders, typically from profits. They're usually paid quarterly and represent a share of the company's earnings distributed to stockholders."
  },
  {
    question: "How do I track my dividend income?",
    answer: "You can track dividend income by manually adding your dividend-paying stocks and specifying your share counts. Our platform automatically calculates your projected dividend income across your entire portfolio."
  },
  {
    question: "What is the dividend snowball effect?",
    answer: "The dividend snowball effect occurs when you reinvest your dividend payments to buy more shares, which then generate more dividends. Over time, this creates a compounding effect where your dividend income grows exponentially."
  },
  {
    question: "How often are dividends paid?",
    answer: "Most companies pay dividends quarterly (every three months), but some pay monthly, semi-annually, or annually. The payment schedule depends on the company's dividend policy."
  },
  {
    question: "What is a good dividend yield?",
    answer: "A good dividend yield typically ranges from 2-6%, depending on the sector and company stability. Higher yields aren't always better - they might indicate company distress. Focus on sustainable yields with a history of growth."
  },
  {
    question: "How are dividends taxed?",
    answer: "Qualified dividends are typically taxed at capital gains rates (0%, 15%, or 20% depending on income). Non-qualified dividends are taxed as ordinary income. Consult a tax professional for specific guidance."
  },
  {
    question: "What is DRIP (Dividend Reinvestment Plan)?",
    answer: "DRIP allows you to automatically reinvest dividends to purchase additional shares of the same stock, often without paying brokerage fees. This accelerates the compounding effect of dividend investing."
  },
  {
    question: "Can dividend stocks lose value?",
    answer: "Yes, dividend stocks can decline in value like any stock. While dividends provide income, they don't guarantee against capital losses. It's important to diversify and research companies thoroughly."
  },
  {
    question: "How do I start dividend investing?",
    answer: "Start by opening a brokerage account, researching dividend-paying stocks or ETFs, and beginning with small investments. Focus on companies with strong financials and a history of consistent dividend payments."
  },
  {
    question: "What's the difference between dividend yield and dividend growth?",
    answer: "Dividend yield is the annual dividend payment divided by the stock price. Dividend growth refers to the rate at which companies increase their dividend payments over time. Both are important metrics for dividend investors."
  }
];

export function FAQ() {
  return (
    <section>
      <FAQSchema faqs={faqData} />
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}