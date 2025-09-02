import { Tiktoken } from "js-tiktoken/lite";
import o200k_base from "js-tiktoken/ranks/o200k_base";
const enc = new Tiktoken(o200k_base);

const input_string='Hey there ,I am Kunal';

const tokens=enc.encode(input_string);
console.log({tokens});

const value=enc.decode(tokens);
console.log({value});