'use client';

import Modal from "./Modal";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import useSignupModal from "@/app/hooks/useSignupModal";
import CustomButton from "../forms/CustomButton";
import { register } from "@/app/lib/auth";

const SignupModal = () => {
    const router = useRouter();
    const signupModal = useSignupModal();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<string[]>([]);

    const submitSignup = async () => {
        try {
            await register(email, password);
            signupModal.close();
            router.push('/');
        } catch (error) {
            setErrors(['Registration failed']);
        }
    };

    return (
        <Modal
            isOpen={signupModal.isOpen}
            close={signupModal.close}
            label="Sign up"
            content={
                <form onSubmit={(e) => { e.preventDefault(); submitSignup(); }} className="space-y-4">
                    <input onChange={(e) => setUsername(e.target.value)} placeholder="Your username" type="text" className="w-full h-[54px] px-4 border border-gray-300 rounded-xl" />
                    <input onChange={(e) => setEmail(e.target.value)} placeholder="Your e-mail address" type="email" className="w-full h-[54px] px-4 border border-gray-300 rounded-xl" />
                    <input onChange={(e) => setPassword(e.target.value)} placeholder="Your password" type="password" className="w-full h-[54px] px-4 border border-gray-300 rounded-xl" />
                    {errors.map((error, index) => (
                        <div key={`error_${index}`} className="p-5 bg-red-500 text-white rounded-xl opacity-80">
                            {error}
                        </div>
                    ))}
                    <CustomButton label="Submit" type="submit" />
                </form>
            }
        />
    );
};

export default SignupModal;
