
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];

        console.log("userId", userId);

        const conversation = await Conversation.create({
            userId: userId
        });

        return res.status(200).json(conversation);

    } catch (error) {
        console.error("Create Conversation Error:", error);

        return res.status(500).json({
            message: `create conversation error ${error.message}`
        });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];

        console.log("userId", userId);

        const conversations = await Conversation.find({
            userId: userId
        }).sort({
            updatedAt: -1
        });

        return res.status(200).json(conversations);

    } catch (error) {
        console.error("Get Conversations Error:", error);

        return res.status(500).json({
            message: `get conversation error ${error.message}`
        });
    }
};

export const updateConversation = async (req, res) => {
    try {
        const { id, title } = req.body;

        const conversation = await Conversation.findByIdAndUpdate(
            id,
            { title },
            { new: true }
        );

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        return res.status(200).json(conversation);

    } catch (error) {
        console.error("Update Conversation Error:", error);

        return res.status(500).json({
            message: `update conversation error ${error.message}`
        });
    }
};

export const saveMessage = async (req, res) => {
    try {
        const {
            conversationId,
            role,
            content,
            images,
            artifacts
        } = req.body;

        // Prepare artifacts for MongoDB.
        // Preserve Buildora source files, but remove Base64 binary data.
        const safeArtifacts = Array.isArray(artifacts)
            ? artifacts.map(artifact => {
                const safeArtifact = {
                    ...artifact,

                    // Remove top-level Base64 content.
                    content: undefined
                };

                if (Array.isArray(artifact.files)) {
                    safeArtifact.files = artifact.files.map(file => {
                        const safeFile = {
                            name: file.name,
                            url: file.url,
                            type: file.type
                        };

                        // Preserve Buildora HTML, CSS and JS content.
                        // Binary files should use their generated file URL.
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
                    });
                }

                return safeArtifact;
            })
            : [];

        const message = await Message.create({
            conversationId,
            content,
            role,
            images: Array.isArray(images) ? images : [],
            artifacts: safeArtifacts
        });

        // Update conversation timestamp
        await Conversation.findByIdAndUpdate(conversationId, {
            updatedAt: new Date()
        });

        return res.status(200).json(message);

    } catch (error) {
        console.error("Save Message Error:", error);

        return res.status(500).json({
            message: `save message error ${error.message}`
        });
    }
};

export const getMessage = async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId
        }).sort({
            createdAt: 1
        });

        return res.status(200).json(messages);

    } catch (error) {
        console.error("Get Messages Error:", error);

        return res.status(500).json({
            message: `get messages error ${error.message}`
        });
    }
};
