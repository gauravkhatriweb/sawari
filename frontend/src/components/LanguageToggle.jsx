/**
 * LanguageToggle.jsx - Multi-Language Selection Component
 * 
 * A toggle component for switching between different language options.
 * Supports English, Urdu, and Roman Urdu for Pakistani users.
 * Features accessible design with ARIA attributes and visual feedback.
 * 
 * Key Features:
 * - Multi-language support (EN, Urdu, Roman)
 * - Accessible button group with ARIA labels
 * - Visual active state indication
 * - Responsive design
 * - Clean, modern interface
 * - Keyboard navigation support
 * 
 * Supported Languages:
 * - EN: English
 * - اردو: Urdu (native script)
 * - Roman: Roman Urdu (Latin script)
 * 
 * Usage:
 * ```jsx
 * <LanguageToggle
 *   value={currentLanguage}
 *   onChange={(lang) => setLanguage(lang)}
 * />
 * ```
 */

import React from 'react'

/**
 * LanguageToggle Component
 * 
 * Multi-language selection toggle for switching between English, Urdu, and Roman Urdu.
 * 
 * @param {string} value - Currently selected language code ('en', 'ur', 'ru')
 * @param {Function} onChange - Callback function when language is changed
 */
const LanguageToggle = ({ value = 'en', onChange }) => {
  // Available language options
  const languages = [
    { id: 'en', label: 'EN' },
    { id: 'ur', label: 'اردو' },
    { id: 'ru', label: 'Roman' },
  ];

  return (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
      {languages.map(lang => (
        <button
          key={lang.id}
          onClick={() => onChange?.(lang.id)}
          className={`px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 ${
            value === lang.id ? 'bg-gray-100 font-medium' : ''
          }`}
          aria-pressed={value === lang.id}
          aria-label={`Switch to ${lang.label} language`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}

export default LanguageToggle