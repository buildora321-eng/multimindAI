
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import sendMessage from '../features/sendMessage'
import getMessages from '../features/getMessages'
import { createConversation } from '../features/createConversation.js'
import {
    Paperclip,
    Mic,
    Send,
    Zap,
    MessageSquare,
    Code2,
    FileText,
    Presentation,
    ImageIcon,
    Search,
    PanelsTopLeft
} from 'lucide-react'
import {
    addMessage,
    setMessages,
    setArtifacts
} from '../redux/messageSlice'
import { updateConversation } from '../features/updateConversation'
import {
    setConvTitle,
    addConversation,
    setSelectedConversation
} from '../redux/conversationSlice'

function ChatInput() {
    const [value, setValue] = useState('')
    const [selectedAgent, setSelectedAgent] = useState("Auto")
    const [isSending, setIsSending] = useState(false)

    const { selectedConversation } = useSelector(
        state => state.conversation
    )

    // Keep the artifacts already loaded for this conversation
    const currentArtifacts = useSelector(
        state => state.message?.artifacts ?? []
    )

    const dispatch = useDispatch()

    // Combine artifacts without adding duplicates
    const mergeArtifacts = (...groups) => {
        const uniqueArtifacts = new Map()

        groups.flat().forEach((artifact, index) => {
            if (!artifact) return

            const fileUrl =
                artifact.url ||
                artifact.files?.[0]?.url ||
                ''

            const fileName =
                artifact.name ||
                artifact.files?.[0]?.name ||
                ''

            const key = fileUrl
                ? `url:${fileUrl}`
                : fileName
                    ? `file:${fileName}`
                    : `artifact:${artifact.type || ''}:${artifact.title || ''}:${index}`

            uniqueArtifacts.set(key, artifact)
        })

        return Array.from(uniqueArtifacts.values())
    }

    const handleSendMessage = async () => {
        const prompt = value.trim()

        if (!prompt || isSending) return

        setIsSending(true)

        try {
            let conversation = selectedConversation

            // Create a conversation if none is selected
            if (!conversation) {
                const conv = await createConversation()

                if (!conv?._id) {
                    console.error("Failed to create conversation")
                    return
                }

                conversation = conv

                dispatch(setMessages([]))
                dispatch(setArtifacts([]))
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

            const isDifferentConversation =
                !selectedConversation ||
                selectedConversation._id !== conversation._id

            // Clear state only when starting a different conversation
            if (isDifferentConversation) {
                dispatch(setMessages([]))
                dispatch(setArtifacts([]))
            }

            const payload = {
                prompt,
                conversationId: conversation._id,
                agent: selectedAgent.toLowerCase()
            }

            dispatch(addMessage({
                role: "user",
                content: prompt
            }))

            // Do NOT clear artifacts here.
            // Existing artifacts remain available while the agent works.
            setValue('')

            const data = await sendMessage(payload)

            console.log("Agent response:", data)

            if (data == null) {
                dispatch(addMessage({
                    role: "assistant",
                    content: "Sorry, something went wrong. Please try again."
                }))
                return
            }

            // Display the assistant response
            dispatch(addMessage({
                role: "assistant",
                content: data?.answer || data?.message || "",
                images: data?.images || []
            }))

            let generatedArtifacts = Array.isArray(data?.artifacts)
                ? data.artifacts
                : []

            // If no artifacts came directly from the agent,
            // retrieve all saved artifacts for this conversation.
            if (generatedArtifacts.length === 0) {
                try {
                    const response = await getMessages(conversation._id)

                    const messages = Array.isArray(response)
                        ? response
                        : Array.isArray(response?.messages)
                            ? response.messages
                            : []

                    generatedArtifacts = messages
                        .filter(message =>
                            message.role === "assistant" &&
                            Array.isArray(message.artifacts)
                        )
                        .flatMap(message => message.artifacts)
                } catch (error) {
                    console.error("Error fetching artifacts:", error)
                }
            }

            // Keep old artifacts and add newly generated ones
            const updatedArtifacts = mergeArtifacts(
                isDifferentConversation ? [] : currentArtifacts,
                generatedArtifacts
            )

            dispatch(setArtifacts(updatedArtifacts))

        } catch (error) {
            console.error("Error sending message:", error)

            dispatch(addMessage({
                role: "assistant",
                content: "Sorry, something went wrong. Please try again."
            }))

            // Preserve existing artifacts if the request fails.
        } finally {
            setIsSending(false)
        }
    }

    const agents = [
        { id: "auto", icon: Zap, label: "Auto" },
        { id: "chat", icon: MessageSquare, label: "chat" },
        { id: "coding", icon: Code2, label: "Coding" },
        { id: "pdf", icon: FileText, label: "PDF" },
        { id: "ppt", icon: Presentation, label: "PPT" },
        { id: "vision", icon: ImageIcon, label: "vision" },
        { id: "search", icon: Search, label: "Search" },
        { id: "buildora", icon: PanelsTopLeft, label: "Buildora" }
    ]

    return (
        <div className='w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/[0.06] bg-[#0d0f14]'>
            <div className='flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3'>

                <div className='flex w-[80%] gap-2 pr-2 flex-wrap'>
                    {agents.map((agent) => {
                        const isActive = selectedAgent === agent.label
                        const Icon = agent.icon

                        return (
                            <div
                                key={agent.id}
                                onClick={() => setSelectedAgent(agent.label)}
                                className={`
                                    flex-shrink-0
                                    cursor-pointer
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    px-3
                                    py-2
                                    rounded-full
                                    text-xs
                                    font-medium
                                    border
                                    transition-all
                                    ${isActive
                                        ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                                        : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]"}
                                `}
                            >
                                <Icon
                                    size={14}
                                    className={
                                        isActive
                                            ? "text-white"
                                            : "text-slate-500"
                                    }
                                />
                                {agent.label}
                            </div>
                        )
                    })}
                </div>

                <textarea
                    placeholder="Ask Anything..."
                    onChange={(e) => setValue(e.target.value)}
                    value={value}
                    disabled={isSending}
                    onKeyDown={(e) => {
                        if (
                            e.key === 'Enter' &&
                            !e.shiftKey &&
                            !isSending
                        ) {
                            e.preventDefault()
                            handleSendMessage()
                        }
                    }}
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
                        disabled={!value.trim() || isSending}
                        onClick={handleSendMessage}
                        className={`flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all duration-150 ${
                            value.trim() && !isSending
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
