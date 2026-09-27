import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import AdminLayout from '@/components/admin/AdminLayout'
import EmergencyContactManager from '@/components/admin/EmergencyContactManager'
import { createContact, updateContact, setContactActive, deleteContact } from './actions'

export default async function KelolaNomorDaruratPage() {
  const access = await getMyAccess()

  if (!access.canManageEmergencyContacts) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>
            Halaman ini khusus Superadmin, Admin Paguyuban, dan Sekretaris Paguyuban.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const supabase = await createClient()
  const { data: contactsRaw } = await supabase
    .from('emergency_contacts')
    .select('id, name, phone, description, sort_order, is_active, updated_at, editor:updated_by(full_name)')
    .order('is_active', { ascending: false })
    .order('sort_order', { ascending: true })

  const contacts = (contactsRaw ?? []).map((c: any) => ({
    ...c,
    editor: Array.isArray(c.editor) ? c.editor[0] : c.editor,
  }))

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#b3392f' }}>Keadaan Darurat</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Kelola Nomor Darurat
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Nomor Pos Security, Ketua RT, dan pengurus yang tampil di halaman Tombol Darurat. Perubahan langsung berlaku untuk semua warga.
        </p>
      </div>

      <EmergencyContactManager
        contacts={contacts}
        createAction={createContact}
        updateAction={updateContact}
        setActiveAction={setContactActive}
        deleteAction={deleteContact}
      />
    </AdminLayout>
  )
}