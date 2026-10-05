import * as THREE from 'three';
import { PART_BY_ID, type SoldMap } from '../data/parts';
import { REDUCED } from '../lib/motion';
import { loadPalio } from './model';
import { paintAll, pulseSelected, setSelected, setSold } from './paint';
import { Viewer, checkerTexture } from './viewer';

export interface GarageHandle { select: (id: string) => void; setSold: (s: SoldMap) => void; resize: () => void; dispose: () => void }
interface Opts { onPart: (id: string) => void; onLoaded: () => void; onError: () => void }

/* fonts painted into canvas textures (neon signs, posters, floor number) must be loaded before drawing */
function canvasFonts() {
  const want = ['120px "Sedgwick Ave Display"', '150px "Bowlby One"', '34px "Permanent Marker"', '34px "Special Elite"'];
  const all = Promise.all(want.map(f => document.fonts?.load(f))).catch(() => {});
  return Promise.race([all, new Promise(r => setTimeout(r, 1500))]);
}

/** camera positions per zone; the camera flies to look at the chosen part */
const VIEWS: Record<string, [number, number, number]> = { 'Frente':[4.4,1.55,3.0], 'Atrás':[-4.4,1.6,-3.0], 'Arriba':[3.2,4.3,3.6], 'Lado izq.':[1.0,1.35,-5.4], 'Lado der.':[1.0,1.35,5.4] };

