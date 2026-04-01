// Credit: https://usehooks-ts.com/
import { useState } from 'react';

export type CopiedValue = string | null;
export type CopyFn = (text: string) => Promise<boolean>;
export type UseClipboardReturn = [CopiedValue, CopyFn];

function copyViaExecCommand(text: string): boolean {
    if (typeof document === 'undefined') {
        return false;
    }

    if (!document.body) {
        return false;
    }

    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);

        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);

        return ok;
    } catch {
        return false;
    }
}

export function useClipboard(): UseClipboardReturn {
    const [copiedText, setCopiedText] = useState<CopiedValue>(null);

    const copy: CopyFn = async (text) => {
        if (!text) {
            setCopiedText(null);

            return false;
        }

        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                setCopiedText(text);

                return true;
            }
        } catch (error) {
            console.warn('Copy failed, falling back', error);
        }

        const ok = copyViaExecCommand(text);

        setCopiedText(ok ? text : null);

        return ok;
    };

    return [copiedText, copy];
}
