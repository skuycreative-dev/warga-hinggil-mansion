import Image from 'next/image'

export default function AppFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/30 px-4 py-4 text-center text-xs text-muted-foreground">
      <div className="flex items-center justify-center gap-2">
        <span>Dikembangkan oleh</span>
        <Image
          src="/logo-skuy-creative.png"
          alt="SKUY Creative Agency"
          width={20}
          height={20}
        />
        <span className="font-medium">SKUY Creative Agency</span>
      </div>
    </footer>
  )
}
