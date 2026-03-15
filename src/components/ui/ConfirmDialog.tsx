import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

type DialogType = 'info' | 'warning' | 'danger' | 'success';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: DialogType;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

const typeConfig: Record<DialogType, {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  confirmVariant: 'primary' | 'danger';
}> = {
  info: {
    icon: <Info className="h-6 w-6" />,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    confirmVariant: 'primary',
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6" />,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    confirmVariant: 'primary',
  },
  danger: {
    icon: <XCircle className="h-6 w-6" />,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confirmVariant: 'danger',
  },
  success: {
    icon: <CheckCircle className="h-6 w-6" />,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    confirmVariant: 'primary',
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
}) => {
  const config = typeConfig[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-start gap-4 p-6">
                <div className={cn('flex-shrink-0 p-3 rounded-full', config.iconBg)}>
                  <div className={config.iconColor}>{config.icon}</div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{message}</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                  {cancelLabel}
                </Button>
                <Button
                  variant={config.confirmVariant}
                  onClick={onConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processing...
                    </>
                  ) : (
                    confirmLabel
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Hook for easy confirm dialog usage
interface UseConfirmDialogOptions {
  title: string;
  message: string;
  type?: DialogType;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [options, setOptions] = React.useState<UseConfirmDialogOptions | null>(null);
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = React.useCallback((opts: UseConfirmDialogOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  const handleConfirm = React.useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  const ConfirmDialogComponent = React.useMemo(() => {
    if (!options) return null;
    
    return (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        {...options}
      />
    );
  }, [isOpen, options, handleClose, handleConfirm]);

  return { confirm, ConfirmDialogComponent };
};

export default ConfirmDialog;
