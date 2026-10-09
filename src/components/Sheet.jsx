import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { bindBackButton, haptic } from '../utils/api'

const EXIT_MS = 220
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])'

/**
 * Modal bottom sheet: portal to <body>, Escape / backdrop / Telegram BackButton close it,
 * focus moves inside and is trapped, then returns to the trigger; page scroll is locked.
 * `children` may be a function receiving `requestClose` (closes with the exit animation).
 */
export default function Sheet({ onClose, labelledBy, className = '', children }) {
  const [closing, setClosing] = useState(false)
  const sheetRef = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const timer = useRef(null)

  const requestClose = useCallback(() => {
    if (timer.current) return
    haptic('light')
    setClosing(true)
    timer.current = setTimeout(() => closeRef.current(), EXIT_MS)
  }, [])

  useEffect(() => {
    const previous = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    sheetRef.current?.focus({ preventScroll: true })
    const unbindBack = bindBackButton(requestClose)
    return () => {
      clearTimeout(timer.current)
      document.body.style.overflow = overflow
      unbindBack()
      if (previous && typeof previous.focus === 'function') previous.focus({ preventScroll: true })
    }
  }, [requestClose])

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      requestClose()
      return
    }
    if (event.key !== 'Tab' || !sheetRef.current) return
    const items = [...sheetRef.current.querySelectorAll(FOCUSABLE)]
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div className={`sheet-root ${closing ? 'is-closing' : ''}`} onKeyDown={onKeyDown}>
      <div className="sheet-backdrop" onClick={requestClose} aria-hidden="true" />
      <section
        ref={sheetRef}
        className={`sheet ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        {typeof children === 'function' ? children(requestClose) : children}
      </section>
    </div>,
    document.body,
  )
}
