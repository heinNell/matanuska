import React, { ChangeEvent, DragEvent, useRef, useState } from "react";

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onFileSelect: (files: FileList | null) => void;
  error?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  multiple = false,
  onFileSelect,
  error,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFiles(files);
      onFileSelect(files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const files = e.target.files;
    setSelectedFiles(files);
    onFileSelect(files);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileNames = () => {
    if (!selectedFiles) return null;
    const names = Array.from(selectedFiles).map((file) => file.name);
    return names.join(", ");
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          disabled
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : isDragging
              ? "border-blue-500 bg-blue-50"
              : error
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className={`text-sm ${disabled ? "text-gray-400" : "text-gray-600"}`}>
          {selectedFiles && selectedFiles.length > 0 ? (
            <div>
              <p className="font-medium text-green-600 mb-1">
                {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
              </p>
              <p className="text-xs text-gray-500 truncate" title={getFileNames() || ""}>
                {getFileNames()}
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-1">
                {disabled ? "File upload disabled" : "Drag and drop files here, or click to select"}
              </p>
              {accept && <p className="text-xs text-gray-400">Accepted formats: {accept}</p>}
              {multiple && <p className="text-xs text-gray-400">You can select multiple files</p>}
            </div>
          )}
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FileUpload;
