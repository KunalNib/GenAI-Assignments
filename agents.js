import "dotenv/config";
import { OpenAI } from "openai";
import {exec} from "child_process";
import axios from "axios"
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let input="";
rl.question("What do you want to do ?  ", (userinput) => {
  input=userinput;
  rl.close();
  Agent(input);
});

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});


async function executeCommand(command=""){
  return new Promise((res,rej)=>{
    exec(command,(error,data)=>{
      if(error){
        return res(`Error running command ${error}`);
      }
      else{
        res(data);
      }
    })
  })
}


async function getWeatherDatabyCity(cityname="") {
    const url=`https://wttr.in/${cityname.toLowerCase()}?format=%C+%t`;
    const {data}= await axios.get(url,{responseType:'text'});
    return `The current Weather of ${cityname} is ${data} `;
}

// getWeatherDatabyCity('nagpur').then(console.log)
async function getGithubUserInfoByUsername(username="") {
    const url=`https://api.github.com/users/${username}`;
    const {data}= await axios.get(url);
    return JSON.stringify({
      login:data.login,
      id:data.id,
      name:data.name,
      location:data.location,
      public_repos:data.public_repos,
      public_gists:data.public_gists,
      followers:data.followers,
      following:data.following
    })
}

// let data=await getGithubUserInfoByUsername('kunalNib');
// console.log(data);

const TOOL_MAP={
    getWeatherDatabyCity:getWeatherDatabyCity,
    getGithubUserInfoByUsername:getGithubUserInfoByUsername,
    executeCommand:executeCommand,
}

async function Agent(input="") {
  //these calls are stateless
  //Chain of  Thought
  const system_prompt = `
  You are an AI assistant who works on START,THINK,TOOL AND OUTPUT format,
  So you in the START Step you explain what the user wants,in Think Step
  you should break down the user query into sub-problems and solve the problem
  in multiple steps.think and think multiple times before coming to conclusion
  before output the solution to the user you must check if everything is correct 
  and then output the solution.you should strictly return data in json format as giving below
  the data should be json with step and content.think through multiple stpes before coming to output.
  if the Think step is about calling the TOOL call the Tool and use the response from observe step for thinking and output
  Don't return anything in OBSERVE stage that's only for you to get the data only return for other steps
  you are well versed in exectuting commands for specfic things using a tool names executeCommand which utilizes exec in child_process of node 
  please provide proper code and don't mixup anything like symbols "\n" in the code


  Available Tools:
  getWeatherDatabyCity(city: string):Returns the current weather data of the city.
  getGithubUserInfoByUsername(username:string):Returns the Github public github data of the user.
  executeCommand(command:string): Takes a linux/unix command as arg and executes the command on user's machine and returns the output

  Rules:
  - Don't name steps anything other than START | THINK | TOOL | OBSERVE | OUTPUT don't give me anything like final
  -Strictly follow the json format for the Output ,Don't output anything extra like any word or sentence.
  -Always follow the output in sequence that is START,THINK ;and OUTPUT.
  -Always perform one step at a time and wait for other steps,i.e stop after a step for other process
  -Always remember to use tool whem necessary and call the tool.
  -Call Tool when then The think step is about calling the tool
  -Always make sure to do multiple steps of thinking before giving out the output
  - you should return json format for reasoning steps, 
  - but when user specifically asks for code or file content, 
  - return raw code inside triple backticks without wrapping in JSON

  #Important
  according to your previous uses you are adding symbols like '(\n)'  and covering the code quotes ->"" please give proper 
  code with proper syntax and review syntax properly

  OUTPUT JSON Format:
  {"step":"START | THINK | TOOL | OUTPUT","content":"string" , "input":"string", "tool_name":"string"}

  Example:
  User:Hey,can you tell me weather of Nagpur?
  ASSISTANT:{"step":"START","content":"The User is interested in Current Weather Details of Patiala"},
  ASSISTANT:{"step":"THINK","content":":Let me see if there is any tool for this query"},
  ASSISTANT:{"step":"THINK","content":"Ok ,I see there is a tool name async function getWeatherDatabyCity which returns current weather details},
  ASSISTANT:{"step":"TOOL","input":"Nagpur","tool_name":"getWeatherDatabyCity"},
  DEVELOPER:{"step":"OBSERVE","content":"The Weather of Nagpur is 23 Cel with Drizze,rain with thunderStorm"},
  ASSISTANT:{"step":"THINK","content":"Great ,I got the weather Details"},
  ASSISTANT:{"step":"OUTPUT","content":"The Weather in Nagpur is 23 Cel with Drizzle and rain with thunderSTorm,Please remember to carry umbrella"},
  `;

  const messages = [
    {
      role: "system",
      content: system_prompt,
    },
    { role: "user", content: input}
  ];

  while (true) {
    let res = await client.chat.completions.create({
      model: "gemini-2.5-flash",
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
      continue;
    }
    if(Content.step=="TOOL"){
        const toolToCall=Content.tool_name;
        if(!TOOL_MAP[toolToCall]){
            messages.push({
                role:"user",
                content:`There is no such tool as ${toolToCall}`
            })
            continue;
        }
        const responseFromTool=await TOOL_MAP[toolToCall](Content.input);
        messages.push({
            role:"user",
            content:JSON.stringify({
              step:"OBSERVE",
              content:`${responseFromTool}`
            })
        })
        console.log(`🔨`, responseFromTool);
        continue;
    }


    if (Content.step === "OUTPUT") {
      console.log(`🤖`, Content.content);
      break;
    }
  }
}


