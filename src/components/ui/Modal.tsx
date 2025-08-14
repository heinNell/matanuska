import React from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/Button";

type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: MaxWidth;
  /** extra classes vir outer panel */
  className?: string;
  /** as jy nie die default footer wil hê nie */
  hideFooter?: boolean;
  /** custom footer */
  footer?: React.ReactNode;
}

const maxWidthClasses: Record<MaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  className,
  hideFooter = true,
  footer,
  ...rest
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // As jy 'n portal wil gebruik:
  // return createPortal( ... , document.body);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Panel */}
        <div
          className={[
            'inline-block w-full p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg',
            maxWidthClasses[maxWidth],
            className || '',
          ].join(' ')}
          onClick={(e) => e.stopPropagation()}
          {...rest}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
          {/* use id to bind with aria-labelledby */}
            <h3 id="modal-title" className="text-lg font-medium text-gray-900">
              {title}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="p-1"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-6">{children}</div>

          {/* Footer */}
          {!hideFooter && (
            <div className="flex justify-end gap-2">
              {footer ?? (
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
