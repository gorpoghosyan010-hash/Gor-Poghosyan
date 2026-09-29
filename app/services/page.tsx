'use client';
import Link from 'next/link'; import Reveal from '../../components/Reveal';
import { useLanguage } from '../../components/LanguageContext';
import { servicesIndex, home } from '../../content/i18n';
const hrefs=['/services/pools','/services/residential','/services/renovation','/services/public-works'];
export default function Services(){
 const { lang } = useLanguage();
 const t = servicesIndex[lang];
 const items = home[lang].services.map((s,i)=>[String(i+1).padStart(2,'0'), s.t, hrefs[i]] as const);
 return <main className="innerPage"><section className="innerHero servicesHero" style={{backgroundImage:"url('/projects/house-01/06.webp')"}}><div className="innerHeroShade"/><div><p className="eyebrow">{t.eyebrow}</p><h1>{t.title1}<br/><span>{t.title2}</span></h1><p>{t.lead}</p></div></section><section className="sectionLight serviceDirectory"><Reveal><p className="eyebrow dark">{t.whatWeDo}</p><div className="directoryList">{items.map(([n,title,h])=><Link href={h} key={n}><span>{n}</span><h2>{title}</h2><b>{t.open}</b></Link>)}</div></Reveal></section></main>;
}
