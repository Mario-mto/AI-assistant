import { useState, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import Button from '../ui/Button'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  disabled: boolean
}

export default function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim())
      setMessage('')

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Auto-expand textarea
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? 'Configure ta clé API dans Config pour commencer...'
              : 'Pose une question à ton coach...'
          }
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all"
          style={{ maxHeight: '150px' }}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading || disabled}
          className="px-6"
        >
          {isLoading ? '...' : '💬'}
        </Button>
      </div>

      {isLoading && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <div className="flex gap-1">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
              •
            </span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
              •
            </span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
              •
            </span>
          </div>
          <span>Coach est en train d'écrire...</span>
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Appuie sur <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">Entrée</kbd>{' '}
        pour envoyer, <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">Shift + Entrée</kbd> pour une nouvelle ligne
      </p>
    </div>
  )
}
