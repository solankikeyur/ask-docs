import { FileUp, Link2, MessageSquareText } from 'lucide-react';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

const features = [
    {
        title: 'Upload & index',
        description: 'Admins upload documents to make them available for Q&A.',
        icon: FileUp,
    },
    {
        title: 'Assign access',
        description: 'Grant each user access only to the documents they need.',
        icon: Link2,
    },
    {
        title: 'Chat per document',
        description: 'Users ask questions and keep chat history tied to a document.',
        icon: MessageSquareText,
    },
];

export function FeatureGrid() {
    return (
        <section className="border-t border-border/60 bg-card/40">
            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-3 md:gap-8">
                {features.map(({ title, description, icon: Icon }) => (
                    <Card
                        key={title}
                        className="border-border/60 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                        <CardHeader>
                            <div className="mb-1 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary shadow-sm shadow-primary/5">
                                <Icon size={16} />
                            </div>
                            <CardTitle className="text-base font-bold">
                                {title}
                            </CardTitle>
                            <CardDescription className="leading-relaxed">
                                {description}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </section>
    );
}
