import { getModel } from "../config/llmModels.js";
import axios from "axios";

export const visionAgent = async (state) => {
    try {
        const llm = await getModel("image");

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
- Stunning visuals

Return only the image prompt.

            User Request:
            ${state.prompt}
        `);

        const prompt =
            typeof res.content === "string"
                ? res.content.trim()
                : JSON.stringify(res.content);

        const imageUrl =
            `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
        const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" })

        const buffer = Buffer.from(imageRes.data)
        const filename = `image-${Date.now()}.png`

        // await uploadToS3(filename,buffer,"image/png")
        // const downloadUrl=await getFromS3(filename,24*60*60)

        return {
            ...state,
            aiResponse: `

![Generated Image](${imageUrl})

⏳ Link expires in 10 minutes.
`
        }
    } catch (error) {
        return {
            ...state,
            aiResponse: "❌ Failed to generate image."
        }
    }
}