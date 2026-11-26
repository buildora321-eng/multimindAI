
import { getModel } from "../config/llmModels.js";
import axios from "axios";

export const visionAgent = async (state) => {
    try {
        const llm = await getModel("image");

        // Generate an optimized image prompt
        const res = await llm.invoke(`
            You are an expert AI image prompt engineer.

            Convert the user's request into a detailed image-generation prompt.

            Requirements:
            - Cinematic lighting
            - Professional composition
            - Ultra realistic
            - High detail
            - Beautiful color palette
            - Sharp focus
            - 8K quality
            - Photorealistic
            - Depth of field
            - Professional photography

            Return only the image prompt.

            User Request: ${state.prompt}
        `);

        const prompt =
            typeof res.content === "string"
                ? res.content.trim()
                : JSON.stringify(res.content);

        if (!prompt) {
            throw new Error("Image prompt is empty");
        }

        // Pollinations API
        const imageUrl =
            `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}` +
            `?model=black-forest-labs/flux.1-schnell`;

        // Generate image
        const imageRes = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 180000,
            headers: {
                Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}`
            }
        });

        // Validate response
        const contentType = imageRes.headers["content-type"];

        if (!contentType?.startsWith("image/")) {
            throw new Error(
                `Invalid image response: ${contentType || "unknown content type"}`
            );
        }

        // Use Pollinations hosted media URL when provided
        const linkHeader = imageRes.headers.link || "";
        const mediaUrl = linkHeader.match(/<([^>]+)>;\s*rel="?enclosure"?/i)?.[1];

        const finalImageUrl = mediaUrl || imageUrl;

        return {
            ...state,
            aiResponse: "Your image has been generated successfully!",
            images: [finalImageUrl],
            artifacts: []
        };

    } catch (error) {
        console.error("❌ IMAGE GENERATION ERROR:", error.message);
        console.error("API RESPONSE:", error.response?.data);

        return {
            ...state,
            aiResponse: `❌ Image generation failed: ${error.message}`,
            images: [],
            artifacts: []
        };
    }
};
