import {createServer} from 'node:http';
import worker from '../dist/server/index.js';
const server=createServer(async(req,res)=>{try {
 const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>50000){res.writeHead(413);res.end();return}chunks.push(chunk)}
 const request=new Request('http://localhost:8765'+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
 const response=await worker.fetch(request,{});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
}catch{res.writeHead(500);res.end('Preview unavailable')}});
server.listen(8765,'127.0.0.1',()=>console.log('Local: http://localhost:8765/'));
