import { signInWithGoogle } from '@/services/authService';

export default function Login() {
  return (
    <div className="flex justify-center items-center h-screen">
      <button onClick={signInWithGoogle} className="bg-blue-500 text-white px-4 py-2 rounded">
        Sign in with Google
      </button>
    </div>
  );
}
