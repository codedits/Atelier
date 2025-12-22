import { useEffect, useState } from 'react'

type Props = {
  context?: 'checkout' | 'cart' | 'generic'
  intervalMs?: number
}

const MESSAGES: Record<string, string[]> = {
  checkout: [
    'Almost there — your sparkle awaits!',
    'Friendly tip: double-check your delivery address ✨',
    'Need help? We can assist with sizing and care.'
  ],
  cart: [
    'Nice picks — your future-self will thank you!',
    'Fun fact: polishing keeps gold shiny for years ✨',
    'Pro tip: add a gift note for a surprise touch.'
  ],
  generic: [
    'Thanks for visiting Atelier — enjoy browsing!',
    'We hand-finish every piece with care.',
    'Questions? Tap the chat icon and say hi 👋'
  ]
}

export default function EngagingMessage({ context = 'generic', intervalMs = 6000 }: Props) {
  const pool = MESSAGES[context] || MESSAGES.generic
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % pool.length), intervalMs)
    return () => clearInterval(id)
  }, [pool.length, intervalMs])

  return (
    <div className="mt-3 text-sm text-gray-600 italic opacity-90 select-none transition-opacity duration-300">
      {pool[index]}
    </div>
  )
}
