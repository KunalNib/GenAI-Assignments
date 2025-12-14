import 'dotenv/config';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";


async function init() {
  const pdfFilePath = "./nodejs.pdf";
  const loader = new PDFLoader(pdfFilePath);
  //page by page loading pdf file
  const docs = await loader.load();

  //Ready the client
  const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004"
  });

  const vectorStore=await QdrantVectorStore.fromDocuments(docs,embeddings,{
    url:"http://localhost:64982",collectionName:"Nodejs-collection",
  });
  console.log("indexing of documents")

}

init().catch(console.error);
