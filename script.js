// Sample artwork, used ONLY if one of your image files is missing
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function art(cat,seed){
  const r=rng(seed*97+cat.length),h=Math.floor(r()*360);
  const c=(o,l)=>`hsl(${(h+o)%360} 65% ${l}%)`;
  let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c(0,cat=='City'?18:62)}"/><stop offset="1" stop-color="${c(40,cat=='City'?38:82)}"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/>`;
  if(cat=='Nature'){
    s+=`<circle cx="${150+r()*500}" cy="${100+r()*80}" r="${40+r()*30}" fill="#fff8"/>`;
    for(let i=0;i<3;i++){let y=300+i*90,pts=`0,600 0,${y}`;for(let x=0;x<=800;x+=100)pts+=` ${x},${y-r()*(140-i*30)}`;s+=`<polygon points="${pts} 800,600" fill="${c(i*25,45-i*10)}"/>`}
  }else if(cat=='City'){
    for(let x=0,i=0;x<800;i++){const w=50+r()*60,hh=150+r()*300;s+=`<rect x="${x}" y="${600-hh}" width="${w}" height="${hh}" fill="${c(180,10+i%3*6)}"/>`;
      for(let y=600-hh+15;y<580;y+=28)for(let k=8;k<w-14;k+=18)if(r()>.5)s+=`<rect x="${x+k}" y="${y}" width="8" height="12" fill="#ffd66b"/>`;x+=w+4}
  }else if(cat=='Ocean'){
    s+=`<circle cx="${200+r()*400}" cy="230" r="55" fill="#fff9"/>`;
    for(let i=0;i<6;i++){let y=300+i*50,d=`M0 600 L0 ${y}`;for(let x=0;x<=800;x+=80)d+=` Q${x+40} ${y-30-r()*20} ${x+80} ${y}`;s+=`<path d="${d} L800 600Z" fill="${c(i*6,40+i*7)}" opacity=".9"/>`}
  }else{
    for(let i=0;i<14;i++)s+=`<circle cx="${r()*800}" cy="${r()*600}" r="${30+r()*120}" fill="${c(r()*120,40+r()*40)}" opacity="${.35+r()*.4}"/>`;
  }
  return'data:image/svg+xml,'+encodeURIComponent(s+'</svg>');
}

const $=id=>document.getElementById(id);
const grid=$('grid'),bar=$('bar'),lb=$('lb'),lbImg=$('lbImg');
let filter='All',list=[],idx=0,timer=null;

// ---- Read pictures straight from index.html ----
const data=[...grid.querySelectorAll('.item')].map((el,i)=>{
  const cat=el.dataset.cat||'Other',title=el.dataset.title||'Untitled',img=el.querySelector('img');
  const fallback=()=>{img.onerror=null;img.src=art(cat,i+1)};
  img.onerror=fallback;
  if(img.complete&&img.naturalWidth===0)fallback();
  el.insertAdjacentHTML('beforeend',`<div class="cap"><b>${title}</b><small>${cat}</small></div>`);
  el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Open '+title);
  // 3D tilt (mouse devices only)
  if(matchMedia('(hover:hover)').matches){
    el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      el.style.setProperty('--ry',((x-.5)*16)+'deg');el.style.setProperty('--rx',((.5-y)*16)+'deg');
      el.style.setProperty('--mx',x*100+'%');el.style.setProperty('--my',y*100+'%')});
    el.addEventListener('mouseleave',()=>{el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')});
  }
  const d={el,img,cat,title};
  el.onclick=()=>open(list.indexOf(d));
  el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}};
  return d;
});

// ---- Category buttons (built automatically from data-cat) ----
[...new Set(data.map(d=>d.cat))].reduce((a,c)=>a.concat(c),['All']).forEach(c=>{
  const b=document.createElement('button');b.className='chip'+(c==='All'?' active':'');b.textContent=c;b.dataset.f=1;
  b.onclick=()=>{filter=c;bar.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('active',x===b));apply()};
  bar.appendChild(b);
});
bar.insertAdjacentHTML('beforeend','<span class="sep"></span>');
const vb=document.createElement('button');vb.className='chip';vb.textContent='View: Grid';
vb.onclick=()=>{const l=grid.classList.toggle('large');vb.textContent='View: '+(l?'Large':'Grid')};
bar.appendChild(vb);

// ---- Filter ----
function apply(){
  list=filter==='All'?data:data.filter(d=>d.cat===filter);
  data.forEach(d=>d.el.classList.toggle('hide',!list.includes(d)));
  list.forEach((d,i)=>{d.el.classList.remove('in');void d.el.offsetWidth;d.el.style.animationDelay=i*40+'ms';d.el.classList.add('in')});
}

// ---- Lightbox ----
function fill(){const d=list[idx];lbImg.src=d.img.currentSrc||d.img.src;lbImg.alt=d.title;$('lbTitle').textContent=d.title;$('lbMeta').textContent=`${d.cat} · ${idx+1} / ${list.length}`}
function show(i){idx=(i+list.length)%list.length;lbImg.classList.add('swap');setTimeout(()=>{fill();lbImg.classList.remove('swap')},180)}
function open(i){idx=i;fill();lb.classList.add('open');document.body.style.overflow='hidden'}
function close(){lb.classList.remove('open');document.body.style.overflow='';stop()}
function stop(){clearInterval(timer);timer=null;$('play').textContent='▶'}
$('next').onclick=()=>show(idx+1);
$('prev').onclick=()=>show(idx-1);
$('close').onclick=close;
$('play').onclick=()=>{if(timer)return stop();$('play').textContent='❚❚';timer=setInterval(()=>show(idx+1),2500)};
lb.onclick=e=>{if(e.target===lb)close()};
document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;
  if(e.key==='ArrowRight')show(idx+1);else if(e.key==='ArrowLeft')show(idx-1);else if(e.key==='Escape')close()});
let sx=0;
lb.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
lb.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>50)show(idx+(d<0?1:-1))});

apply();
