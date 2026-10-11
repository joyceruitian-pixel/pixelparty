(()=>{
const games=[
['connect4','Connect Four','Strategy','Drop four discs in a row.','#315b72','●'],
['rps','Rock Paper Scissors','Arcade','Best of five against the computer.','#705069','✊'],
['blackjack','Blackjack 21','Cards','Beat the dealer without going over 21.','#345e4b','21'],
['whack','Whack-a-Bot','Reflex','Tap the bot before it moves.','#76543b','⌁'],
['scramble','Word Scramble','Words','Unscramble eight quick words.','#554e8a','ABC'],
['hilo','Higher or Lower','Cards','Guess the next card.','#7b485f','↑↓'],
['dice','Dice Duel','Arcade','Five rolls. Highest total wins.','#4d6076','⚄'],
['bubbles','Bubble Pop','Reflex','Pop as many bubbles as you can.','#426d83','○'],
['typing','Typing Dash','Words','Type fast for 30 seconds.','#4e7065','⌨'],
['maze','Maze Escape','Puzzle','Find your way to the portal.','#6b6841','◇'],
['sudoku4','Mini Sudoku','Puzzle','Complete a tiny 4×4 grid.','#785653','4×4'],
['catchstar','Catch the Star','Reflex','Catch the runaway star.','#535d8a','★']
];

function message(stage){const box=document.createElement('div');box.className='message extra-message';stage.replaceChildren(box);return box}
function action(label,fn){const b=document.createElement('button');b.className='action';b.textContent=label;b.onclick=fn;return b}
function status(box,text){let p=box.querySelector('.game-status');if(!p){p=document.createElement('p');p.className='game-status';box.append(p)}p.textContent=text}

function connect4(a){
 a.instructions('Tap any square in a column to drop your green disc. Get four in a row before the computer.');
 const cells=Array(42).fill(0);let humanTurn=true;
 const open=c=>{for(let r=5;r>=0;r--)if(!cells[r*7+c])return r*7+c;return-1};
 const win=p=>cells.some((v,i)=>{if(v!==p)return false;const r=Math.floor(i/7),c=i%7;return[[0,1],[1,0],[1,1],[1,-1]].some(([dr,dc])=>{for(let k=1;k<4;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||rr>5||cc<0||cc>6||cells[rr*7+cc]!==p)return false}return true})});
 const draw=()=>{
  const b=a.board(7);cells.forEach((v,i)=>{const t=a.tile(v?'●':'',()=>drop(i%7));t.setAttribute('aria-label',`Row ${Math.floor(i/7)+1}, column ${i%7+1}${v===1?', your disc':v===2?', computer disc':''}`);t.style.color=v===1?'#d3fa73':v===2?'#ff936e':'#606579';t.style.fontSize='36px';b.append(t)});
 };
 const choose=()=>{const cols=[0,1,2,3,4,5,6].filter(c=>open(c)>=0);for(const p of[2,1])for(const c of cols){const i=open(c);cells[i]=p;const good=win(p);cells[i]=0;if(good)return c}return cols[a.rnd(cols.length)]};
 function drop(c){if(!humanTurn||a.isOver())return;const i=open(c);if(i<0)return;cells[i]=1;a.score(a.getScore()+10);draw();if(win(1)){a.end('You connected four!');return}if(!cells.includes(0)){a.end('Draw game');return}humanTurn=false;a.later(()=>{if(a.isOver())return;const cc=choose(),j=open(cc);cells[j]=2;humanTurn=true;draw();if(win(2))a.end('Computer connected four');else if(!cells.includes(0))a.end('Draw game')},320)}
 draw();
}

function rps(a){
 a.instructions('Choose rock, paper, or scissors. Win as many rounds as you can out of five.');
 const choices=['Rock','Paper','Scissors'],icons=['✊','✋','✌️'];let round=0,wins=0;const box=message(a.$('#stage'));box.innerHTML='<h3>Make your move</h3><p class="game-status">Round 1 of 5</p><div class="choice-row"></div>';
 choices.forEach((name,i)=>box.querySelector('.choice-row').append(action(`${icons[i]} ${name}`,()=>play(i))));
 function play(me){if(a.isOver())return;const cpu=a.rnd(3),result=(me-cpu+3)%3;round++;if(result===1){wins++;a.score(wins*20)}status(box,`${icons[me]} You · ${icons[cpu]} Computer — ${result===0?'Tie':result===1?'You win!':'Computer wins'}${round<5?` · Round ${round+1} of 5`:''}`);if(round===5)a.end(wins>=3?'Match won!':wins===2?'Close match!':'Computer wins the match')}
}

function blackjack(a){
 a.instructions('Get closer to 21 than the dealer. Aces count as 1 or 11.');
 const suits=['♠','♥','♦','♣'],ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];let deck=a.shuffle(suits.flatMap(s=>ranks.map((r,i)=>({label:r+s,value:i===0?11:Math.min(10,i+1)})))),player=[ ],dealer=[ ];
 const take=hand=>hand.push(deck.pop());const total=hand=>{let n=hand.reduce((s,c)=>s+c.value,0),aces=hand.filter(c=>c.value===11).length;while(n>21&&aces--)n-=10;return n};take(player);take(dealer);take(player);take(dealer);
 const box=message(a.$('#stage'));
 function finish(){while(total(dealer)<17)take(dealer);const p=total(player),d=total(dealer);render(true);if(p>21)a.end('Bust! Dealer wins');else if(d>21||p>d){a.score(100);a.end('You beat the dealer!')}else if(p===d){a.score(50);a.end('Push — tied hand')}else a.end('Dealer wins')}
 function render(reveal=false){box.innerHTML=`<h3>Dealer: ${dealer.map((c,i)=>!reveal&&i===1?'🂠':c.label).join(' ')}</h3><p>${reveal?total(dealer):'?'}</p><h3>You: ${player.map(c=>c.label).join(' ')}</h3><p>${total(player)}</p><div class="choice-row"></div>`;if(!reveal){box.querySelector('.choice-row').append(action('Hit',()=>{if(a.isOver())return;take(player);if(total(player)>=21)finish();else render()}),action('Stand',()=>{if(!a.isOver())finish()}))}}
 render();
}

