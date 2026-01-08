import { useState } from 'react'
import { useAICoach } from '../../hooks/useAICoach'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Select from '../ui/Select'

export default function APIKeySettings() {
  const { settings, updateSettings } = useAICoach()
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [model, setModel] = useState(settings.model)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSave = () => {
    updateSettings({ apiKey, model, enabled: apiKey.length > 0 })
    setTestResult(null)
    alert('Clé API sauvegardée ! ✅')
  }

  const handleTest = async () => {
    if (!apiKey) {
      setTestResult({ success: false, message: 'Entre d\'abord une clé API' })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: 'Test' }]
          }],
          generationConfig: {
            maxOutputTokens: 10,
          },
        }),
      })

      if (response.ok) {
        setTestResult({ success: true, message: '✅ Connexion réussie ! Gemini fonctionne.' })
      } else {
        const error = await response.json().catch(() => null)
        setTestResult({
          success: false,
          message: `❌ Erreur: ${error?.error?.message || response.statusText}`,
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Erreur de connexion: ${error instanceof Error ? error.message : 'Inconnue'}`,
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          ℹ️ <strong>Obtiens ta clé API Google (Gemini) GRATUITE :</strong>
          <br />
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
          >
            https://aistudio.google.com/app/apikey
          </a>
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          💡 Ta clé est stockée localement sur ton appareil uniquement.
          <br />
          🎁 Gratuit : 15 requêtes/minute et 1M tokens/jour !
        </p>
      </div>

      <Input
        label="Clé API Google (Gemini)"
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="AIza..."
      />

      <Select
        label="Modèle"
        value={model}
        onChange={(e) => setModel(e.target.value as any)}
        options={[
          { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommandé - Rapide)' },
          { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Plus performant)' },
          { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview (Dernier modèle)' },
          { value: 'gemini-flash-latest', label: 'Auto (Toujours la dernière version)' },
        ]}
      />

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-medium">Activer le coach IA</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Permet au coach de t'aider pendant tes séances
          </p>
        </div>
        <button
          onClick={() => updateSettings({ enabled: !settings.enabled })}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            settings.enabled && apiKey.length > 0 ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          disabled={apiKey.length === 0}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              settings.enabled && apiKey.length > 0 ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-medium">Guidage en temps réel</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Le coach t'encourage pendant tes séances actives
          </p>
        </div>
        <button
          onClick={() => updateSettings({ liveCoachingEnabled: !settings.liveCoachingEnabled })}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            settings.liveCoachingEnabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              settings.liveCoachingEnabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleTest} variant="secondary" disabled={isTesting || !apiKey}>
          {isTesting ? 'Test en cours...' : 'Tester la connexion'}
        </Button>
        <Button onClick={handleSave} disabled={!apiKey}>
          Sauvegarder
        </Button>
      </div>

      {testResult && (
        <div
          className={`p-3 rounded-lg ${
            testResult.success
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}
        >
          {testResult.message}
        </div>
      )}

      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
        <p className="text-xs text-gray-700 dark:text-gray-300">
          🎉 <strong>Gemini est GRATUIT !</strong>
          <br />
          • Quota gratuit : 15 requêtes/minute
          <br />
          • 1 million de tokens par jour
          <br />
          • 1500 requêtes par jour
          <br />
          💡 Largement suffisant pour un usage personnel !
        </p>
      </div>
    </div>
  )
}
