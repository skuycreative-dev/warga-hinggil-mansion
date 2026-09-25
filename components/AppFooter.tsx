import Image from 'next/image'

export default function AppFooter() {
  return (
    <footer
      className="mt-auto px-4 py-5 text-center text-xs"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#6d6f7a' }}
    >
      <div className="flex items-center justify-center gap-2">
        <span>Dikembangkan oleh</span>
        <Image
          src="/logo-skuy-creative.png"
          alt="SKUY Creative Agency"
          width={16}
          height={16}
          className="rounded"
        />
        <span style={{ color: '#9a9ca8', fontWeight: 600 }}>SKUY Creative Agency</span>
      </div>
    </footer>
  )
}
