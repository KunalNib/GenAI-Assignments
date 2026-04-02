import 'dotenv/config';
import { Memory } from 'mem0ai/oss';
import { OpenAI } from 'openai';

const client = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const mem = new Memory({
    version: 'v1.1',
    vectorStore: {
        provider: 'qdrant',
        config: {
            collectionName: 'memories',
            embeddingModelDims: 1536,
            host: 'localhost',
            port: 6333,
        },
        
    },
    embedder: {
        provider: "gemini",
        config: {
            apiKey: process.env.GEMINI_API_KEY, // ✅ ADD THIS
            model: "gemini-embedding-001"
        }
    }
});

async function chat(query = '') {
    const memories=await mem.search(query,{userId:"123"});
    const response = await client.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [

            { 'role': 'user', content: query },
        ]
    });

    console.log(']\n\nBot:', response.choices[0].message.content);
    console.log("adding to memory...");
    await mem.add([{ 'role': 'user', content: query },
        { 'role': 'assistant', content: response.choices[0].message.content },
    ],{userId:'123'});
    console.log('Adding to memory done...');
}

chat('Hey There,My Name is Kunal');