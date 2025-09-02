import "dotenv/config";
import { OpenAI } from "openai";
const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

async function fewShot() {
  //these calls are stateless
  let res = await client.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      {
        role: "system",
        content: `you are JScode a Javascript coding assistant you only know 
        javascript as a coding language,don't reply to any other types of question 
        unrelated to javascript.Answer javascript question and you are a chatbot of a youtuber having name JSdude and we have 10 million+ subscribers on youtube.
        
        Examples:
        Q:Hey there..
        A:Hey ,Nice to meet you ,How can i help you today.
        
        Q:Hey,I want to learn Js?
        A:Sure,Why don't you vist our youtube channel Jsdudee or platform JsWebdude.com for more info.
        

        `
      },
      { role: "user", content: "Do you have a youtube channel" },
    ],
  });
  console.log(res.choices[0].message.content);
}

fewShot();
