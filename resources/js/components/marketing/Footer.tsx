import { BookOpen } from 'lucide-react';

const footerLinks = {
    Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
    Company: ['About', 'Blog', 'Careers', 'Press'],
    Resources: ['Documentation', 'API Reference', 'Status', 'Community'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
};

export function Footer() {
    return (
        <footer className="border-t border-outline-variant/15 bg-surface-container-low px-4 py-16">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
                    {/* Brand */}
                    <div>
                        <div className="mb-4 flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-primary-gradient text-primary-foreground">
                                <BookOpen size={16} />
                            </span>
                            <span className="text-sm font-bold text-on-surface">AskDocs</span>
                        </div>
                        <p className="mb-6 max-w-xs text-sm leading-relaxed text-on-surface-variant">
                            The intelligent document Q&A platform trusted by researchers, engineers, and enterprises.
                        </p>
                        <div className="flex gap-2">
                            {['𝕏', 'in', 'gh'].map((icon) => (
                                <a
                                    key={icon}
                                    href="#"
                                    className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-surface-container text-xs text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                                >
                                    {icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([section, links]) => (
                        <div key={section}>
                            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface">
                                {section}
                            </h4>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a
                                            href="#"
                                            className="text-sm text-on-surface-variant transition-colors hover:text-on-surface"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-outline-variant/15 pt-8 text-xs text-on-surface-variant md:flex-row">
                    <p>© {new Date().getFullYear()} AskDocs. All rights reserved.</p>
                    <p>Built with ❤️ using Laravel, React & Inertia.js</p>
                </div>
            </div>
        </footer>
    );
}
