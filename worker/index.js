import assets from '../.sites-runtime/assets.js';
import {chatRoute} from './chat.js';
export default {async fetch(request,env) {
 const path=new URL(request.url).pathname;
 if(path.startsWith('/api/'))return chatRoute(request,env);
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const file=path==='/'?'/index.html':path;
 if(!Object.hasOwn(assets,file))return new Response('Not found',{status:404});
 const type=file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'application/json';
 return new Response(request.method==='HEAD'?null:assets[file],{headers:{'content-type':type+'; charset=utf-8','cache-control':'no-cache','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'}});
}};
