
import { getModel } from "../config/llmModels.js";
import { generatePdf } from "../utils/generatePdf.js";

export const pdfAgent = async (state) => {
    try {
        const llm = await getModel("pdf");

        const prompt = `
You are an expert document writer.

Return ONLY valid JSON.
Do NOT return markdown.
Do NOT return explanations.

Structure:

{
    "title": "",
    "subtitle": "",
    "sections": [
        {
            "heading": "",
            "points": []
        }
    ]
}

Generate 4-8 sections.
Each section should have 3-6 concise bullet points.

Topic:
${state.prompt}
        `;

        const res = await llm.invoke(prompt);

        const rawContent = typeof res.content === "string"
            ? res.content
            : res.content.map(item => item.text || "").join("");

        const content = rawContent.trim()
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/, "");

        const data = JSON.parse(content);

        console.log("PDF DATA:", data);

        // Generate and save the actual PDF file
        const pdfFile = await generatePdf(data);

        console.log("PDF FILE:", pdfFile);

        const baseUrl =
            process.env.PUBLIC_FILE_BASE_URL || "http://localhost:8000";

        return {
            ...state,
            aiResponse: `PDF Generated Successfully!\n\n**${data.title}**`,
            artifacts: [
                {
                    title: data.title,
                    type: "pdf",
                    files: [
                        {
                            name: pdfFile.name,
                            url: `${baseUrl}/generated/${encodeURIComponent(pdfFile.name)}`,
                            type: "application/pdf"
                        }
                    ]
                }
            ]
        };

    } catch (error) {
        console.error("PDF Agent Error:", error);

        return {
            ...state,
            aiResponse: "❌ Failed to generate PDF.",
            artifacts: []
        };
    }
};
