import { createInertiaApp } from '@inertiajs/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        const resolve = (name: string) => {
            switch (true) {
                case name === 'welcome':
                    return null;
                case name.startsWith('admin/'):
                    return null; // Admin pages manage their own layouts
                case name.startsWith('user/'):
                    return null; // User pages manage their own layouts
                case name.startsWith('auth/'):
                    return AuthLayout;
                case name.startsWith('settings/'):
                    return [AppLayout, SettingsLayout];
                default:
                    return AppLayout; // Standard persistent layout
            }
        };

        return resolve(name);
    },
    strictMode: true,
    withApp(app) {
        return <TooltipProvider delayDuration={0}>{app}</TooltipProvider>;
    },
    progress: {
        color: '#005ac2',
    },
});

// This will set light / dark mode on load...
initializeTheme();
