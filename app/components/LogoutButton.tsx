// components/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { auth } from '@/app/firebaseConfig';
import { signOut } from 'firebase/auth';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
     
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
    >
     Logout
    </button>
  );
};

export default LogoutButton;