function whack(a){
 a.instructions('Tap the glowing bot. It jumps to a new square every moment.');
 const b=a.board(3),buttons=[];let mole=-1,time=30;for(let i=0;i<9;i++){const t=a.tile('',()=>{if(!a.isOver()&&i===mole){a.score(a.getScore()+1);move()}});t.setAttribute('aria-label',`Bot square ${i+1}`);buttons.push(t);b.append(t)}
 function move(){if(mole>=0){buttons[mole].textContent='';buttons[mole].classList.remove('on')}mole=a.rnd(9);buttons[mole].textContent='⌁';buttons[mole].classList.add('on')};move();a.every(move,650);a.every(()=>{time--;a.$('#score').textContent=`${time}s left · Hits: ${a.getScore()}`;if(!time)a.end('Time!')},1000);
}

function scramble(a){
 a.instructions('Unscramble each word. Press Enter or tap Check.');
 const words=a.shuffle(['planet','rocket','pixel','arcade','puzzle','dragon','jungle','castle','meteor','button','silver','banana']);let round=0;const box=message(a.$('#stage'));
 function next(){if(round===8){a.end('All words solved!');return}const answer=words[round++];let mixed=a.shuffle(answer.split('')).join('');if(mixed===answer)mixed=answer.slice(1)+answer[0];box.innerHTML=`<p>Word ${round} of 8</p><h3 style="letter-spacing:6px">${mixed.toUpperCase()}</h3><input aria-label="Your answer" autocomplete="off"><div class="choice-row" style="margin-top:12px"></div><p class="game-status"></p>`;const input=box.querySelector('input');const check=()=>{if(a.isOver())return;if(input.value.trim().toLowerCase()===answer){a.score(a.getScore()+15);next()}else{status(box,'Not quite — try again.');input.select()}};input.onkeydown=e=>{if(e.key==='Enter')check()};box.querySelector('.choice-row').append(action('Check',check));input.focus()}
 next();
}

