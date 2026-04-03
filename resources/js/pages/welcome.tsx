import { Head, usePage } from '@inertiajs/react';
import { WelcomeHeader } from '@/components/welcome/WelcomeHeader';
import { WelcomeHero } from '@/components/welcome/WelcomeHero';
import { QuickStartCard } from '@/components/welcome/QuickStartCard';
import { FeatureGrid } from '@/components/welcome/FeatureGrid';

export default function Welcome() {
    const { auth } = usePage().props;

    const user =
        (auth as { user?: Record<string, unknown> | null } | undefined)?.user ??
        null;

    const role = typeof user?.role === 'string' ? user.role : null;
    const isAuthenticated = !!user;
    const isAdmin = role === 'admin';
    const isViewer = role === 'viewer';

    return (
        <>
            <Head title="AskDocs">
                <meta
                    name="description"
                    content="Admins upload and assign documents. Users chat with their assigned documents."
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
                <WelcomeHeader 
                    isAuthenticated={isAuthenticated} 
                    isAdmin={isAdmin} 
                    isViewer={isViewer} 
                />

                <main>
                    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
                        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                            <WelcomeHero 
                                isAuthenticated={isAuthenticated} 
                                isAdmin={isAdmin} 
                                isViewer={isViewer} 
                            />
                            
                            <div className="lg:sticky lg:top-24">
                                <QuickStartCard 
                                    isAuthenticated={isAuthenticated} 
                                    isAdmin={isAdmin} 
                                    isViewer={isViewer} 
                                />
                            </div>
                        </div>
                    </section>

                    <FeatureGrid />
                </main>
            </div>
        </>
    );
}
