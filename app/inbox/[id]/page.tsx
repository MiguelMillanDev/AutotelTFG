'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '@/app/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import ConversationDetail, { ConversationType, MessageType } from "@/app/components/inbox/ConversationDetail";

const ConversationPage = ({ params }: { params: { id: string } }) => {
    const [user] = useAuthState(auth);
    const [conversation, setConversation] = useState<ConversationType | null>(null);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversation = async () => {
            try {
                const conversationRef = doc(db, 'conversations', params.id);
                const conversationSnap = await getDoc(conversationRef);
                if (conversationSnap.exists()) {
                    const data = conversationSnap.data() as ConversationType;
                    console.log("Conversation data:", data);
                    setConversation({ ...data, id: conversationSnap.id });

                    // Fetch messages related to the conversation
                    const messagesRef = collection(db, 'messages');
                    const messagesQuery = query(messagesRef, where('conversationId', '==', params.id));
                    const messagesSnap = await getDocs(messagesQuery);
                    const fetchedMessages: MessageType[] = messagesSnap.docs.map(doc => ({
                        ...doc.data(),
                        id: doc.id
                    })) as MessageType[];
                    setMessages(fetchedMessages);
                } else {
                    console.error("No such conversation!");
                }
            } catch (error) {
                console.error("Error fetching conversation:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversation();
    }, [params.id]);

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
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            {conversation ? (
                <ConversationDetail
                    conversationId={conversation.id}
                    messages={messages}
                />
            ) : (
                <p>No conversation found</p>
            )}
        </main>
    );
}

export default ConversationPage;