/** The game-style garage: full-screen scene, glossy floor with a faked reflection, props, neon, a flying camera. */
export function createGarage(host: HTMLElement, sold: SoldMap, { onPart, onLoaded, onError }: Opts): GarageHandle {
  setSold(sold);
  const gar = new Viewer(host, { fov: 36, pos: [5.6, 1.8, 4.2], target: [0, .62, 0], minD: 3.2, maxD: 12 });
  const gs = gar.scene; gar.liftOnNarrow = true; gar.resize();
  let disposed = false;

  function buildEnvironment() {
  gs.background = new THREE.Color(0x0b0a0d); gs.fog = new THREE.Fog(0x0b0a0d, 13, 34);
  gs.add(new THREE.HemisphereLight(0xffe9c8, 0x141218, .85));
  { const spot = new THREE.SpotLight(0xfff1d8, 60, 14, .62, .55, 1.6); spot.position.set(0,6.2,0); spot.target.position.set(0,0,0);
    spot.castShadow=true; spot.shadow.mapSize.set(2048,2048); spot.shadow.bias=-0.0006; spot.shadow.normalBias=.03; gs.add(spot, spot.target);
    const red = new THREE.PointLight(0xff2a2a, 7, 9, 1.8); red.position.set(-4.6,2.6,-3.4); gs.add(red);
    const warm = new THREE.PointLight(0xffb347, 6, 9, 1.8); warm.position.set(4.8,2.8,3.4); gs.add(warm);
    const key = new THREE.DirectionalLight(0xdfe6ff, .7); key.position.set(-3,4,5); gs.add(key); }
  /* glossy floor with a faked reflection (mirrored car under a semi-opaque floor) */
  const floorMat = new THREE.MeshStandardMaterial({color:0x17161a, roughness:.48, metalness:.25, transparent:true, opacity:.84});
  { const f=new THREE.Mesh(new THREE.CircleGeometry(16,64), floorMat); f.rotation.x=-Math.PI/2; f.receiveShadow=true; gs.add(f);
    // painted bay lines
    const paintM=new THREE.MeshBasicMaterial({color:0xf1c232, transparent:true, opacity:.75});
    for(const [w,h,x,z] of [[5.6,.07,0,-1.55],[5.6,.07,0,1.55],[.07,3.17,-2.8,0],[.07,3.17,2.8,0]]){
      const l=new THREE.Mesh(new THREE.PlaneGeometry(w,h),paintM); l.rotation.x=-Math.PI/2; l.position.set(x,.004,z); gs.add(l); }
    const ck=new THREE.Mesh(new THREE.PlaneGeometry(3.1,.42),new THREE.MeshBasicMaterial({map:checkerTexture(),transparent:true,opacity:.6}));
    ck.rotation.x=-Math.PI/2; ck.rotation.z=Math.PI/2; ck.position.set(3.25,.004,0); gs.add(ck);
    // number painted on the floor
    const c=document.createElement('canvas'); c.width=256; c.height=256; const g=c.getContext('2d')!;
    g.strokeStyle='#ece6d6'; g.lineWidth=14; g.beginPath(); g.arc(128,128,110,0,Math.PI*2); g.stroke();
    g.fillStyle='#ece6d6'; g.font='150px "Bowlby One", Impact, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('13',128,138);
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
    const num=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.4),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:.35}));
    num.rotation.x=-Math.PI/2; num.rotation.z=-Math.PI/2; num.position.set(-3.7,.004,0); gs.add(num); }
  /* corrugated walls */
  { const c=document.createElement('canvas'); c.width=512; c.height=256; const g=c.getContext('2d')!;
    const gr=g.createLinearGradient(0,0,0,256); gr.addColorStop(0,'#141317'); gr.addColorStop(1,'#232127'); g.fillStyle=gr; g.fillRect(0,0,512,256);
    for(let x=0;x<512;x+=16){ const lg=g.createLinearGradient(x,0,x+16,0); lg.addColorStop(0,'rgba(255,255,255,.06)'); lg.addColorStop(.5,'rgba(0,0,0,.25)'); lg.addColorStop(1,'rgba(255,255,255,.04)'); g.fillStyle=lg; g.fillRect(x,0,16,256); }
    const t=new THREE.CanvasTexture(c); t.wrapS=THREE.RepeatWrapping; t.repeat.set(6,1); t.colorSpace=THREE.SRGBColorSpace;
    const wall=new THREE.Mesh(new THREE.CylinderGeometry(11,11,7,48,1,true), new THREE.MeshStandardMaterial({map:t, side:THREE.BackSide, roughness:.8, metalness:.3}));
    wall.position.y=3.5; gs.add(wall); }
  /* neon sign + ceiling light bars + props */
  function neon(text: string, color: string, w = 6, h = 1.1) {
    const c=document.createElement('canvas'); c.width=1024; c.height=200; const g=c.getContext('2d')!;
    g.font='120px "Sedgwick Ave Display","Permanent Marker",cursive'; g.textAlign='center'; g.textBaseline='middle';
    g.shadowColor=color; g.shadowBlur=40; g.fillStyle=color; g.fillText(text,512,104); g.shadowBlur=12; g.fillStyle='#fff'; g.globalAlpha=.85; g.fillText(text,512,104);
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
    return new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({map:t, transparent:true, depthWrite:false}));
  }
  { const n1=neon('PROYECT CAR','#ff2a3a',5.2,.95); n1.position.set(-2.0,3.5,-9.75); n1.lookAt(0,3.5,0); gs.add(n1);
    const nb=new THREE.Mesh(new THREE.BoxGeometry(5.6,1.15,.08),new THREE.MeshStandardMaterial({color:0x101014,roughness:.6})); nb.position.copy(n1.position); nb.lookAt(0,3.5,0); nb.translateZ(-.07); gs.add(nb);
    const n2=neon('taller 13','#f1c232',3.2,.66); n2.position.set(6.1,3.1,-7.8); n2.lookAt(0,3.1,0); gs.add(n2);
    const nb2=new THREE.Mesh(new THREE.BoxGeometry(3.4,.8,.08),new THREE.MeshStandardMaterial({color:0x101014,roughness:.6})); nb2.position.copy(n2.position); nb2.lookAt(0,3.1,0); nb2.translateZ(-.07); gs.add(nb2);
    const barM=new THREE.MeshBasicMaterial({color:0xfff6e2});
    for(const z of [-1.6,0,1.6]){ const b=new THREE.Mesh(new THREE.BoxGeometry(5.2,.05,.12),barM); b.position.set(0,5.6,z); gs.add(b); }
    const tireM=new THREE.MeshStandardMaterial({color:0x121114, roughness:.9});
    for(const [x,z,n] of [[-6.2,-6.4,4],[-5.4,-7.2,3],[7.2,5.4,4]]) for(let i=0;i<n;i++){
      const t=new THREE.Mesh(new THREE.TorusGeometry(.33,.14,10,24),tireM); t.rotation.x=Math.PI/2; t.position.set(x,.14+i*.28,z); t.castShadow=true; gs.add(t); }
    const box=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.1,.6),new THREE.MeshStandardMaterial({color:0xb3161d, roughness:.45, metalness:.4}));
    box.position.set(6.8,.55,-6.2); box.lookAt(0,.55,0); box.castShadow=true; gs.add(box); }
  
  /* ---- more garage: workbench, shadow board, lift, drums, cones, posters, roll-up door ---- */
  function ctex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d')!,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
  /* hang things on the round wall: pull them in to a fixed radius so wide pieces don't sink into the curve */
  function onWall(mesh: THREE.Object3D, x: number, y: number, z: number, R = 10.1){ const a=Math.atan2(z,x); mesh.position.set(Math.cos(a)*R,y,Math.sin(a)*R); mesh.lookAt(0,y,0); gs.add(mesh); return mesh; }
  const std=(color: number, o: THREE.MeshStandardMaterialParameters = {})=>new THREE.MeshStandardMaterial(Object.assign({color,roughness:.7,metalness:.15},o));
  function addBox(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, ry = 0){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); m.rotation.y=ry; m.castShadow=m.receiveShadow=true; gs.add(m); return m; }
  {
    // shadow board with tool outlines, behind a workbench (−x wall: seen from the front views)
    const board=ctex(1024,512,(g,w,h)=>{ g.fillStyle='#3b3a3f'; g.fillRect(0,0,w,h);
      g.fillStyle='rgba(0,0,0,.45)'; for(let y=16;y<h;y+=24) for(let x=16;x<w;x+=24){ g.beginPath(); g.arc(x,y,3.2,0,7); g.fill(); }
      const tool=(x: number, y: number, len: number, head: number, rot: number, col: string)=>{ g.save(); g.translate(x,y); g.rotate(rot);
        g.strokeStyle='#ece6d6'; g.lineWidth=5; g.fillStyle=col; g.beginPath(); g.roundRect(-8,0,16,len,6); g.fill(); g.stroke();
        g.beginPath(); g.arc(0,-head*.6,head,0,7); g.fill(); g.stroke(); g.fillStyle='#3b3a3f'; g.beginPath(); g.arc(0,-head*.9,head*.45,0,7); g.fill(); g.restore(); };
      ([[120,140,220,34,0,'#9a96a0'],[200,150,200,30,0,'#9a96a0'],[280,160,180,26,0,'#9a96a0'],[360,170,160,22,0,'#9a96a0']] as [number,number,number,number,number,string][]).forEach(a=>tool(...a));
      g.save(); g.translate(560,120); g.strokeStyle='#ece6d6'; g.lineWidth=5; g.fillStyle='#b3161d'; g.beginPath(); g.roundRect(-14,40,28,230,8); g.fill(); g.stroke();
      g.fillStyle='#7d7983'; g.beginPath(); g.roundRect(-60,0,120,46,8); g.fill(); g.stroke(); g.restore();
      g.save(); g.translate(720,110); g.strokeStyle='#ece6d6'; g.lineWidth=5; g.fillStyle='#f1c232'; g.beginPath(); g.roundRect(-18,0,36,120,10); g.fill(); g.stroke();
      g.fillStyle='#c8c5cc'; g.beginPath(); g.roundRect(-5,120,10,170,4); g.fill(); g.stroke(); g.restore();
      g.save(); g.translate(870,120); g.strokeStyle='#ece6d6'; g.lineWidth=5; g.fillStyle='#2f6fe0'; for(const dx of [-26,26]){ g.beginPath(); g.roundRect(dx-10,60,20,190,8); g.fill(); g.stroke(); }
      g.fillStyle='#9a96a0'; g.beginPath(); g.moveTo(-30,70); g.lineTo(0,-10); g.lineTo(30,70); g.closePath(); g.fill(); g.stroke(); g.restore();
      g.fillStyle='#ece6d6'; g.font='34px "Permanent Marker",cursive'; g.fillText('no te lo lleves  >:(',90,470); });
    onWall(new THREE.Mesh(new THREE.PlaneGeometry(4.2,2.1),new THREE.MeshStandardMaterial({map:board,roughness:.85})),-10.75,2.35,-1.2);
    const wood=std(0x6b4a2e,{roughness:.8}), steel=std(0x55535a,{metalness:.6,roughness:.4});
    addBox(.85,.08,3.6,wood,-9.9,.95,-1.2);
    for(const z of [-2.85,.45]) for(const x of [-10.25,-9.55]) addBox(.07,.95,.07,steel,x,.47,z);
    addBox(.75,.5,1.2,std(0xb3161d,{metalness:.4,roughness:.45}),-9.95,1.24,-2.2);            // tool case on the bench
    for(const [z,c] of [[-.2,0x2f6fe0],[.05,0xf1c232],[.28,0x3fb36b]]){ const can=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.26,14),std(c,{metalness:.5})); can.position.set(-9.9,1.12,z); gs.add(can); }
    // lamp over the bench
    const lampM=std(0x2a282e,{metalness:.5}); const shade=new THREE.Mesh(new THREE.ConeGeometry(.4,.35,20,1,true),lampM); shade.position.set(-9.4,3.1,-1.2); gs.add(shade);
    const bulb=new THREE.Mesh(new THREE.SphereGeometry(.1,12,8),new THREE.MeshBasicMaterial({color:0xffe2a8})); bulb.position.set(-9.4,2.95,-1.2); gs.add(bulb);
    const benchL=new THREE.PointLight(0xffc477, 9, 6, 1.6); benchL.position.set(-9.3,2.8,-1.2); gs.add(benchL);
    // rolling tool chest
    const chestTex=ctex(256,512,(g,w,h)=>{ g.fillStyle='#b3161d'; g.fillRect(0,0,w,h); for(let y=40;y<h-20;y+=58){ g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(10,y,w-20,4); g.fillStyle='#c8c5cc'; g.fillRect(70,y+20,w-140,10); } g.fillStyle='#ece6d6'; g.font='bold 30px "Bowlby One",Impact'; g.fillText('13',w-60,36); });
    const chest=addBox(1.1,1.5,.6,new THREE.MeshStandardMaterial({map:chestTex,metalness:.45,roughness:.4}),-8.4,.8,-5.8); chest.lookAt(0,.8,0);
    // shelving with boxes and oil cans (−z wall corner)
    const shelfM=std(0x3a3940,{metalness:.5,roughness:.5});
    const sx=-5.6, sz=-8.9, sry=Math.atan2(-sx,-sz);
    const shelf=new THREE.Group(); shelf.position.set(sx,0,sz); shelf.rotation.y=sry; gs.add(shelf);
    for(const y of [.25,1.0,1.75,2.5]){ const b=new THREE.Mesh(new THREE.BoxGeometry(2.4,.05,.6),shelfM); b.position.y=y; shelf.add(b); }
    for(const x of [-1.18,1.18]) for(const z of [-.28,.28]){ const p=new THREE.Mesh(new THREE.BoxGeometry(.05,2.6,.05),shelfM); p.position.set(x,1.3,z); shelf.add(p); }
    const boxCols=[0xc4a273,0xb8955f,0xd0b085,0x2f6fe0,0xb3161d,0xf1c232];
    [[-.8,.4,.5,.35],[-.2,.4,.4,.3],[.5,.4,.6,.3],[-.7,1.15,.35,.28],[0,1.15,.5,.32],[.75,1.15,.3,.26],[-.6,1.9,.6,.36],[.4,1.9,.4,.3],[-.1,2.65,.5,.3]].forEach(([x,y,w,h],i)=>{
      const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,.42),std(boxCols[i%boxCols.length],{roughness:.9})); b.position.set(x,y-.125+h/2,0); b.castShadow=true; shelf.add(b); });
    // oil drums
    for(const [x,z,c] of [[8.1,-5.4,0x2f6fe0],[8.7,-4.6,0xb3161d],[7.6,-6.2,0x3a3940]]){
      const d=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.95,22),std(c,{metalness:.45,roughness:.45})); d.position.set(x,.475,z); d.castShadow=true; gs.add(d);
      for(const y of [.25,.7]){ const r=new THREE.Mesh(new THREE.TorusGeometry(.325,.02,6,28),steel); r.rotation.x=Math.PI/2; r.position.set(x,y,z); gs.add(r); } }
    // traffic cones
    const coneM=std(0xff6a1a,{roughness:.6}), white=std(0xece6d6);
    for(const [x,z] of [[5.6,6.8],[6.4,6.1],[-5.9,6.7]]){
      const base=new THREE.Mesh(new THREE.BoxGeometry(.42,.04,.42),coneM); base.position.set(x,.02,z); gs.add(base);
      const cone=new THREE.Mesh(new THREE.ConeGeometry(.16,.62,18),coneM); cone.position.set(x,.35,z); cone.castShadow=true; gs.add(cone);
      const band=new THREE.Mesh(new THREE.CylinderGeometry(.095,.115,.1,18),white); band.position.set(x,.42,z); gs.add(band); }
    // two-post lift in the second bay (+z side)
    const liftM=std(0xf1c232,{metalness:.4,roughness:.5});
    for(const x of [-2.2,2.2]){ addBox(.32,3.4,.32,liftM,x,1.7,7.6); addBox(.6,.08,.6,steel,x,.04,7.6); addBox(1.1,.08,.14,steel,x+(x<0?.55:-.55),.6,7.25); }
    addBox(4.75,.16,.2,liftM,0,3.3,7.6);
    const paintM2=new THREE.MeshBasicMaterial({color:0xf1c232,transparent:true,opacity:.5});
    for(const [w,h,x,z] of [[5.6,.07,0,5.9],[5.6,.07,0,9.0]]){ const l=new THREE.Mesh(new THREE.PlaneGeometry(w,h),paintM2); l.rotation.x=-Math.PI/2; l.position.set(x,.004,z); gs.add(l); }
    // roll-up door on the +z wall, seen from the left-side views
    const doorTex=ctex(512,512,(g,w,h)=>{ for(let y=0;y<h;y+=32){ const lg=g.createLinearGradient(0,y,0,y+32); lg.addColorStop(0,'#8e8a93'); lg.addColorStop(.6,'#6a6670'); lg.addColorStop(1,'#2b292e'); g.fillStyle=lg; g.fillRect(0,y,w,32); }
      g.fillStyle='rgba(20,18,22,.8)'; g.font='64px "Sedgwick Ave Display","Permanent Marker",cursive'; g.save(); g.translate(250,250); g.rotate(-.12); g.textAlign='center'; g.fillText('regio motors',0,0); g.restore();
      g.fillStyle='#1d1b20'; g.fillRect(0,h-26,w,26); });
    const rdoor=new THREE.Mesh(new THREE.PlaneGeometry(4.6,3.6),new THREE.MeshStandardMaterial({map:doorTex,metalness:.4,roughness:.55})); onWall(rdoor,1.4,1.8,10.75,10.1);
    const frameM=std(0x1d1b20); const fr=new THREE.Mesh(new THREE.BoxGeometry(5,.2,.2),frameM); onWall(fr,1.4,3.65,10.7,10.05);
    for(const dx of [-2.4,2.4]){ const jamb=new THREE.Mesh(new THREE.BoxGeometry(.2,3.7,.2),frameM); onWall(jamb,1.4,1.85,10.7,10.05); jamb.translateX(dx); }
    // posters and flags (−z wall and +x wall)
    const poster=(lines: [string, number, number, string?][], bg: string, fg: string)=>ctex(512,720,(g,w,h)=>{ g.fillStyle=bg; g.fillRect(0,0,w,h); g.fillStyle='rgba(0,0,0,.12)'; for(let i=0;i<2000;i++) g.fillRect(Math.random()*w,Math.random()*h,1.5,1.5);
      g.fillStyle=fg; g.textAlign='center'; lines.forEach(([t,size,y,font])=>{ g.font=`${size}px ${font||'"Bowlby One",Impact'}`; g.fillText(t,w/2,y); }); });
    const p1=poster([['GRAN PREMIO',58,120],['REGIO',120,250],['13',240,520],['domingo · 10 am',34,660,'"Special Elite",monospace']],'#e2252e','#ece6d6');
    const p2=poster([['SE VENDEN',64,130],['PIEZAS',96,240],['puertas · cofre',36,360,'"Special Elite",monospace'],['techo · defensas',36,410,'"Special Elite",monospace'],['$120,000',80,590]],'#ece6d6','#141214');
    const p3=poster([['FULL',120,200],['GAS',150,360],['MTY',90,560]],'#f1c232','#141214');
    for(const [tex,x,y,z,rz] of [[p1,4.2,2.5,-10.1,.04],[p2,-7.4,2.3,-7.9,-.05],[p3,10.4,2.4,-3.2,.03]] as [THREE.Texture, number, number, number, number][]){
      const m=new THREE.Mesh(new THREE.PlaneGeometry(1.25,1.75),new THREE.MeshStandardMaterial({map:tex,roughness:.9})); onWall(m,x,y,z); m.rotateZ(rz); }
    const flag=ctex(256,256,g=>{ for(let x=0;x<8;x++) for(let y=0;y<8;y++){ g.fillStyle=(x+y)%2?'#ece6d6':'#141214'; g.fillRect(x*32,y*32,32,32); } });
    const banner=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.2),new THREE.MeshStandardMaterial({map:flag,side:THREE.DoubleSide,roughness:.9})); onWall(banner,10.6,3.4,1.6,10.0);
    const rod=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,2.7,8),steel); rod.rotation.z=Math.PI/2; onWall(rod,10.6,4.02,1.6,10.0); rod.rotateZ(Math.PI/2);
    // tires hung on the +x wall
    for(const [z,y] of [[3.8,2.1],[4.7,2.1],[4.25,2.95]]){ const t=new THREE.Mesh(new THREE.TorusGeometry(.34,.14,10,26),std(0x121114,{roughness:.9})); onWall(t,10.5,y,z); }
    // fire extinguisher by the door
    const ext=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.55,16),std(0xd11a22,{metalness:.3,roughness:.4})); ext.position.set(-1.8,.8,10.55); gs.add(ext);
    // oil stains on the floor
    const stain=ctex(256,256,g=>{ const rg=g.createRadialGradient(128,128,10,128,128,120); rg.addColorStop(0,'rgba(0,0,0,.55)'); rg.addColorStop(.7,'rgba(0,0,0,.25)'); rg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=rg; g.beginPath(); g.ellipse(128,128,120,90,.4,0,7); g.fill(); });
    for(const [x,z,s] of [[1.2,.3,1.4],[-1.6,-.6,1],[-6.5,4.2,1.8],[6.2,-2.4,1.2]]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(s,s),new THREE.MeshBasicMaterial({map:stain,transparent:true,depthWrite:false})); m.rotation.x=-Math.PI/2; m.position.set(x,.006,z); gs.add(m); }
    // cool fluorescent spill on the shelving side, warm one on the posters
    const cool=new THREE.PointLight(0x9ec8ff, 7, 7, 1.6); cool.position.set(-5.2,3.2,-7); gs.add(cool);
    const warm2=new THREE.PointLight(0xffb070, 7, 7, 1.6); warm2.position.set(7.5,3,-2); gs.add(warm2);
    const doorL=new THREE.PointLight(0xffe0b0, 9, 8, 1.5); doorL.position.set(1.4,3.6,8.6); gs.add(doorL);
    const flagL=new THREE.PointLight(0xfff0d0, 10, 8, 1.5); flagL.position.set(8.4,3.2,1.8); gs.add(flagL);
    const shelfL=new THREE.PointLight(0xffe6c0, 6, 7, 1.5); shelfL.position.set(-8.2,3,-3.5); gs.add(shelfL);
  }
  }

  let fly: { from: THREE.Vector3; to: THREE.Vector3; t0: number; tf: THREE.Vector3; tt: THREE.Vector3; dur: number } | null = null;
  let pendingFly: string | null = null;
  function flyTo(id: string) {
    const meshes = gar.parts[id]; if (!meshes || !meshes.length) { pendingFly = id; return; }
    const box = new THREE.Box3(); meshes.forEach(m => box.expandByObject(m)); const c = box.getCenter(new THREE.Vector3());
    const zone = PART_BY_ID[id].zone, v = VIEWS[zone] || VIEWS['Frente'], tgt = new THREE.Vector3(c.x * .45, .62, c.z * .25);
    const off = new THREE.Vector3(...v); off.x += c.x * .35;
    const a = gar.camera.aspect, side = zone.startsWith('Lado'), k = a < 1 ? (side ? 1.7 : 1.25) : (a > 1.9 ? 1 : 1.08);
    const to = tgt.clone().add(off.multiplyScalar(k));
    fly = { from: gar.camera.position.clone(), to, t0: performance.now(), tf: gar.controls.target.clone(), tt: tgt, dur: REDUCED ? 1 : 1000 };
  }

  let tick = 0;
  gar.onFrame = now => {
    tick += .05; pulseSelected(tick);
    if (fly) {
      const k = Math.min(1, (now - fly.t0) / fly.dur), e = 1 - Math.pow(1 - k, 3);
      gar.camera.position.lerpVectors(fly.from, fly.to, e); gar.controls.target.lerpVectors(fly.tf, fly.tt, e); if (k >= 1) fly = null;
    }
  };
  gar.onPart(onPart);

  canvasFonts().then(() => { if (!disposed) { buildEnvironment(); gar.renderer.shadowMap.needsUpdate = true; } });
  loadPalio().then(template => {
    if (disposed) return;
    gar.addModel(template);
    const refl = template.clone(true); refl.scale.y = -1;
    refl.traverse(o => { if (o instanceof THREE.Mesh) { o.castShadow = false; o.userData = {}; } }); gar.car.add(refl);
    paintAll(); onLoaded();
    if (pendingFly) { const id = pendingFly; pendingFly = null; flyTo(id); }
  }, () => { if (!disposed) onError(); });
  document.fonts?.ready.then(() => { if (!disposed) paintAll(); });

  const sync = () => gar.setRunning(document.visibilityState === 'visible');
  document.addEventListener('visibilitychange', sync); sync();

  return {
    select(id) { setSelected(id); flyTo(id); },
    setSold,
    resize: () => gar.resize(),
    dispose() { disposed = true; document.removeEventListener('visibilitychange', sync); gar.dispose(); },
  };
}
