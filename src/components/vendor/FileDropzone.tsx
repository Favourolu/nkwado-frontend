"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: Record<string, string[]>;
}

export function FileDropzone({ label, files, onChange, multiple = false, accept }: FileDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      onChange(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
    },
    [files, multiple, onChange]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    multiple,
    accept,
  });

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-md border border-dashed p-4 text-center text-sm transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-input hover:bg-accent"
        )}
      >
        <input {...getInputProps()} />
        <p className="text-muted-foreground">
          {isDragActive ? "Drop files here" : "Drag & drop, or click to select"}
        </p>
      </div>
      {fileRejections.length > 0 && (
        <p className="text-sm text-destructive">
          {fileRejections.map((r) => r.file.name).join(", ")}{" "}
          {fileRejections.length === 1 ? "isn't a supported file type" : "aren't supported file types"}.
          Please upload a PDF, JPG, or PNG.
        </p>
      )}
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-md border px-2 py-1 text-sm"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
