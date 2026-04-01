import { Send } from 'lucide-react';
import { useState } from 'react';

interface ChatInputProps {
    activeDocName: string;
    onSend: (message: string) => void;
}

export function ChatInput({ activeDocName, onSend }: ChatInputProps) {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim()) {
            onSend(input);
            setInput('');
        }
    };

    return (
        <div className="border-t border-outline-variant/15 bg-surface-container-low p-4">
            <div className="flex items-end gap-2 rounded-[var(--radius-lg)] border-ghost bg-surface-container-lowest p-3">
                <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    className="flex-1 resize-none bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                    placeholder={`Ask anything about ${activeDocName.split('_')[0]}…`}
                />
                <button
                    onClick={handleSend}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-gradient text-primary-foreground disabled:opacity-40"
                    disabled={!input.trim()}
                >
                    <Send size={14} />
                </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-on-surface-variant">
                Answers are grounded in your assigned documents. AI will always cite the source page.
            </p>
        </div>
    );
}
