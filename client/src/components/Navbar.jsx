import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="rounded-lg bg-brand-600 px-2 py-1 text-white">LF</span>
          <span className="text-slate-800">LinkForge</span>
        </Link>
        {user ? (
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-slate-500 sm:inline">{user.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        ) : (
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link to="/login" className="text-slate-700 hover:text-brand-600">
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
            >
              Sign up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
