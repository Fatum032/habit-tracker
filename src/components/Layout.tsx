import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-violet-50 text-violet-700'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`

export default function Layout() {
  const navigate = useNavigate()
  const { userEmail, signOut } = useAuth()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-semibold text-gray-900">
              Духовный трекер
            </Link>
            <nav className="flex items-center gap-1 flex-wrap">
              <NavLink to="/" end className={navLinkClass}>
                Сегодня
              </NavLink>
              <NavLink to="/habits" className={navLinkClass}>
                Привычки
              </NavLink>
              <NavLink to="/scriptures" className={navLinkClass}>
                Местописания
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="text-xs text-gray-600 hover:text-gray-900 hidden sm:inline truncate max-w-[140px]"
              title={userEmail ?? undefined}
            >
              {userEmail}
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
