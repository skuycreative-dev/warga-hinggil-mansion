import { createClient } from '@/lib/supabase/server'
import AppHeader from '@/components/AppHeader'
import FaqAccordion from '@/components/FaqAccordion'

export default async function FaqPage() {
  const supabase = await createClient()
  const { data: faqItems } = await supabase
    .from('faq_items')
    .select('id, question, answer')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <>
      <AppHeader />
      <main className="w-full" style={{ background: '#faf7f0' }}>
        <div className="mx-auto w-full max-w-3xl px-6 py-14 md:px-10 md:py-20">
          <div className="mb-8 text-center md:mb-10">
            <span
              className="text-xs font-bold uppercase tracking-widest md:text-sm"
              style={{ color: '#9c7a3f' }}
            >
              Pusat Bantuan
            </span>
            <h1
              className="mt-2 text-2xl font-bold md:text-4xl"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
            >
              Pertanyaan yang Sering Diajukan
            </h1>
          </div>

          {faqItems && faqItems.length > 0 ? (
            <FaqAccordion items={faqItems} />
          ) : (
            <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
              Belum ada FAQ yang tersedia saat ini.
            </p>
          )}
        </div>
      </main>
    </>
  )
}
