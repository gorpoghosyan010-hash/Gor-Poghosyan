// Կապի տվյալներ։ Դատարկ արժեքը ('') թաքցնում է համապատասխան կոճակը/բաժինը ամբողջ կայքում՝
// երբ հեռախոսը, WhatsApp-ը կամ հասցեն պատրաստ լինեն, պարզապես լրացրեք այստեղ։
// Contact details. An empty value ('') hides the matching button/section everywhere on the site.
export const siteConfig = {
  email: 'info@garon.am',
  phone: '',      // օր.՝ '+374 91 123 456' → «Զանգել» կոճակներ (header, footer, կապ, մոբայլ գոտի)
  whatsapp: '',   // WhatsApp համար միջազգային ձևաչափով, օր.՝ '+374 91 123 456' → wa.me հղում
  viber: '',      // Viber համար, օր.՝ '+374 91 123 456'
  telegram: '',   // Telegram username առանց @, օր.՝ 'garon_construction'
  address: '',    // Գրասենյակի հասցե. դատարկ → «Երևան և մարզեր», առանց քարտեզի
  instagram: 'https://www.instagram.com/garon__construction/',
  facebook: ''    // օր.՝ 'https://www.facebook.com/garon...'
};

export const hasSocials = Boolean(siteConfig.instagram || siteConfig.facebook);

const digits = (v: string) => v.replace(/[^\d+]/g, '');

export const contactLinks = {
  tel: siteConfig.phone ? `tel:${digits(siteConfig.phone)}` : '',
  whatsapp: siteConfig.whatsapp ? `https://wa.me/${digits(siteConfig.whatsapp).replace(/^\+/, '')}` : '',
  viber: siteConfig.viber ? `viber://chat?number=${encodeURIComponent(digits(siteConfig.viber))}` : '',
  telegram: siteConfig.telegram ? `https://t.me/${siteConfig.telegram.replace(/^@/, '')}` : '',
  map: siteConfig.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address)}` : ''
};

export const hasMessengers = Boolean(contactLinks.whatsapp || contactLinks.viber || contactLinks.telegram);
