interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title?: string;
}

export function AlertModal({
  isOpen,
  onClose,
  message,
  title,
}: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Message Section */}
        <div className="px-6 pt-6 pb-4">
          {title && (
            <h3 className="text-base font-normal text-gray-900 leading-relaxed mb-3">
              {title}
            </h3>
          )}
          <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
        </div>

        {/* Action Button */}
        <div className="px-6 pb-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors cursor-pointer font-medium text-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}