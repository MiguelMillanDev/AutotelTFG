'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '@/app/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Conversation from "../components/inbox/Conversation";

export type UserType = {
    id: string;
    name: string;
    avatar_url: string;
}

export type ConversationType = {
    id: string;
    users: UserType[];
}

const InboxPage = () => {
    const [user] = useAuthState(auth);
    const [conversations, setConversations] = useState<ConversationType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            if (user) {
                const conversationsRef = collection(db, 'conversations');
                const q = query(conversationsRef, where('userIds', 'array-contains', user.uid));
                const querySnapshot = await getDocs(q);
                const convos: ConversationType[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    convos.push({
                        id: doc.id,
                        users: data.users,
                    });
                });

                setConversations(convos);
            }
            setLoading(false);
        };

        fetchConversations();
    }, [user]);

    if (loading) {
        return (
            <main className="max-w-[1500px] mx-auto px-6 py-12">
                <p>Loading...</p>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="max-w-[1500px] mx-auto px-6 py-12">
                <p>You need to be authenticated...</p>
            </main>
        );
    }

    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6 space-y-4">
            <h1 className="my-6 text-2xl">Inbox</h1>

            {conversations.length === 0 ? (
                <p>No conversations found</p>
            ) : (
                conversations.map((conversation: ConversationType) => {
                    return (
                        <Conversation 
                            userId={user.uid}
                            key={conversation.id}
                            conversation={conversation}
                        />
                    )
                })
            )}
        </main>
    );
}

export default InboxPage;
