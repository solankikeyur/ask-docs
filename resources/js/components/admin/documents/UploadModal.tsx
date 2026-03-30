import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadModalProps {
    onClose: () => void;
}

export function UploadModal({ onClose }: UploadModalProps) {
    const [dragging, setDragging] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        document: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/documents', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-[var(--radius-xl)] bg-surface-container-lowest p-6 shadow-ambient animate-in fade-in zoom-in duration-200">
                <form onSubmit={submit}>
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-on-surface">Upload Document</h2>
                            <p className="text-xs text-on-surface-variant">Uploaded docs can be assigned to users after indexing.</p>
                        </div>
                        <button type="button" onClick={onClose} className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-low transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            if (e.dataTransfer.files[0]) setData('document', e.dataTransfer.files[0]);
                        }}
                        className={`flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border-2 border-dashed p-10 text-center transition-all ${
                            dragging
                                ? 'border-primary bg-primary-container/20'
                                : 'border-outline-variant/30 hover:border-primary/30 hover:bg-surface-container-low'
                        }`}
                    >
                        <div className={`p-3 rounded-full ${dragging ? 'bg-primary/10' : 'bg-surface-container-high'}`}>
                            <Upload size={28} className={dragging ? 'text-primary' : 'text-on-surface-variant'} />
                        </div>

                        {data.document ? (
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-primary truncate max-w-[250px]">{data.document.name}</p>
                                <p className="text-xs text-on-surface-variant">{(data.document.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-on-surface">Drag & Drop files here or browse</p>
                                <p className="text-[10px] text-on-surface-variant">Supports PDF, DOCX, TXT up to 10MB</p>
                            </div>
                        )}

                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={(e) => setData('document', e.target.files?.[0] || null)}
                        />

                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="mt-2"
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            {data.document ? 'Change File' : 'Browse Files'}
                        </Button>
                    </div>

                    {errors.document && (
                        <p className="mt-3 rounded-md bg-error-container/20 p-2 text-xs text-error font-medium">
                            {errors.document}
                        </p>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button size="sm" disabled={processing || !data.document}>
                            {processing ? 'Uploading…' : 'Upload & Index'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
