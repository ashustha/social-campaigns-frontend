import { X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}

export function ConfirmationModal({
  isOpen = true,
  onClose,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    if (onClose) onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  const confirmButtonClass = confirmVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white';

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Title Section */}
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-base font-normal text-gray-900 leading-relaxed">
            {title}
          </h3>
        </div>

        {/* Message Section */}
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
        </div>

        {/* Actions Section */}
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors cursor-pointer font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-2 rounded-md transition-colors cursor-pointer font-medium ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}