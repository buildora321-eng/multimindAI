
import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";

export const agent = async (req, res) => {
    try {
        const { prompt, conversationId, agent } = req.body;

        // Save user message
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId,
            role: "user",
            content: prompt
        });

        // Run agent graph
        const result = await graph.invoke({
            prompt,
            conversationId,
            agent
        });

        const response = result.aiResponse || "";

        const images = Array.isArray(result.images)
            ? result.images
            : [];

        // Preserve artifact metadata and Buildora source files
        const artifacts = Array.isArray(result.artifacts)
            ? result.artifacts.map(artifact => ({
                ...artifact,

                // Avoid sending top-level Base64 content
                content: undefined,

                files: Array.isArray(artifact.files)
                    ? artifact.files.map(file => {
                        const safeFile = {
                            name: file.name,
                            url: file.url,
                            type: file.type
                        };

                        // Preserve HTML, CSS, JS and other text source files
                        const isTextFile =
                            typeof file.content === "string" &&
                            (
                                /\.(html?|css|js|jsx|tsx|json|md|txt|xml)$/i.test(file.name || "") ||
                                /^text\//i.test(file.type || "")
                            );

                        if (isTextFile) {
                            safeFile.content = file.content;
                        }

                        return safeFile;
                    })
                    : []
            }))
            : [];

        // Save conversation memory
        await addMessage(conversationId, "user", prompt);
        await addMessage(conversationId, "assistant", response);

        // Save assistant message, images and artifacts
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId,
            role: "assistant",
            content: response,
            images,
            artifacts
        });

        // Return response and artifacts to frontend
        return res.status(200).json({
            answer: response,
            images,
            artifacts
        });

    } catch (error) {
        console.error("Agent controller error:", error);
        console.error("Error response:", error.response?.data);

        return res.status(500).json({
            message: "Agent error",
            error: error.message,
            details: error.response?.data || null
        });
    }
};
