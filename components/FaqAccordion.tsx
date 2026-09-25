'use client'

import { useState } from 'react'

type FaqItem = {
  id: string
  question: string
  answer: string
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div
            key={item.id}
            className="rounded-2xl px-5 py-4 md:px-6 md:py-5"
            style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="text-[15px] font-bold md:text-lg" style={{ color: '#1f1a10' }}>
                {item.question}
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a1305"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  flexShrink: 0,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {isOpen ? (
              <p
                className="mt-3 text-sm font-medium leading-relaxed md:text-base"
                style={{ color: '#5b543f' }}
              >
                {item.answer}
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
