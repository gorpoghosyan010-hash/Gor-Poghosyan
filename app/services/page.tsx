'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../components/LanguageContext';
import { servicesIndex, home } from '../../content/i18n';
const hrefs=['/services/pools','/services/residential','/services/renovation','/services/public-works'];
const imgs=['/services/svc-pools.webp','/services/svc-residential.webp','/services/svc-renovation.webp','/services/svc-public-works.webp'];

// Մեկ էկրան. մեծ ցանկ չորս ուղղություններով։ Որ ուղղության վրա կանգնում ես (կամ ինքնաշխատ, հերթով), ֆոնը դառնում է այդ ուղղության նկարը։
export default function Services(){
 const { lang } = useLanguage();
 const t = servicesIndex[lang];
 const list = home[lang].services;
 const [active,setActive] = useState(0);
 const [hold,setHold] = useState(false);
 useEffect(()=>{ if(hold) return; const id=window.setInterval(()=>setActive(a=>(a+1)%imgs.length),4200); return ()=>window.clearInterval(id); },[hold]);
 return <main className="innerPage"><section className="svcStage" onMouseLeave={()=>setHold(false)}>
  <div className="svcBgs" aria-hidden="true">{imgs.map((src,i)=><div key={src} className={`svcBg ${i===active?'on':''}`} style={{backgroundImage:`url(${src})`}}/>)}</div>
  <div className="svcVeil" aria-hidden="true"/>
  <div className="svcInner">
   <div className="svcHead"><p className="eyebrow">{t.eyebrow}</p><h1>{t.title1} <span>{t.title2}</span></h1><p>{t.lead}</p></div>
   <nav className="svcList">{list.map((s,i)=><Link key={hrefs[i]} href={hrefs[i]} className={`svcItem ${i===active?'on':''}`} onMouseEnter={()=>{setActive(i);setHold(true);}} onFocus={()=>{setActive(i);setHold(true);}}>
     <span className="svcNum">{String(i+1).padStart(2,'0')}</span>
     <span className="svcName">{s.t}</span>
     <span className="svcDesc">{s.d}</span>
     <span className="svcGo" aria-hidden="true"/>
   </Link>)}</nav>
   <div className="svcProgress" aria-hidden="true">{imgs.map((_,i)=><i key={i} className={i===active?'on':''}/>)}</div>
  </div>
 </section></main>;
}
