import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

export default function CustomDropdown({ value, options, onChange, style, openUp = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = options.find(o => o.value === value) || options[0]

  return (
    <div ref={ref} className="dropdown-wrapper" style={style}>
      <button
        type="button"
        className="dropdown-toggle"
        onClick={() => setIsOpen(o => !o)}
      >
        <span>{selected.label}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} color="var(--text-muted)" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="dropdown-menu"
            style={openUp ? {
              top: 'auto',
              bottom: 'calc(100% + 6px)',
            } : {}}
            initial={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {options.map(opt => (
              <div
                key={opt.value}
                className={`dropdown-item ${opt.value === value ? 'selected' : ''}`}
                onClick={() => { onChange(opt.value); setIsOpen(false) }}
              >
                <span style={{ flex: 1 }}>{opt.label}</span>
                {opt.value === value && <Check size={14} />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
