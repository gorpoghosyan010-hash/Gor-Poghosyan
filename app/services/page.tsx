'use client';
import Link from 'next/link'; import Reveal from '../../components/Reveal';
import { useLanguage } from '../../components/LanguageContext';
import { servicesIndex, home } from '../../content/i18n';
const hrefs=['/services/pools','/services/residential','/services/renovation','/services/public-works'];
const imgs=['/services/pools.webp','/services/residential.webp','/services/renovation.webp','/services/public-works.webp'];
export default function Services(){
 const { lang } = useLanguage();
 const t = servicesIndex[lang];
 const items = home[lang].services.map((s,i)=>[String(i+1).padStart(2,'0'), s.t, hrefs[i]] as const);
 return <main className="innerPage"><section className="servicesHero2">
  <div className="svcPanels">{items.map(([n,name,href],i)=><Link key={href} href={href} className="svcPanel" style={{backgroundImage:`url(${imgs[i]})`}}><span className="svcPanelShade"/><span className="svcPanelText"><b>{n}</b><strong>{name}</strong></span></Link>)}</div>
  <div className="svcHeroText"><p className="eyebrow">{t.eyebrow}</p><h1>{t.title1}<br/><span>{t.title2}</span></h1><p>{t.lead}</p></div>
 </section><section className="sectionLight serviceDirectory"><Reveal><p className="eyebrow dark">{t.whatWeDo}</p><div className="directoryList">{items.map(([n,title,h])=><Link href={h} key={n}><span>{n}</span><h2>{title}</h2><b>{t.open}</b></Link>)}</div></Reveal></section></main>;
}
