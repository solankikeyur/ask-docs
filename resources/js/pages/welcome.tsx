import { Head, usePage } from '@inertiajs/react';
import { Navbar } from '@/components/marketing/Navbar';
import { HeroSection } from '@/components/marketing/HeroSection';
import { FeaturesSection } from '@/components/marketing/FeaturesSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { TestimonialsSection } from '@/components/marketing/TestimonialsSection';
import { PricingSection } from '@/components/marketing/PricingSection';
import { CTASection } from '@/components/marketing/CTASection';
import { Footer } from '@/components/marketing/Footer';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="AskDocs — AI-Powered Document Q&A">
                <meta
                    name="description"
                    content="Upload your documents and ask any question. AskDocs uses AI to give precise, cited answers from your own knowledge base."
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-background text-on-surface antialiased">
                <Navbar isAuthenticated={!!auth.user} canRegister={canRegister} />
                <main>
                    <HeroSection />
                    <FeaturesSection />
                    <HowItWorksSection />
                    <TestimonialsSection />
                    <PricingSection />
                    <CTASection />
                </main>
                <Footer />
            </div>
        </>
    );
}
