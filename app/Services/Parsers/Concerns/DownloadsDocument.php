<?php

namespace App\Services\Parsers\Concerns;

use App\Models\Document;
use Exception;

trait DownloadsDocument
{
    /**
     * Streams the document from its storage disk into /tmp and returns the temp path.
     */
    protected function downloadToTemp(Document $document, string $prefix = 'doc_upload_'): string
    {
        $tempFile = tempnam(sys_get_temp_dir(), $prefix);

        $stream = $document->readStream();

        if (! is_resource($stream)) {
            throw new Exception("Unable to open stream for document ID {$document->id}");
        }

        try {
            $dest = fopen($tempFile, 'wb');
            stream_copy_to_stream($stream, $dest);
        } finally {
            if (is_resource($stream)) {
                fclose($stream);
            }
            if (isset($dest) && is_resource($dest)) {
                fclose($dest);
            }
        }

        return $tempFile;
    }
}
