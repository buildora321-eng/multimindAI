
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import sendMessage from '../features/sendMessage'
import { createConversation } from '../features/createConversation.js'
import { Paperclip, Mic, Send } from 'lucide-react'
import { addMessage, setMessages } from '../redux/messageSlice'
import { updateConversation } from '../features/updateConversation'
import {
    setConvTitle,
    addConversation,
    setSelectedConversation
} from '../redux/conversationSlice'

function ChatInput() {
    const [value, setValue] = useState('')

    const { selectedConversation } = useSelector(
        state => state.conversation
    )

    const dispatch = useDispatch()

    const handleSendMessage = async () => {
        const prompt = value.trim()

        if (!prompt) return

        let conversation = selectedConversation

        // Create a conversation if none is selected
        if (!conversation) {
            const conv = await createConversation()

            if (!conv?._id) {
                return
            }

            conversation = conv

            // Clear messages from the previous conversation
            dispatch(setMessages([]))
            dispatch(addConversation(conv))
            dispatch(setSelectedConversation(conv))
        }

        // Update the title for a new conversation
        if (conversation.title === "New Chat") {
            await updateConversation({
                id: conversation._id,
                title: prompt
            })

            dispatch(setConvTitle({
                conversationId: conversation._id,
                title: prompt
            }))
        }

        const payload = {
            prompt,
            conversationId: conversation._id
        }

        // Clear old messages before adding the new conversation's message
        if (
            !selectedConversation ||
            selectedConversation._id !== conversation._id ||
            selectedConversation.title === "New Chat"
        ) {
            dispatch(setMessages([]))
        }

        dispatch(addMessage({
            role: "user",
            content: prompt
        }))

        setValue('')

        const data = await sendMessage(payload)

        if (data != null) {
            dispatch(addMessage({
                role: "assistant",
                content: data
            }))
        }

        console.log(data)
    }

    return (
        <div className='w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/[0.06] bg-[#0d0f14]'>
            <div className='flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3'>
                <textarea
                    placeholder="Ask Anything..."
                    onChange={(e) => setValue(e.target.value)}
                    value={value}
                    className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
                    rows={3}
                />

                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1'>
                        <button
                            type="button"
                            className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer'
                        >
                            <Paperclip size={16} />
                        </button>

                        <button
                            type="button"
                            className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer'
                        >
                            <Mic size={16} />
                        </button>
                    </div>

                    <button
                        type="button"
                        disabled={!value.trim()}
                        onClick={handleSendMessage}
                        className={`flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all duration-150 ${
                            value.trim()
                                ? "bg-linear-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white"
                                : "bg-white/[0.05] text-slate-600 cursor-not-allowed"
                        }`}
                    >
                        <Send size={15} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatInput
