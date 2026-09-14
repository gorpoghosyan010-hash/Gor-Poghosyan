import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Splash from '../components/Splash';
import { LanguageProvider } from '../components/LanguageContext';

export const metadata = { title: 'GARON Construction', description: 'Ժամանակակից շինարարական լուծումներ՝ նախագծումից մինչև ամբողջական իրականացում։' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
 return <html lang="hy"><body><LanguageProvider><Splash/><Header/>{children}<Footer/></LanguageProvider></body></html>;
}
