
import mongoose from "mongoose";

// Generated file information
const fileSchema = new mongoose.Schema({
    name: {
        type: String
    },
    content: {
        type: String,
        default: undefined
    },
    url: {
        type: String
    },
    type: {
        type: String
    }
}, {
    _id: false
});

// Artifact information
const artifactsSchema = new mongoose.Schema({
    id: {
        type: Number
    },
    type: {
        type: String
    },
    title: {
        type: String
    },
    name: {
        type: String
    },
    content: {
        type: String,
        default: undefined
    },
    url: {
        type: String
    },
    files: {
        type: [fileSchema],
        default: []
    }
}, {
    _id: false
});

// Message information
const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    },

    role: {
        type: String,
        enum: ["user", "assistant"]
    },

    content: {
        type: String
    },

    images: {
        type: [String],
        default: []
    },

    artifacts: {
        type: [artifactsSchema],
        default: []
    }

}, {
    timestamps: true
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
