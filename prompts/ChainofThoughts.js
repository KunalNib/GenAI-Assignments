import "dotenv/config";
import { OpenAI } from "openai";
const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

async function Cot() {
  //these calls are stateless
  //Chain of  Thought
  const system_prompt = `
  You are an AI assistant who works on START,THINK AND OUTPUT format,
  So you in the START Step you explain what the user wants,in Think Step
  you should break down the user query into sub-problems and solve the problem
  in multiple steps.think and think multiple times before coming to conclusion
  before output the solution to the user you must check if everything is correct 
  and then output the solution.you should strictly return data in json format as giving below
  the data should be json with step and content.think through multiple stpes before coming to output.
  you should always create the files properly

  Rules:
  -Strictly follow the json format for the Output ,Don't output anything extra like any word or sentence.
  -Always follow the output in sequence that is START,THINK,EVALUATE and OUTPUT.
  -After every think,there is going to be an EVALUATE that is performed manually by someone and you need to wait for it.
  -Always perform one step at a time and wait for other steps,i.e stop after a step for other process
  -Always make sure to do multiple steps of thinking before giving out the output


  OUTPUT JSON Format:
  {"step":"START | THINK | EVALUATE | OUTPUT","content":"string"}

  Example:
  User:Can you solve this equation 3*5+10*14-2*4,
  ASSISTANT:{"step":"START","content":"User wants me to solve the equation 3*5+10*14-2*4"},
  ASSISTANT:{"step":"THINK","content":"Solving a mathematical expression  requires BODMAS rule,Let's apply BODMAS Rule on given equation"},
  ASSISTANT:{"step":"EVALUATE","content":"OK that looks good"},
  ASSISTANT:{"step":"THINK","content":"according to BODMAS with have to solve multipy and divide first and should go from left to right Breaking down the equation into three parts."},
  ASSISTANT:{"step":"EVALUATE","content":"OK that looks good"},
  ASSISTANT:{"step":"THINK","content":"the equation after breaking down into three parts gives 3*5 which is 15 , 10*14 which is 140 and 2*4 which is 8"},
  ASSISTANT:{"step":"EVALUATE","content":"OK that looks good"},
  ASSISTANT:{"step":"THINK","content":"Breaking down the equation into three parts 3*5 which is 15 , 10*14 which is 140 and 2*4 which is 8"},
  ASSISTANT:{"step":"EVALUATE","content":"OK that looks good"},
  ASSISTANT:{"step":"THINK","content":"Adding 15 and 140 we get  155 and subtracting 8 from 155 gives 147"},
  ASSISTANT:{"step":"EVALUATE","content":"OK that looks good"},
  ASSISTANT:{"step":"OUTPUT","content":"3*5+10*14-2*4 is equal to 147"},`;

  const messages = [
    {
      role: "system",
      content: system_prompt,
    },
    { role: "user", content: "3*4-7+35*2-4/2+18" },
  ];

  while (true) {
    let res = await client.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: messages,
      response_format: { type: "json_object" },
    });
    let raw = res.choices[0].message.content;
    // console.log(raw);
    // raw = raw
    //   .trim()
    //   .replace(/^```(?:json)?\s*/i, "")
    //   .replace(/```$/, "");

    const Content = JSON.parse(raw);
    messages.push({
      role: "assistant",
      content: JSON.stringify(Content),
    });
    if (Content.step === "START") {
      console.log(`🚀`, Content.content);
      continue;
    }
    //Todo-send the messages as history to maybe gemini and ask for review
    //when we use the Other LLMS like gemini or chatgpt we call this technique as
    //LLM as a judge technique
    if (Content.step === "THINK") {
      console.log(`🧠`, Content.content);
      messages.push({
        role:"user",
        content:JSON.stringify({
          step:"EVALUATE",
          content:"bad"
        })
      })
      continue;
    }
    if (Content.step === "OUTPUT") {
      console.log(`🤖`, Content.content);
      break;
    }
  }
}

Cot();

