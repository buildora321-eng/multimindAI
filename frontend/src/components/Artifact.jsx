
import {
    Check,
    Code2,
    Copy,
    Eye,
    Download,
    Presentation,
    FileText,
    PanelRightClose,
    PanelRightOpen
} from 'lucide-react'

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { easeInOut, motion } from "motion/react"
import Editor from '@monaco-editor/react'

function Artifact() {
    const [collapsed, setCollapsed] = useState(false)
    const [tab, setTab] = useState("code")
    const [activeFile, setActiveFile] = useState(0)
    const [activeArtifact, setActiveArtifact] = useState(0)
    const [copied, setCopied] = useState(false)

    const artifacts = useSelector(
        state => state.message?.artifacts ?? []
    )

    useEffect(() => {
        setActiveArtifact(0)
        setActiveFile(0)
    }, [artifacts.length])

    if (!Array.isArray(artifacts) || artifacts.length === 0) {
        return null
    }

    const currentArtifact = artifacts[activeArtifact]

    if (!currentArtifact) return null

    const isPptx =
        currentArtifact?.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
        currentArtifact?.name?.toLowerCase().endsWith(".pptx")

    const isPdf =
        currentArtifact?.type === "pdf" ||
        currentArtifact?.files?.some(
            file =>
                file.type === "application/pdf" ||
                file.name?.toLowerCase().endsWith(".pdf")
        )

    const files = currentArtifact?.files || []

    const file = files[activeFile] ?? files[0]

    const pdfFile = files.find(
        f =>
            f.type === "application/pdf" ||
            f.name?.toLowerCase().endsWith(".pdf")
    )

    const htmlFile = files.find(
        f => f.name === "index.html"
    )

    const cssFile = files.find(
        f => f.name === "style.css"
    )

    const jsFile = files.find(
        f => f.name === "script.js"
    )

    const canPreview = Boolean(htmlFile)

    const previewDoc = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
${cssFile?.content || ""}
</style>
</head>
<body>
${htmlFile?.content || ""}
<script>
${jsFile?.content || ""}
</script>
</body>
</html>`

    // Download PDF or PPT using its saved URL
    const handleDownload = (url, filename) => {
        if (!url) {
            console.error("Artifact download URL not found")
            return
        }

        const link = document.createElement("a")

        link.href = url
        link.download = filename || "generated-file"
        link.target = "_blank"
        link.rel = "noopener noreferrer"

        document.body.appendChild(link)
        link.click()
        link.remove()
    }

    const handleDownloadPptx = () => {
        handleDownload(
            currentArtifact.url,
            currentArtifact.name || "presentation.pptx"
        )
    }

    const handleCopy = async () => {
        if (isPdf || isPptx || !file?.content) return

        try {
            await navigator.clipboard.writeText(file.content)

            setCopied(true)

            setTimeout(() => {
                setCopied(false)
            }, 2000)

        } catch (error) {
            console.error("Copy failed:", error)
        }
    }

    const detectLanguage = (fileName = "") => {
        const name = fileName.toLowerCase()

        if (name.endsWith(".html")) return "html"
        if (name.endsWith(".css")) return "css"
        if (name.endsWith(".js")) return "javascript"
        if (name.endsWith(".jsx")) return "javascript"
        if (name.endsWith(".ts")) return "typescript"
        if (name.endsWith(".tsx")) return "typescript"
        if (name.endsWith(".json")) return "json"
        if (name.endsWith(".java")) return "java"
        if (name.endsWith(".cpp")) return "cpp"
        if (name.endsWith(".c")) return "c"

        return "plaintext"
    }

    return (
        <motion.div
            initial={{ width: 500 }}
            animate={{ width: collapsed ? 48 : 400 }}
            transition={{
                duration: 0.25,
                ease: easeInOut
            }}
            className='hidden lg:flex h-full border-l border-white/[0.06] flex-col overflow-hidden shrink-0'
        >

            {!collapsed ? (
                <div className='flex flex-col h-full bg-[#0d0f14]'>

                    {/* Header */}
                    <div className='min-h-14 px-3 border-b border-white/[0.06] flex items-center gap-2 shrink-0'>

                        <button
                            className='flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors bg-transparent border-none cursor-pointer shrink-0'
                            onClick={() => setCollapsed(true)}
                        >
                            <PanelRightClose size={16} />
                        </button>

                        <div className='flex items-center gap-2 flex-1 min-w-0'>

                            <div className='flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 shrink-0'>
                                {isPptx ? (
                                    <Presentation
                                        className="text-indigo-400"
                                        size={12}
                                    />
                                ) : isPdf ? (
                                    <FileText
                                        className="text-indigo-400"
                                        size={12}
                                    />
                                ) : (
                                    <Code2
                                        className="text-indigo-400"
                                        size={12}
                                    />
                                )}
                            </div>

                            <div className='text-[13px] font-medium text-slate-200 truncate'>
                                {currentArtifact.title || "Untitled Artifact"}
                            </div>

                        </div>

                        {isPptx && (
                            <button
                                onClick={handleDownloadPptx}
                                disabled={!currentArtifact.url}
                                className='flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-indigo-400 hover:text-white hover:bg-indigo-500/20 rounded-lg transition-colors bg-transparent border-none cursor-pointer shrink-0 disabled:opacity-40'
                            >
                                <Download size={14} />
                                Download
                            </button>
                        )}

                        {isPdf && pdfFile?.url && (
                            <button
                                onClick={() => handleDownload(
                                    pdfFile.url,
                                    pdfFile.name
                                )}
                                className='flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-indigo-400 hover:text-white hover:bg-indigo-500/20 rounded-lg transition-colors bg-transparent border-none cursor-pointer shrink-0'
                            >
                                <Download size={14} />
                                Download
                            </button>
                        )}

                        {!isPdf && !isPptx && (
                            <button
                                onClick={handleCopy}
                                className='flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] rounded-lg transition-colors bg-transparent border-none cursor-pointer'
                            >
                                {copied ? (
                                    <Check size={15} />
                                ) : (
                                    <Copy size={15} />
                                )}
                            </button>
                        )}

                        {!isPdf && !isPptx && canPreview && (
                            <div className='flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] p-1 rounded-lg'>

                                <button
                                    onClick={() => setTab("code")}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors
                                    ${tab === "code" ? "bg-indigo-500 text-white" : "text-slate-500 hover:text-slate-200"}`}
                                >
                                    <Code2 size={11} />
                                    Code
                                </button>

                                <button
                                    onClick={() => setTab("preview")}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors
                                    ${tab === "preview" ? "bg-indigo-500 text-white" : "text-slate-500 hover:text-slate-200"}`}
                                >
                                    <Eye size={11} />
                                    Preview
                                </button>

                            </div>
                        )}

                    </div>

                    {/* Artifact selector */}
                    {artifacts.length > 1 && (
                        <div className='flex gap-2 px-3 py-2 border-b border-white/[0.06] overflow-x-auto shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>

                            {artifacts.map((artifact, index) => {
                                const selected = activeArtifact === index

                                const ppt =
                                    artifact.type?.includes("presentation") ||
                                    artifact.name?.toLowerCase().endsWith(".pptx")

                                const pdf =
                                    artifact.type === "pdf" ||
                                    artifact.files?.some(f =>
                                        f.type === "application/pdf" ||
                                        f.name?.toLowerCase().endsWith(".pdf")
                                    )

                                return (
                                    <button
                                        key={artifact.url || artifact.files?.[0]?.url || artifact.name || `${artifact.title}-${index}`}
                                        onClick={() => {
                                            setActiveArtifact(index)
                                            setActiveFile(0)
                                            setTab("code")
                                            setCopied(false)
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
                                            selected
                                                ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                                                : "bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-slate-200"
                                        }`}
                                    >
                                        {ppt ? (
                                            <Presentation size={12} />
                                        ) : pdf ? (
                                            <FileText size={12} />
                                        ) : (
                                            <Code2 size={12} />
                                        )}

                                        {artifact.title || `Artifact ${index + 1}`}
                                    </button>
                                )
                            })}

                        </div>
                    )}

                    {/* PPTX Preview */}
                    {isPptx ? (
                        <div className='flex-1 flex flex-col items-center justify-center gap-4 text-slate-300'>

                            <Presentation
                                size={52}
                                className='text-indigo-400'
                            />

                            <p className='text-sm font-medium'>
                                {currentArtifact.name}
                            </p>

                            <p className='text-xs text-slate-500'>
                                Your PowerPoint presentation is ready.
                            </p>

                            <button
                                onClick={handleDownloadPptx}
                                disabled={!currentArtifact.url}
                                className='flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium cursor-pointer border-none transition-colors disabled:opacity-40'
                            >
                                <Download size={16} />
                                Download Presentation
                            </button>

                        </div>
                    ) : isPdf ? (

                        /* PDF Preview */
                        pdfFile?.url ? (
                            <div className='flex-1 overflow-hidden bg-white'>
                                <iframe
                                    title={pdfFile.name || "Generated PDF"}
                                    src={pdfFile.url}
                                    className='w-full h-full border-none'
                                />
                            </div>
                        ) : (
                            <div className='flex-1 flex items-center justify-center text-sm text-red-400'>
                                PDF URL not found.
                            </div>
                        )

                    ) : (

                        /* Code / Website Preview */
                        <>
                            {tab === "code" && (
                                <div className='flex h-auto border-b border-white/[0.06] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0'>

                                    {files.map((f, index) => (
                                        <button
                                            key={f.name || index}
                                            onClick={() => setActiveFile(index)}
                                            className={`px-4 py-2.5 text-[11px] font-medium whitespace-nowrap transition-colors border-r border-white/[0.05] relative cursor-pointer bg-transparent
                                            ${activeFile === index ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
                                        >
                                            {f.name}

                                            {activeFile === index && (
                                                <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-t-full' />
                                            )}
                                        </button>
                                    ))}

                                </div>
                            )}

                            <div className='flex-1 overflow-hidden'>

                                {tab === "preview" && canPreview ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className='w-full h-full'
                                    >
                                        <iframe
                                            title='preview'
                                            srcDoc={previewDoc}
                                            sandbox='allow-scripts'
                                            className='w-full h-full bg-white'
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className='w-full h-full'
                                    >
                                        <Editor
                                            theme='vs-dark'
                                            language={detectLanguage(file?.name)}
                                            value={file?.content || ""}
                                            options={{
                                                readOnly: true,
                                                minimap: { enabled: false },
                                                fontSize: 13,
                                                wordWrap: "on",
                                                automaticLayout: true,
                                                scrollBeyondLastLine: false,
                                                padding: { top: 16 },
                                                lineNumbers: "on",
                                                renderLineHighlight: "none"
                                            }}
                                        />
                                    </motion.div>
                                )}

                            </div>
                        </>
                    )}

                </div>
            ) : (

                /* Collapsed sidebar */
                <div className='hidden lg:flex h-full border-l border-white/[0.06] bg-[#0d0f14] flex-col items-center py-4 gap-3 shrink-0'>

                    <button
                        className='flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors bg-transparent border-none cursor-pointer shrink-0'
                        onClick={() => setCollapsed(false)}
                    >
                        <PanelRightOpen size={16} />
                    </button>

                    <div className='flex items-center gap-2 flex-1 min-w-0'>
                        <div
                            className='text-[10px] font-medium text-slate-600 tracking-widest uppercase whitespace-nowrap'
                            style={{
                                writingMode: "vertical-lr",
                                transform: "rotate(180deg)"
                            }}
                        >
                            {currentArtifact.title}
                        </div>
                    </div>

                </div>
            )}

        </motion.div>
    )
}

export default Artifact