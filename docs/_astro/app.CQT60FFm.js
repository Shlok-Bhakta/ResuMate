import{e as X,h as w,a as U,b as Q,g as P,d as W,H as Z,r as L,s as O,c as D,f as y,i as j,j as Y,k as z,p as ee,m as ae,l as B,I as H,n as F,o as V,E as re,q as le,t as ne,u as te,v as se,w as ie,x as fe,y as ve,z as oe,A as ue,B as N,C as de,D as A,F as ce,G as C,J as S,K as _e,L as k,M as he,N as be,O as xe}from"./render.n_7FZlsJ.js";const ge="5";typeof window<"u"&&(window.__svelte||={v:new Set}).v.add(ge);X();function pe(n,e){return e}function we(n,e,a,t){for(var o=[],s=e.length,i=0;i<s;i++)le(e[i].e,o,!0);var _=s>0&&o.length===0&&a!==null;if(_){var c=a.parentNode;ne(c),c.append(a),t.clear(),p(n,e[0].prev,e[s-1].next)}te(o,()=>{for(var h=0;h<s;h++){var r=e[h];_||(t.delete(r.k),p(n,r.prev,r.next)),se(r.e,!_)}})}function me(n,e,a,t,o,s=null){var i=n,_={flags:e,items:new Map,first:null};w&&U();var c=null,h=!1,r=W(()=>{var v=a();return ve(v)?v:v==null?[]:F(v)});Q(()=>{var v=P(r),l=v.length;if(h&&l===0)return;h=l===0;let d=!1;if(w){var u=i.data===Z;u!==(l===0)&&(i=L(),O(i),D(!1),d=!0)}if(w){for(var m=null,x,f=0;f<l;f++){if(y.nodeType===8&&y.data===j){i=y,d=!0,D(!1);break}var b=v[f],I=t(b,f);x=G(y,_,m,null,b,I,f,o,e,a),_.items.set(I,x),m=x}l>0&&O(L())}w||ye(v,_,i,o,e,t,a),s!==null&&(l===0?c?Y(c):c=z(()=>s(i)):c!==null&&ee(c,()=>{c=null})),d&&D(!0),P(r)}),w&&(i=y)}function ye(n,e,a,t,o,s,i){var _=n.length,c=e.items,h=e.first,r=h,v,l=null,d=[],u=[],m,x,f,b;for(b=0;b<_;b+=1){if(m=n[b],x=s(m,b),f=c.get(x),f===void 0){var I=r?r.e.nodes_start:a;l=G(I,e,l,l===null?e.first:l.next,m,x,b,t,o,i),c.set(x,l),d=[],u=[],r=l.next;continue}if((f.e.f&H)!==0&&Y(f.e),f!==r){if(v!==void 0&&v.has(f)){if(d.length<u.length){var T=u[0],g;l=T.prev;var M=d[0],R=d[d.length-1];for(g=0;g<d.length;g+=1)q(d[g],T,a);for(g=0;g<u.length;g+=1)v.delete(u[g]);p(e,M.prev,R.next),p(e,l,M),p(e,R,T),r=T,l=R,b-=1,d=[],u=[]}else v.delete(f),q(f,r,a),p(e,f.prev,f.next),p(e,f,l===null?e.first:l.next),p(e,l,f),l=f;continue}for(d=[],u=[];r!==null&&r.k!==x;)(r.e.f&H)===0&&(v??=new Set).add(r),u.push(r),r=r.next;if(r===null)continue;f=r}d.push(f),l=f,r=f.next}if(r!==null||v!==void 0){for(var $=v===void 0?[]:F(v);r!==null;)(r.e.f&H)===0&&$.push(r),r=r.next;var J=$.length;if(J>0){var K=null;we(e,$,K,c)}}V.first=e.first&&e.first.e,V.last=l&&l.e}function G(n,e,a,t,o,s,i,_,c,h){var r=(c&ie)!==0,v=(c&fe)===0,l=r?v?ae(o):B(o):o,d=(c&re)===0?i:B(i),u={i:d,v:l,k:s,a:null,e:null,prev:a,next:t};try{return u.e=z(()=>_(n,l,d,h),w),u.e.prev=a&&a.e,u.e.next=t&&t.e,a===null?e.first=u:(a.next=u,a.e.next=u.e),t!==null&&(t.prev=u,t.e.prev=u.e),u}finally{}}function q(n,e,a){for(var t=n.next?n.next.e.nodes_start:a,o=e?e.e.nodes_start:a,s=n.e.nodes_start;s!==t;){var i=oe(s);o.before(s),s=i}}function p(n,e,a){e===null?n.first=a:(e.next=a,e.e.next=a&&a.e),a!==null&&(a.prev=e,a.e.prev=e&&e.e)}function Ee(n,e,a,t,o){w&&U();var s=e.$$slots?.[a],i=!1;s===!0&&(s=e.children,i=!0),s===void 0||s(n,i?()=>t:t)}var Ae=N('<div class="overflow-x-clip bg-mantle px-4 py-2 mx-1 my-1 rounded-md hover:bg-overlay0 transition-all duration-200"> </div>');function E(n,e){ue(e,!0);var a=Ae(),t=C(a);S(a),de(o=>_e(t,`${o??""}...`),[()=>e.text.substring(0,13)]),A(n,a),ce()}var Ie=N('<div class="w-full h-full overflow-y-scroll scrollbar-thin scrollbar-corner-base scrollbar-thumb-overlay0 scrollbar-track-crust scrollbar-thumb-rounded-full scrollbar-track-rounded-full"><!></div>');function Te(n,e){var a=Ie(),t=C(a);Ee(t,e,"default",{}),S(a),A(n,a)}var ke=N('<div class="h-svh w-60 col-span-1 bg-crust"><!> <!> <!> <!> <!></div>');function Ne(n){var e=ke(),a=C(e);E(a,{text:"New Project"});var t=k(a,2);Te(t,{children:(_,c)=>{var h=he(),r=be(h);me(r,0,()=>Array(1e3),pe,(v,l,d)=>{E(v,{text:`Project a${d??""}`})}),A(_,h)},$$slots:{default:!0}});var o=k(t,2);E(o,{text:"Clear"});var s=k(o,2);E(s,{text:"Downlaod"});var i=k(s,2);E(i,{text:"Settings"}),S(e),A(n,e)}var Ce=N('<div class="flex flex-row"><!> <div class="bg-base w-full">content</div></div>');function Re(n){var e=Ce(),a=C(e);Ne(a),xe(2),S(e),A(n,e)}export{Re as default};
