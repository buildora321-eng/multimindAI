
import React, { useEffect } from 'react'
import MessageList from './MessageList'
import Nav from './Nav.jsx'
import ChatInput from './ChatInput'
import { useDispatch, useSelector } from 'react-redux'
import getMessages from '../features/getMessages'
import { setArtifacts, setMessages } from '../redux/messageSlice'

function ChatArea() {
    const { selectedConversation } = useSelector(
        state => state.conversation
    )

    const dispatch = useDispatch()

    useEffect(() => {
        let active = true

        const getMesg = async () => {
            // Clear messages and artifacts when switching conversations
            dispatch(setMessages([]))
            dispatch(setArtifacts([]))

            if (!selectedConversation?._id) {
                return
            }

            // A new conversation has no previous messages to load
            if (selectedConversation.title === "New Chat") {
                return
            }

            const data = await getMessages(selectedConversation._id)

            // Ignore responses belonging to a previously selected chat
            if (!active) return

            const messages = Array.isArray(data) ? data : []

            dispatch(setMessages(messages))

            const latestArtifactMessage = [...messages]
                .reverse()
                .find(msg => Array.isArray(msg.artifacts) && msg.artifacts.length > 0)

            dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
        }

        getMesg()

        return () => {
            active = false
        }
    }, [selectedConversation?._id, dispatch])

    return (
        <div className='flex-1 flex flex-col min-w-0'>
            <Nav />
            <MessageList />
            <ChatInput />
        </div>
    )
}

export default ChatArea
