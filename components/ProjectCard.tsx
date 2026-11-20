'use client';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { common } from '../content/i18n';
import { imageSizes } from '../content/imageSizes';
export default function ProjectCard({ href, image, number, title, meta, large=false }: { href:string; image:string; number:string; title:string; meta:string; large?:boolean }) {
 const { lang } = useLanguage();
 const sz = imageSizes[image]; const portrait = !!sz && sz[1] > sz[0];
 return <Link href={href} className={`projectCard ${large?'large':''} ${portrait?'portrait':''}`} style={{backgroundImage:`url(${image})`}}>{portrait && <img className="projectCardFit" src={image} alt="" aria-hidden="true" loading="lazy" />}<div className="projectCardShade"/><div className="projectCardInfo"><span>{number}</span><h3>{title}</h3><p>{meta}</p><b>{common[lang].viewProject}</b></div></Link>
}
