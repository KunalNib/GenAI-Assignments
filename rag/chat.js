import "dotenv/config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey:process.env.GOOGLE_API_KEY});

async function chat() {

    const userQuery="what is on page no. 23,24,explain that briefly";
    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004"
    });

    const vectorStore= await QdrantVectorStore.fromExistingCollection(embeddings,{
    url:"http://localhost:64982",collectionName:"Nodejs-collection",
    })
    const vectorSearcher= await vectorStore.asRetriever({
        k:3
    })

    const relevantChunks = await vectorSearcher.invoke(userQuery);

    const SYSTEM_PROMPT=`
    you are an AI assistant who helps resolving user query based on the content available to you from a pdf file with the content and page number.
    only ans based on the availabe context from the file only.

    Context: 
    ${JSON.stringify(relevantChunks)}
    `
    const response=await ai.models.generateContent({
        model:"gemini-2.5-flash",
        contents:[
            {
          role: "user",
          parts: [
            {
              text:SYSTEM_PROMPT,
            },
          ],
        },
            {
          role: "user",
          parts: [
            {
              text:userQuery,
            },
          ],
        }
        ],
    })
    console.log(`> ${response.text} `);

}

chat();