function hilo(a){
 a.instructions('Guess whether the next card will be higher or lower. Equal cards count as a miss.');
 let current=1+a.rnd(13),round=0;const box=message(a.$('#stage'));
 const name=n=>n===1?'A':n===11?'J':n===12?'Q':n===13?'K':String(n);
 function render(note='Make a guess'){box.innerHTML=`<p>Round ${round+1} of 10</p><h3 style="font-size:72px">${name(current)}</h3><p class="game-status">${note}</p><div class="choice-row"></div>`;box.querySelector('.choice-row').append(action('↓ Lower',()=>guess(false)),action('Higher ↑',()=>guess(true)))}
 function guess(higher){if(a.isOver())return;const next=1+a.rnd(13),good=higher?next>current:next<current;round++;if(good)a.score(a.getScore()+10);const note=`Next card: ${name(next)} — ${good?'Correct!':'Miss'}`;current=next;if(round===10){render(note);a.end(`Finished with ${a.getScore()/10} correct`)}else render(note)}render();
}

function dice(a){
 a.instructions('Roll against the computer for five rounds. Each round win is worth 20 points.');
 let round=0,wins=0;const faces=['⚀','⚁','⚂','⚃','⚄','⚅'],box=message(a.$('#stage'));box.innerHTML='<h3 style="font-size:64px">⚀ vs ⚀</h3><p class="game-status">Round 1 of 5</p><div class="choice-row"></div>';const roll=action('Roll dice',()=>{if(a.isOver())return;const me=a.rnd(6),cpu=a.rnd(6);round++;if(me>cpu){wins++;a.score(wins*20)}box.querySelector('h3').textContent=`${faces[me]} vs ${faces[cpu]}`;status(box,`${me>cpu?'You win the round!':me===cpu?'Tie round':'Computer wins'}${round<5?` · Round ${round+1} of 5`:''}`);if(round===5){roll.disabled=true;a.end(wins>=3?'Dice duel won!':'Dice duel finished')}});box.querySelector('.choice-row').append(roll);
}

function bubbles(a){
 a.instructions('Pop the bubbles before they disappear. You have 20 seconds.');
 const area=document.createElement('div');area.className='tap-arena';a.$('#stage').replaceChildren(area);let time=20;
 function spawn(){if(a.isOver())return;const b=document.createElement('button');b.className='bubble';b.textContent='';b.setAttribute('aria-label','Pop bubble');const size=38+a.rnd(34);b.style.width=b.style.height=size+'px';b.style.left=a.rnd(Math.max(1,area.clientWidth-size))+'px';b.style.top=a.rnd(250)+'px';b.style.background=`hsl(${a.rnd(360)} 75% 65% / .78)`;b.onclick=()=>{if(a.isOver())return;a.score(a.getScore()+1);b.remove()};area.append(b);a.later(()=>b.remove(),1800)}
 a.every(spawn,420);spawn();a.every(()=>{time--;a.$('#score').textContent=`${time}s left · Bubbles: ${a.getScore()}`;if(!time)a.end('Bubble rush complete!')},1000);
}

function typing(a){
 a.instructions('Type the shown word and press Enter. Correct words are worth one point.');
 const words=['game','pixel','speed','jump','laser','cloud','music','green','party','level','quest','score','brave','quick','magic','comet'];let time=30,current='';const box=message(a.$('#stage'));box.innerHTML='<p>Type this:</p><h3></h3><input aria-label="Type the word" autocomplete="off"><p class="game-status">Press Enter after each word.</p>';const input=box.querySelector('input');function next(){current=words[a.rnd(words.length)];box.querySelector('h3').textContent=current.toUpperCase();input.value=''}input.onkeydown=e=>{if(e.key==='Enter'&&!a.isOver()){if(input.value.trim().toLowerCase()===current){a.score(a.getScore()+1);next()}else{status(box,'Try that word again.');input.select()}}};next();input.focus();a.every(()=>{time--;a.$('#score').textContent=`${time}s left · Words: ${a.getScore()}`;if(!time)a.end('Typing dash complete!')},1000);
}

