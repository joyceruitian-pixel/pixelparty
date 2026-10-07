(()=>{
 const el=id=>document.getElementById(id),dialog=el('ai-dialog'),status=el('ai-status'),input=el('ai-input'),send=el('ai-send'),log=el('ai-messages');
 let available=false,busy=false,history=[],controller=null,generation=0,gameBeforeChat=null,pausedBeforeChat=false;
 function update(){send.disabled=!available||busy;el('ai-clear').disabled=busy;el('ai-check').disabled=busy;input.disabled=busy;send.textContent=busy?'Thinking…':'Send ↗'}
 async function check(){status.textContent='Checking AI connection…';try{const r=await fetch('/api/chat/status',{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();available=(await r.json()).available===true;status.textContent=available?'AI is ready · a shared daily message limit applies.':'AI is not connected yet. The site owner needs to finish setup before anyone can chat.'}catch{available=false;status.textContent='Could not reach AI. Check your connection and try again.'}update()}
 function message(role,text){const item=document.createElement('div');item.className='chat-message '+role;const label=document.createElement('strong'),body=document.createElement('p');label.textContent=role==='user'?'You':'Sidequest AI';body.textContent=text;item.append(label,body);log.append(item);item.scrollIntoView({block:'nearest'})}
 function open(){gameBeforeChat=typeof active!=='undefined'?active:null;pausedBeforeChat=typeof paused!=='undefined'?paused:false;if(gameBeforeChat&&!gameBeforeChat[6]&&!over){paused=true;keys={}}dialog.showModal();if(!history.length&&!input.value&&typeof active!=='undefined'&&active)input.value='How do I play '+active[1]+'?';check();input.focus()}
 el('ask-ai').onclick=open;el('game-ai').onclick=open;el('ai-close').onclick=()=>dialog.close();el('ai-check').onclick=check;
 dialog.addEventListener('close',()=>{if(gameBeforeChat&&active===gameBeforeChat){paused=pausedBeforeChat;keys={}}gameBeforeChat=null;generation++;controller?.abort();controller=null;busy=false;update()});
 el('ai-clear').onclick=()=>{history=[];log.replaceChildren();input.value='';input.focus()};
 document.querySelectorAll('[data-prompt]').forEach(b=>b.onclick=()=>{input.value=b.dataset.prompt;input.focus()});
 el('ai-form').onsubmit=async e=>{
  e.preventDefault();if(!available||busy||!input.value.trim())return;
  const text=input.value.trim(),current=++generation;busy=true;update();status.textContent='Thinking…';
  controller=new AbortController();const timer=setTimeout(()=>controller?.abort(),30000);
  // Keep the last two pairs so the server receives bounded context.
  const messages=[...history.slice(-4),{role:'user',content:text}];
  try{const r=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages}),signal:controller.signal});const data=await r.json();if(!r.ok)throw Error(data.error||'AI could not answer. Try again.');if(typeof data.text!=='string'||!data.text.trim())throw Error('No answer arrived. Try again.');if(current!==generation)return;
   message('user',text);message('assistant',data.text);history=[...messages,{role:'assistant',content:data.text}];input.value='';status.textContent='Ready for your next question.';
  }catch(error){if(current===generation)status.textContent=error.name==='AbortError'?'That took too long. Your message is still here—try again.':error.message;
  }finally{clearTimeout(timer);if(current===generation){busy=false;controller=null;update();input.focus()}}
 };
})();
