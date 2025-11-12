import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'

function Stat({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-white/70 backdrop-blur border border-white/50 shadow-sm">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function TextInput({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white/80 focus:bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  )
}

function SectionCard({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/70 backdrop-blur shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

function App() {
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  const [stats, setStats] = useState({ books: 0, members: 0, loans: 0 })

  const [q, setQ] = useState('')
  const [books, setBooks] = useState([])
  const [loadingBooks, setLoadingBooks] = useState(false)

  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', total_copies: 1, available_copies: 1, tags: '' })
  const [memberForm, setMemberForm] = useState({ name: '', email: '', membership_id: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const fetchBooks = async (query = '') => {
    try {
      setLoadingBooks(true)
      const res = await fetch(`${baseUrl}/api/books${query ? `?q=${encodeURIComponent(query)}` : ''}`)
      const data = await res.json()
      setBooks(data)
      setStats((s) => ({ ...s, books: data.length }))
    } catch (e) {
      console.error(e)
      showToast('Failed to load books', 'error')
    } finally {
      setLoadingBooks(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/members`)
      const data = await res.json()
      setStats((s) => ({ ...s, members: data.length }))
    } catch {}
  }

  const fetchLoans = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/loans`)
      const data = await res.json()
      setStats((s) => ({ ...s, loans: data.length }))
    } catch {}
  }

  useEffect(() => {
    fetchBooks('')
    fetchMembers()
    fetchLoans()
  }, [])

  const handleCreateBook = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...bookForm,
        total_copies: Number(bookForm.total_copies) || 0,
        available_copies: Number(bookForm.available_copies) || 0,
        tags: bookForm.tags ? bookForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      const res = await fetch(`${baseUrl}/api/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed')
      showToast('Book added')
      setBookForm({ title: '', author: '', isbn: '', total_copies: 1, available_copies: 1, tags: '' })
      fetchBooks(q)
    } catch (e) {
      showToast('Could not add book', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateMember = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${baseUrl}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberForm),
      })
      if (!res.ok) throw new Error('Failed')
      showToast('Member created')
      setMemberForm({ name: '', email: '', membership_id: '', phone: '' })
      fetchMembers()
    } catch (e) {
      showToast('Could not create member', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 text-gray-900">
      {/* Hero with Spline 3D */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <Spline scene="https://prod.spline.design/UngO8SNLfLcyPG7O/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/40 to-white/80 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 drop-shadow-sm">
              Library Management System
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
              Manage books, members, and loans with a modern, animated experience.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 max-w-2xl mx-auto">
              <Stat label="Books" value={stats.books} />
              <Stat label="Members" value={stats.members} />
              <Stat label="Loans" value={stats.loans} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <SectionCard title="Quick Add: Book" description="Add a new title to your catalog">
          <form onSubmit={handleCreateBook} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextInput label="Title" value={bookForm.title} onChange={(v) => setBookForm({ ...bookForm, title: v })} placeholder="The Pragmatic Programmer" />
            <TextInput label="Author" value={bookForm.author} onChange={(v) => setBookForm({ ...bookForm, author: v })} placeholder="Andrew Hunt" />
            <TextInput label="ISBN" value={bookForm.isbn} onChange={(v) => setBookForm({ ...bookForm, isbn: v })} placeholder="978-0201616224" />
            <TextInput type="number" label="Total Copies" value={bookForm.total_copies} onChange={(v) => setBookForm({ ...bookForm, total_copies: v })} placeholder="3" />
            <TextInput type="number" label="Available Copies" value={bookForm.available_copies} onChange={(v) => setBookForm({ ...bookForm, available_copies: v })} placeholder="3" />
            <TextInput label="Tags (comma separated)" value={bookForm.tags} onChange={(v) => setBookForm({ ...bookForm, tags: v })} placeholder="programming, software" />
            <div className="md:col-span-3">
              <button disabled={submitting} className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 transition disabled:opacity-60">
                {submitting ? 'Saving...' : 'Add Book'}
              </button>
            </div>
          </form>
        </SectionCard>

        <div className="grid md:grid-cols-2 gap-8">
          <SectionCard title="Quick Add: Member" description="Register a new member">
            <form onSubmit={handleCreateMember} className="grid grid-cols-1 gap-4">
              <TextInput label="Name" value={memberForm.name} onChange={(v) => setMemberForm({ ...memberForm, name: v })} placeholder="Jane Doe" />
              <TextInput type="email" label="Email" value={memberForm.email} onChange={(v) => setMemberForm({ ...memberForm, email: v })} placeholder="jane@example.com" />
              <TextInput label="Membership ID" value={memberForm.membership_id} onChange={(v) => setMemberForm({ ...memberForm, membership_id: v })} placeholder="M-1001" />
              <TextInput label="Phone" value={memberForm.phone} onChange={(v) => setMemberForm({ ...memberForm, phone: v })} placeholder="+1 (555) 000-0000" />
              <button disabled={submitting} className="inline-flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 transition disabled:opacity-60">
                {submitting ? 'Saving...' : 'Create Member'}
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Find Books" description="Search your catalog">
            <div className="flex gap-2 mb-4">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, author, ISBN, tags"
                className="flex-1 rounded-lg border border-gray-300 bg-white/80 focus:bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={() => fetchBooks(q)} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4">
                Search
              </button>
            </div>
            <div className="overflow-auto rounded-lg border border-white/50 bg-white/70">
              <table className="min-w-full">
                <thead className="bg-white/60">
                  <tr>
                    <th className="text-left text-sm font-semibold text-gray-600 px-4 py-2">Title</th>
                    <th className="text-left text-sm font-semibold text-gray-600 px-4 py-2">Author</th>
                    <th className="text-left text-sm font-semibold text-gray-600 px-4 py-2">ISBN</th>
                    <th className="text-left text-sm font-semibold text-gray-600 px-4 py-2">Available</th>
                    <th className="text-left text-sm font-semibold text-gray-600 px-4 py-2">Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingBooks ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading...</td>
                    </tr>
                  ) : books.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No books found</td>
                    </tr>
                  ) : (
                    books.map((b) => (
                      <tr key={b._id} className="border-t border-white/50 hover:bg-white/70">
                        <td className="px-4 py-2 font-medium text-gray-900">{b.title}</td>
                        <td className="px-4 py-2 text-gray-700">{b.author}</td>
                        <td className="px-4 py-2 text-gray-700">{b.isbn || '-'}</td>
                        <td className="px-4 py-2 text-gray-700">{b.available_copies}/{b.total_copies}</td>
                        <td className="px-4 py-2 text-gray-700">{Array.isArray(b.tags) ? b.tags.join(', ') : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

export default App