function maze(a){
 a.instructions('Use the arrow keys or buttons to reach the purple portal.');
 const map=['###########','#S#.......#','#.#.#####.#','#.#.....#.#','#.#####.#.#','#.....#.#.#','#####.#.#.#','#.....#...#','#.#######.#','#........G#','###########'];let pos=[1,1];const goal=[9,9];
 function draw(){const b=a.board(11);b.classList.add('maze-board');map.forEach((row,r)=>[...row].forEach((cell,c)=>{const t=document.createElement('div');t.className='maze-cell';const here=pos[0]===r&&pos[1]===c;t.textContent=here?'●':r===goal[0]&&c===goal[1]?'◇':'';if(cell==='#')t.classList.add('wall');if(here)t.classList.add('player');if(r===goal[0]&&c===goal[1])t.classList.add('goal');b.append(t)}))}
 function move(key){if(a.isOver())return;const d={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[key];if(!d)return;const nr=pos[0]+d[0],nc=pos[1]+d[1];if(map[nr][nc]!=='#'){pos=[nr,nc];a.score(a.getScore()+1);draw();if(nr===goal[0]&&nc===goal[1])a.end(`Escaped in ${a.getScore()} steps!`)}}
 a.listen(document,'keydown',e=>{if(e.key.startsWith('Arrow')){e.preventDefault();move(e.key)}});a.controls([['←','ArrowLeft'],['↑','ArrowUp'],['↓','ArrowDown'],['→','ArrowRight']],move);draw();
}

function sudoku(a){
 a.instructions('Tap an empty square to cycle through 1–4. Every row, column, and 2×2 box uses each number once.');
 const solution=[1,2,3,4,3,4,1,2,2,1,4,3,4,3,2,1],start=[1,0,0,4,0,4,1,0,2,0,4,0,0,3,0,1],values=[...start];
 function draw(){const b=a.board(4);b.classList.add('sudoku-board');values.forEach((v,i)=>{const fixed=start[i]!==0,t=a.tile(v||'',()=>{if(fixed||a.isOver())return;values[i]=values[i]%4+1;draw();if(values.every((n,j)=>n===solution[j])){a.score(100);a.end('Mini Sudoku solved!')}});t.disabled=fixed;t.setAttribute('aria-label',`Row ${Math.floor(i/4)+1}, column ${i%4+1}${fixed?', fixed':''}`);if(fixed)t.classList.add('fixed');b.append(t)})}draw();
}

function catchstar(a){
 a.instructions('Tap the star each time it jumps. You have 20 seconds.');
 const area=document.createElement('div');area.className='tap-arena';const star=document.createElement('button');star.className='catch-star';star.textContent='★';star.setAttribute('aria-label','Catch star');area.append(star);a.$('#stage').replaceChildren(area);let time=20;function move(){star.style.left=a.rnd(Math.max(1,area.clientWidth-64))+'px';star.style.top=a.rnd(245)+'px'}star.onclick=()=>{if(!a.isOver()){a.score(a.getScore()+1);move()}};move();a.every(move,850);a.every(()=>{time--;a.$('#score').textContent=`${time}s left · Catches: ${a.getScore()}`;if(!time)a.end('Star chase complete!')},1000);
}

const handlers={connect4,rps,blackjack,whack,scramble,hilo,dice,bubbles,typing,maze,sudoku4:sudoku,catchstar};
globalThis.PixelPartyExtras={games,launch(id,api){const fn=handlers[id];if(fn)fn(api);return!!fn}};
})();
