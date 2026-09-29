import 'server-only';
import type { Locale } from '@/lib/i18n';
import en, { type Dictionary } from './en';
import hy from './hy';
import ru from './ru';

const dictionaries: Record<Locale, Dictionary> = { hy, en, ru };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
export type { Dictionary };
