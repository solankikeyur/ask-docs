import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary-gradient text-white">
                <AppLogoIcon className="size-4" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold tracking-tight text-on-surface">
                    AskDocs
                </span>
            </div>
        </>
    );
}
