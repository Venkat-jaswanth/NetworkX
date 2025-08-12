import { useState } from 'react';
import { createDbUser } from '@/services/dbUserService';
import { getUser } from '@/services/authService';
import type { InsertDbUser } from '@/types/dbUser.types';

interface OnboardingFormProps {
  onComplete: () => void;
}

export default function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Student' | 'Professional'>('Student');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await getUser();
      if (!user) throw new Error('No authenticated user found');

      const newUser: InsertDbUser = {
        id: user.id,
        full_name: fullName,
        role: role,
        bio: '',
        skills: [],
      };

      await createDbUser(newUser);
      onComplete();
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Complete Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block mb-1">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label htmlFor="role" className="block mb-1">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'Student' | 'Professional')}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="Student">Student</option>
            <option value="Professional">Professional</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading || !fullName.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Complete Profile'}
        </button>
      </form>
    </div>
  );
} 