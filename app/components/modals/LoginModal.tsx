'use client';

import Modal from "./Modal";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import useLoginModal from "@/app/hooks/useLoginModal";
import CustomButton from "../forms/CustomButton";
import { login } from "@/app/lib/auth";

const LoginModal = () => {
    const router = useRouter();
    const loginModal = useLoginModal();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<string[]>([]);

    const submitLogin = async () => {
        try {
            await login(email, password);
            loginModal.close();
            router.push('/');
        } catch (error) {
            setErrors(['Login failed']);
        }
    };

    const content = (
        <>
            <form onSubmit={(e) => { e.preventDefault(); submitLogin(); }} className="space-y-4">
                <input onChange={(e) => setEmail(e.target.value)} placeholder="Your email" type="email" className="w-full h-[54px] px-4 border border-gray-300 rounded-xl" />
                <input onChange={(e) => setPassword(e.target.value)} placeholder="Your password" type="password" className="w-full h-[54px] px-4 border border-gray-300 rounded-xl" />
                {errors.map((error, index) => (
                    <div key={`error_${index}`} className="p-5 bg-red-500 text-white rounded-xl opacity-80">
                        {error}
                    </div>
                ))}
                <CustomButton label="Submit" type="submit" />
            </form>
        </>
    );

    return (
        <Modal
            isOpen={loginModal.isOpen}
            close={loginModal.close}
            label="Log in"
            content={content}
        />
    );
};

export default LoginModal;
