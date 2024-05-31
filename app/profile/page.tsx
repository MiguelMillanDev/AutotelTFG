'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth, storage } from '@/app/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';

const ProfilePage = () => {
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            setName(user.displayName || '');
            setEmail(user.email || '');
            setProfilePicUrl(user.photoURL || '');

            const fetchUserProfile = async () => {
                setLoading(true);
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setName(userData.name || user.displayName || '');
                    setEmail(userData.email || user.email || '');
                    setProfilePicUrl(userData.profilePicUrl || user.photoURL || '');
                }
                setLoading(false);
            };
            fetchUserProfile();
        }
    }, [user]);

    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfilePic(e.target.files[0]);
        }
    };

    const handlePasswordChange = async () => {
        if (user && newPassword) {
            try {
                const userCredential = EmailAuthProvider.credential(user.email!, prompt('Please enter your current password:') || '');
                await reauthenticateWithCredential(user, userCredential);
                await updatePassword(user, newPassword);
                alert('Password updated successfully');
                setNewPassword('');
            } catch (error) {
                console.error(error);
                alert('Failed to update password');
            }
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setLoading(true);
        let uploadedProfilePicUrl = profilePicUrl;

        if (profilePic) {
            const storageRef = ref(storage, `profilePics/${user.uid}`);
            await uploadBytes(storageRef, profilePic);
            uploadedProfilePicUrl = await getDownloadURL(storageRef);
        }

        await setDoc(doc(db, 'users', user.uid), {
            name,
            email,
            profilePicUrl: uploadedProfilePicUrl
        });

        await updateProfile(user, {
            displayName: name,
            photoURL: uploadedProfilePicUrl
        });

        setLoading(false);
        alert('Profile updated successfully!');
        router.push('/'); // Redirige a la página principal o a la que prefieras
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }

    return (
        <main className="max-w-[600px] mx-auto px-6 pb-6">
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex items-center space-x-4">
                    {profilePicUrl ? (
                        <img src={profilePicUrl} alt="Profile Picture" className="w-24 h-24 rounded-full" />
                    ) : (
                        <FaUserCircle className="w-24 h-24 text-gray-400" />
                    )}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-2">{name || 'User'}</h1>
                        <p className="text-gray-600">{email}</p>
                    </div>
                </div>
                <div className="space-y-4 mt-6">
                    <div>
                        <label className="block text-lg font-medium">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            readOnly
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium">Profile Picture</label>
                        <input
                            type="file"
                            onChange={handleProfilePicChange}
                            className="mt-1 block w-full"
                        />
                    </div>
                    <button
                        onClick={handleSaveProfile}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Save
                    </button>
                    <button
                        onClick={handlePasswordChange}
                        className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors mt-4"
                    >
                        Change Password
                    </button>
                </div>
            </div>
        </main>
    );
};

export default ProfilePage;
