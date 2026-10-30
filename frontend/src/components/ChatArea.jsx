
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
            // Clear previous conversation data
            dispatch(setMessages([]))
            dispatch(setArtifacts([]))

            if (!selectedConversation?._id) {
                return
            }

            try {
                const data = await getMessages(selectedConversation._id)

                // Ignore responses from a previously selected conversation
                if (!active) return

                const messages = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.messages)
                        ? data.messages
                        : []

                dispatch(setMessages(messages))

                // Restore ALL artifacts from this conversation
                const allArtifacts = messages
                    .filter(message =>
                        message.role === "assistant" &&
                        Array.isArray(message.artifacts)
                    )
                    .flatMap(message => message.artifacts)

                dispatch(setArtifacts(allArtifacts))

            } catch (error) {
                console.error("Error loading conversation messages:", error)

                if (active) {
                    dispatch(setMessages([]))
                    dispatch(setArtifacts([]))
                }
            }
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
