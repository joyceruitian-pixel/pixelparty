import {generateText} from 'ai';
import {createOpenAI} from '@ai-sdk/openai';
import {takeDailySlot} from './quota.js';
const json=(body,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
const configured=env=>Boolean(env.OPENAI_API_KEY&&env.DB);
export function parseMessages(body) {
  if(!body||!Array.isArray(body.messages)||body.messages.length<1||body.messages.length>9)throw Error('messages');
  let total=0;
  const messages=body.messages.map((m,i)=>{
    if(!m||m.role!==(i%2?'assistant':'user')||typeof m.content!=='string'||!m.content.trim()||m.content.length>3000)throw Error('message');
    total+=m.content.length;
    return {role:m.role,content:m.content.trim()};
  });
  if(messages.at(-1).role!=='user'||total>12000)throw Error('conversation');
  return messages;
}
export async function chatRoute(request,env,generate=generateText) {
 const path=new URL(request.url).pathname;
 if(path==='/api/chat/status'&&request.method==='GET')return json({available:configured(env)});
 if(path!=='/api/chat')return json({error:'Not found'},404);
 if(request.method!=='POST')return json({error:'Use POST'},405);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Open chat from Sidequest.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Send JSON.'},415);
 if(!configured(env))return json({error:'AI chat is not connected yet. The site owner needs to finish setup.'},503);
 let messages;
 try{
  // Bound bytes before decoding or parsing, including requests without Content-Length.
  const reader=request.body?.getReader();if(!reader)throw Error();
  const chunks=[];let size=0;
  for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>50000){await reader.cancel();return json({error:'Message is too long.'},413)}chunks.push(value)}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
  messages=parseMessages(JSON.parse(new TextDecoder().decode(bytes)));
 }catch{return json({error:'Please send a shorter message or start a new chat.'},400)}
 try{
  if(!await takeDailySlot(env.DB))return json({error:'The shared daily AI limit is reached. Please try again tomorrow.'},429);
  const openai=createOpenAI({apiKey:env.OPENAI_API_KEY});
  const result=await generate({model:openai.responses('gpt-5.4-nano'),
   instructions:'You are the Sidequest AI helper. Be friendly, concise, and suitable for teenagers. Help with game rules, general questions, coding and learning. Explain schoolwork step by step. Do not request private information. You cannot see the game screen or browse live websites. Never pretend you checked a game, fixed a website, changed an account or bypassed a school restriction. State uncertainty. Sidequest has 16 original browser games, external Cherri games, and CrazyGames directory links that open on CrazyGames. External hosts control access. If a game is blank suggest another version or the official link. AI can make mistakes.',
   messages,maxOutputTokens:600,maxRetries:0,abortSignal:AbortSignal.timeout(25000),
   providerOptions:{openai:{store:false,reasoningEffort:'none'}}});
  if(!result.text?.trim())throw Error('empty');
  return json({text:result.text});
 }catch{
  // Do not return provider errors: they can contain credentials or message text.
  console.error('AI request failed');
  return json({error:'AI is unavailable right now. Your message is still here; try again later.'},502);
 }
}
