'use client';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { common } from '../content/i18n';
export default function ProjectCard({ href, image, number, title, meta, large=false }: { href:string; image:string; number:string; title:string; meta:string; large?:boolean }) {
 const { lang } = useLanguage();
 return <Link href={href} className={`projectCard ${large?'large':''}`} style={{backgroundImage:`url(${image})`}}><div className="projectCardShade"/><div className="projectCardInfo"><span>{number}</span><h3>{title}</h3><p>{meta}</p><b>{common[lang].viewProject}</b></div></Link>
}
