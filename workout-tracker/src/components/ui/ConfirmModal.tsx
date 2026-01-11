import Modal from './Modal'
import Button from './Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{message}</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} fullWidth>
          {cancelText}
        </Button>
        <Button variant="danger" onClick={onConfirm} fullWidth>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}
