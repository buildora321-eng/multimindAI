
import { searchTool } from "../config/tavily.js";

export const searchAgent = async (state) => {
    try {
        const results = await searchTool.invoke({
            query: state.prompt,
            search_depth: "advanced",
            max_results: 7,
            include_answer: true,
            include_images: true,
        });

        console.log("Tavily search results:", results);

        return {
            ...state,
            searchResults: results,
            images: results.images || [],
        };
    } catch (error) {
        console.error("Search agent error:", error);

        return {
            ...state,
            searchResults: null,
            images: [],
            searchError: "Web search failed. Please try again.",
        };
    }
};
