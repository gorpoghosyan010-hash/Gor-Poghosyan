// Կապի տվյալներ։ Դատարկ արժեքը ('') թաքցնում է համապատասխան կոճակը ամբողջ կայքում։
// Լրացրեք այստեղ, երբ պատրաստ լինեն։
export const site = {
  name: 'GARON Construction',
  email: 'info@garon.am',
  phone: '', // օր.՝ '+374 91 123 456'
  instagram: '', // օր.՝ 'https://www.instagram.com/garon.construction'
  facebook: '', // օր.՝ 'https://www.facebook.com/garon.construction'
  // Քարտեզի հասցեն։ Երբ գրասենյակի ճշգրիտ հասցեն լինի, փոխեք այս տողը։
  mapQuery: 'Yerevan, Armenia',
  coordinates: { lat: 40.1792, lng: 44.4991, label: '40°10′N  44°29′E' },
  founded: 2000
};

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
