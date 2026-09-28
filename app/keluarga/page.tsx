import Link from 'next/link'
import { getMyHousehold } from '@/lib/household-access'
import { displayName } from '@/lib/display-name'
import FamilyBoard, { type FamilyItem, type FamilyMember } from '@/components/FamilyBoard'
import FamilyMemberList, { type NonAccountMember } from '@/components/FamilyMemberList'
import { saveFamilyMember, deleteFamilyMember } from './actions'

export const dynamic = 'force-dynamic'

export default async function KeluargaPage() {
  const ctx = await getMyHousehold()

  if (!ctx.isMember || !ctx.houseId) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="max-w-sm text-center">
          <p className="text-lg font-bold" style={{ color: '#1f1a10' }}>Belum Bisa Dipakai</p>
          <p className="mt-2 text-sm font-medium" style={{ color: '#5b543f' }}>
            Catatan & Kalender Keluarga bisa dipakai setelah akunmu diverifikasi Pengurus dan dikonfirmasi Kepala Keluarga.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali ke Beranda</Link>
        </div>
      </main>
    )
  }

  const [{ data: membersRaw }, { data: itemsRaw }, { data: nonAccountRaw }] = await Promise.all([
    ctx.supabase
      .from('profiles')
      .select('id, full_name, nickname, family_role')
      .eq('house_id', ctx.houseId)
      .eq('role', 'warga')
      .eq('account_status', 'aktif')
      .or('family_status.is.null,family_status.eq.dikonfirmasi')
      .neq('id', ctx.userId),
    // Database hanya mengembalikan catatan/event yang boleh dilihat akun ini
    ctx.supabase
      .from('family_items')
      .select('id, kind, title, content, event_date, event_time, share_all, visible_to, created_by, updated_at, author:profiles!family_items_created_by_fkey(full_name, nickname)')
      .eq('house_id', ctx.houseId)
      .order('updated_at', { ascending: false })
      .limit(500),
    // Anggota keluarga tanpa akun (anak kecil, ART, dsb) -- Kebutuhan #11
    ctx.supabase
      .from('family_members')
      .select('id, name, relation, birth_date, note, created_at')
      .eq('house_id', ctx.houseId)
      .order('created_at', { ascending: true }),
  ])

  const members: FamilyMember[] = (membersRaw ?? []).map((m: any) => ({
    id: m.id,
    name: displayName(m),
    familyRole: m.family_role ?? null,
  }))

  const items: FamilyItem[] = (itemsRaw ?? []).map((i: any) => {
    const author = Array.isArray(i.author) ? i.author[0] : i.author
    return {
      id: i.id,
      kind: i.kind,
      title: i.title,
      content: i.content,
      event_date: i.event_date,
      event_time: i.event_time,
      share_all: i.share_all,
      visible_to: i.visible_to ?? [],
      created_by: i.created_by,
      author_name: displayName(author),
      updated_at: i.updated_at,
    }
  })

  const nonAccountMembers: NonAccountMember[] = (nonAccountRaw ?? []).map((m: any) => ({
    id: m.id,
    name: m.name,
    relation: m.relation,
    birth_date: m.birth_date,
    note: m.note,
  }))

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Rumah {ctx.houseLabel ?? ''}</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Catatan & Kalender Keluarga
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              Hanya terlihat oleh penghuni rumah ini yang kamu pilih.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <FamilyMemberList
          members={nonAccountMembers}
          isManager={ctx.isManager}
          saveAction={saveFamilyMember}
          deleteAction={deleteFamilyMember}
        />

        <div className="mt-9">
          <FamilyBoard items={items} members={members} myId={ctx.userId} houseLabel={ctx.houseLabel} />
        </div>
      </div>
    </main>
  )
}