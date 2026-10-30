
import { Annotation } from "@langchain/langgraph";

export const agentState = Annotation.Root({
    prompt: Annotation(),
    aiResponse: Annotation(),
    agent: Annotation(),
    conversationId: Annotation(),
    searchResults: Annotation(),
    images: Annotation({
        reducer: (current, update) => update ?? current,
        default: () => []
    }),
    artifacts: Annotation({
        reducer: (current, update) => update ?? current,
        default: () => []
    })
});
