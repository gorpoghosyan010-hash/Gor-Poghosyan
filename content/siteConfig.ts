// Կապի տվյալներ։ Դատարկ արժեքը («') թաքցնում է համապատասխան հատվածը ամբողջ կայքում՝
// երբ հեռախոսը կամ սոցցանցերը պատրաստ լինեն, պարզապես լրացրեք այստեղ։
export const siteConfig = {
  email: 'info@garon.am',
  phone: '',      // օր.՝ '+374 91 123 456'
  instagram: '',  // օր.՝ 'https://www.instagram.com/garon...'
  facebook: ''    // օր.՝ 'https://www.facebook.com/garon...'
};

export const hasSocials = Boolean(siteConfig.instagram || siteConfig.facebook);
