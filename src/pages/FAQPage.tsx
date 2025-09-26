
import { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  
  // FAQ Data
  const faqData = {
    general: [
      {
        question: "What is KisanKart?",
        answer: "KisanKart is a platform that connects local farmers directly with consumers. We aim to eliminate middlemen, ensure farmers get fair prices for their produce, and provide consumers with fresh, locally-grown products."
      },
      {
        question: "How does KisanKart work?",
        answer: "Farmers register on our platform and list their products. Consumers can search for vendors near them using our map interface, browse products, and connect directly with farmers to purchase fresh produce."
      },
      {
        question: "Is KisanKart available in my area?",
        answer: "KisanKart is currently operational across many states in India. You can check availability in your area by entering your PIN code in the search bar on our home page or vendors page."
      },
      {
        question: "Do I need to create an account to use KisanKart?",
        answer: "While you can browse vendors without an account, creating an account allows you to save favorite vendors, track your purchases, and get personalized recommendations."
      },
      {
        question: "Is KisanKart free to use?",
        answer: "Yes, KisanKart is completely free for consumers. We charge a small commission from vendors for successful transactions to maintain our platform."
      }
    ],
    farmers: [
      {
        question: "How can I register as a vendor on KisanKart?",
        answer: "You can register as a vendor by clicking on the 'Become a Vendor' button on our homepage. You'll need to provide some basic information about yourself and your farm, and upload verification documents."
      },
      {
        question: "What documents do I need to become a verified vendor?",
        answer: "You'll need to provide proof of identity (Aadhaar or PAN card), proof of land ownership or farming activity, and any relevant certifications (e.g., organic certification if applicable)."
      },
      {
        question: "How long does the verification process take?",
        answer: "Our verification process typically takes 3-5 business days. Once your documents are verified, you can start listing your products on our platform."
      },
      {
        question: "How do I update my product listings?",
        answer: "After logging in to your vendor account, you can access your dashboard where you can add, update, or remove products, adjust pricing, and update stock information."
      },
      {
        question: "How will I receive payments?",
        answer: "Payments are typically handled directly between you and the consumer. We provide contact information and facilitate the connection, but transactions happen outside our platform."
      }
    ],
    consumers: [
      {
        question: "How do I find vendors near me?",
        answer: "You can use the search function on our homepage or vendors page to enter your PIN code or location. Our map interface will show you all verified vendors in your area."
      },
      {
        question: "How do I contact a vendor?",
        answer: "Each vendor profile includes contact information (phone number and email). You can contact them directly to inquire about products, prices, and purchase arrangements."
      },
      {
        question: "Can I get produce delivered to my home?",
        answer: "Delivery options depend on individual vendors. Some vendors offer delivery within certain areas, while others may require pickup from their farm or market location."
      },
      {
        question: "How do I know if a vendor is reliable?",
        answer: "All vendors on our platform go through a verification process. Look for the 'Verified' badge on vendor profiles. You can also check reviews and ratings from other consumers."
      },
      {
        question: "What if I have an issue with a purchase?",
        answer: "We recommend first contacting the vendor directly to resolve any issues. If you're unable to reach a resolution, you can contact our customer support team for assistance."
      }
    ],
    payments: [
      {
        question: "How do payments work on KisanKart?",
        answer: "KisanKart primarily facilitates connections between farmers and consumers. Payment arrangements are typically made directly between the parties, allowing for flexible options like cash, UPI, bank transfer, etc."
      },
      {
        question: "Are there any additional fees?",
        answer: "There are no additional fees for consumers. The prices you see are set by the vendors themselves. We charge vendors a small commission on successful transactions."
      },
      {
        question: "Is it safe to pay farmers directly?",
        answer: "All vendors on our platform are verified using government ID proof, making the process relatively safe. We recommend using traceable payment methods like UPI for added security."
      },
      {
        question: "Can I get a receipt for my purchase?",
        answer: "This depends on individual vendors. Many vendors can provide basic receipts upon request. We encourage you to ask for one if you need it for your records."
      }
    ]
  };

  // Filter FAQs based on search query
  const filteredFaqs = Object.entries(faqData).reduce((acc, [category, faqs]) => {
    if (searchQuery) {
      const filtered = faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
    } else {
      acc[category] = faqs;
    }
    return acc;
  }, {} as Record<string, typeof faqData.general>);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600 mb-8">
              Find answers to common questions about KisanKart, our farmers, and how our platform works.
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for questions..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          {!searchQuery && (
            <div className="flex justify-center mb-8 overflow-x-auto">
              <div className="inline-flex rounded-lg border border-gray-200 p-1">
                <Button
                  variant={activeTab === 'general' ? 'default' : 'ghost'}
                  className="rounded-md"
                  onClick={() => setActiveTab('general')}
                >
                  General
                </Button>
                <Button
                  variant={activeTab === 'farmers' ? 'default' : 'ghost'}
                  className="rounded-md"
                  onClick={() => setActiveTab('farmers')}
                >
                  For Farmers
                </Button>
                <Button
                  variant={activeTab === 'consumers' ? 'default' : 'ghost'}
                  className="rounded-md"
                  onClick={() => setActiveTab('consumers')}
                >
                  For Consumers
                </Button>
                <Button
                  variant={activeTab === 'payments' ? 'default' : 'ghost'}
                  className="rounded-md"
                  onClick={() => setActiveTab('payments')}
                >
                  Payments
                </Button>
              </div>
            </div>
          )}
          
          {/* FAQ Accordion */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {searchQuery ? (
              // Show search results
              Object.entries(filteredFaqs).length > 0 ? (
                <>
                  <p className="text-sm text-gray-500 mb-6">
                    Showing results for "{searchQuery}"
                  </p>
                  {Object.entries(filteredFaqs).map(([category, faqs]) => (
                    <div key={category} className="mb-8">
                      <h2 className="text-xl font-semibold mb-4 capitalize">{category}</h2>
                      <Accordion type="single" collapsible className="space-y-4">
                        {faqs.map((faq, index) => (
                          <AccordionItem 
                            key={index} 
                            value={`${category}-${index}`}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4 pt-2 text-gray-600">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                  <Button 
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                </div>
              )
            ) : (
              // Show tab content
              <Accordion type="single" collapsible className="space-y-4">
                {faqData[activeTab as keyof typeof faqData].map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 pt-2 text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
          
          {/* Contact Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Please reach out to our customer support team.
            </p>
            <Button size="lg">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FAQPage;
