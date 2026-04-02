import { Send, Settings, Mic, ChevronDown, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
    activeDocName: string;
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function ChatInput({ activeDocName, onSend, disabled }: ChatInputProps) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (input.trim() && !disabled) {
            onSend(input);
            setInput('');
        }
    };

    // Auto-resize logic
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Reset height to calculate scrollHeight correctly
        textarea.style.height = 'auto';
        // Set new height based on scrollHeight, capped at 240px
        const newHeight = Math.min(textarea.scrollHeight, 240);
        textarea.style.height = `${newHeight}px`;
    }, [input]);

    const docDisplayName = activeDocName.split('.')[0].replace(/_/g, ' ');

    return (
        <div className="border-t border-outline-variant/10 bg-surface-container-low p-4">
            <div className={`flex flex-col rounded-2xl border border-outline-variant/50 bg-surface-container-lowest transition-all focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5 ${disabled ? 'opacity-60 cursor-not-allowed' : 'shadow-ambient'}`}>
                {/* Textarea Area */}
                <div className="p-3">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        disabled={disabled}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        className={`w-full resize-none bg-transparent text-sm leading-relaxed text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none scrollbar-thin ${disabled ? 'cursor-not-allowed' : ''}`}
                        placeholder={disabled ? "Processing previous request..." : `Ask anything about ${docDisplayName}…`}
                        style={{ minHeight: '24px' }}
                    />
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between border-t border-outline-variant/10 px-3 py-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSend}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-gradient text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                            disabled={!input.trim() || disabled}
                            title="Send Message"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

