'use client';

import { useEffect, useState, useRef } from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '@/app/firebaseConfig';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import CustomButton from "../forms/CustomButton";
import { UserType } from "@/app/inbox/page";

export type MessageType = {
    id: string;
    body: string;
    created_by: {
        id: string;
        name: string;
    };
    sent_to: {
        id: string;
        name: string;
    };
    created_at: string;
}

export type ConversationType = {
    id: string;
    users: UserType[];
}

interface ConversationDetailProps {
    conversationId: string;
    messages: MessageType[];
}

const ConversationDetail: React.FC<ConversationDetailProps> = ({
    conversationId,
    messages: initialMessages
}) => {
    const [user] = useAuthState(auth);
    const messagesDiv = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState<MessageType[]>(initialMessages);

    useEffect(() => {
        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, where('conversationId', '==', conversationId), orderBy('created_at', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messages: MessageType[] = [];
            querySnapshot.forEach((doc) => {
                messages.push({ id: doc.id, ...doc.data() } as MessageType);
            });
            setMessages(messages);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [conversationId]);

    const sendMessage = async () => {
        if (!user) return;

        const conversationRef = doc(db, 'conversations', conversationId);
        const conversationSnap = await getDoc(conversationRef);
        if (!conversationSnap.exists()) {
            console.error("No such conversation!");
            return;
        }

        const conversationData = conversationSnap.data() as ConversationType;

        await addDoc(collection(db, 'messages'), {
            body: newMessage,
            created_by: {
                id: user.uid,
                name: user.displayName || 'Anonymous',
            },
            sent_to: conversationData.users.find((u: UserType) => u.id !== user.uid),
            conversationId: conversationId,
            created_at: new Date().toISOString(),
        });

        setNewMessage('');
        setTimeout(scrollToBottom, 100); // Ensure scrolling after rendering
    };

    const scrollToBottom = () => {
        if (messagesDiv.current) {
            messagesDiv.current.scrollTop = messagesDiv.current.scrollHeight;
        }
    };

    return (
        <>
            <div 
                ref={messagesDiv}
                className="max-h-[400px] overflow-auto flex flex-col space-y-4"
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`w-[80%] py-4 px-6 rounded-xl ${message.created_by.id === user?.uid ? 'ml-[20%] bg-blue-200' : 'bg-gray-200'}`}
                    >
                        <p className="font-bold text-gray-500">{message.created_by.name}</p>
                        <p>{message.body}</p>
                    </div>
                ))}
            </div>

            <div className="mt-4 py-4 px-6 flex border border-gray-300 space-x-4 rounded-xl">
                <input
                    type="text"
                    placeholder="Type your message..."
                    className="w-full p-2 bg-gray-200 rounded-xl"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />

                <CustomButton 
                    label='Send'
                    onClick={sendMessage}
                    className="w-[100px]"
                />
            </div>
        </>
    )
}

export default ConversationDetail;
