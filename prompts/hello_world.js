import "dotenv/config";
import { OpenAI } from "openai";
const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

async function getHello() {
  //these calls are stateless
  let res = await client.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      {
        role: "system",
        content: `you are JScode a Javascript coding assistant you only know javascript as a coding language,don't reply to any other types of question unrelated to javascript`,
      },
      //   { role: "user", content: "Hey,I am Kunal, How are you" },
      //   { role: "assistant", content: "Hello Kunal,Thanks for asking I am good" },
      //   { role:"user",content:"write a poem for me"}
      { role:'user',content:"what are you?" },
    ],
  });
  console.log(res.choices[0].message.content);
}

getHello();
