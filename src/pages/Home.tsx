import { signOut } from '@/services/authService';

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Welcome!</h1>
      <button onClick={signOut} className="bg-red-500 text-white px-4 py-2 rounded">
        Sign Out
      </button>
    </div>
  );
}