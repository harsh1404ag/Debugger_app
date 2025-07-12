import { LogOut, User, FileText, Clock, CheckCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { name: 'Review', icon: <FileText size={20} />, path: '/app' },
  { name: 'History', icon: <Clock size={20} />, path: '/app/history' },
  { name: 'Profile', icon: <User size={20} />, path: '/app/profile' },
];

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();

  return (
    <div className="bg-[#111] text-white w-64 min-h-screen p-4 border-r border-gray-800">
      <h1 className="text-xl font-bold mb-8 text-center">CodeReview AI</h1>
      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-800 transition ${
                location.pathname === item.path ? 'bg-gray-800' : ''
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      <button
        onClick={onLogout}
        className="flex items-center space-x-2 mt-12 text-red-400 hover:text-red-600 transition px-3 py-2 rounded-md"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
}
