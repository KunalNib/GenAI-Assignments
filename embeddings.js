import "dotenv/config";
import OpenAI from "openai";
const client=new OpenAI();


async  function init(){
    const res=client.embeddings.create({
    model:'text-embedding-3-small',
    input:'I love to visit india',
    encoding_format: "float",
});
console.log(res.data);

}
init();