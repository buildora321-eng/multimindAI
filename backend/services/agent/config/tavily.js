
import { TavilySearch } from "@langchain/tavily";

export const searchTool = new TavilySearch({
    maxResults: 7,
    topic: "general",
    searchDepth: "advanced",
    includeImages: true,
});
