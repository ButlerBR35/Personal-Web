'use strict';
const albums = window.PHOTO_ALBUMS || [];
const grid=document.querySelector('#grid'), title=document.querySelector('#title'), count=document.querySelector('#count'), back=document.querySelector('#back');
const viewer=document.querySelector('#viewer'), large=document.querySelector('#large'), position=document.querySelector('#position'), error=document.querySelector('#error');
let active=null,index=0;
function picture(src,alt){const img=document.createElement('img');img.src=src;img.alt=alt;img.loading='lazy';img.decoding='async';return img;}
function render(){if(viewer.open)viewer.close();grid.replaceChildren();const id=new URLSearchParams(location.hash.slice(1)).get('album');active=albums.find(a=>a.id===id)||null;back.hidden=!active;title.textContent=active?active.name:'攝影作品';count.textContent=active?`${active.photos.length} 張照片`:`${albums.length} 本相簿・${albums.reduce((n,a)=>n+a.photos.length,0)} 張照片`;
if(active){active.photos.forEach((p,i)=>{const b=document.createElement('button');b.className='card photo';b.setAttribute('aria-label',`${active.name}，第 ${i+1} 張，放大照片`);b.append(picture(p.thumb,`第 ${i+1} 張照片`));b.onclick=()=>{index=i;show();viewer.showModal();};grid.append(b);});}
else{albums.forEach(a=>{const link=document.createElement('a');link.className='card';link.href='#album='+encodeURIComponent(a.id);if(a.photos.length)link.append(picture(a.photos[0].thumb,a.name));const h=document.createElement('h2');h.textContent=a.name;const p=document.createElement('p');p.textContent=`${a.photos.length} 張照片 ↗`;link.append(h,p);grid.append(link);});if(!albums.length)count.textContent='尚未匯入相簿，請先執行匯入工具。';}}
function show(){error.textContent='';large.src=active.photos[index].src;large.alt=`${active.name}，第 ${index+1} 張照片`;position.textContent=`${index+1} / ${active.photos.length}`;document.querySelector('#prev').disabled=index===0;document.querySelector('#next').disabled=index===active.photos.length-1;}
large.onerror=()=>{error.textContent='照片無法載入，請確認 images 資料夾完整。';};
document.querySelector('#close').onclick=()=>viewer.close();
function step(n){if(active&&index+n>=0&&index+n<active.photos.length){index+=n;show();}}
document.querySelector('#prev').onclick=()=>step(-1);document.querySelector('#next').onclick=()=>step(1);
viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}if(e.key==='ArrowRight'){e.preventDefault();step(1);}});
window.addEventListener('hashchange',render);render();
