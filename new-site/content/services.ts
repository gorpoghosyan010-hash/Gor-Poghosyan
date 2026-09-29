// Ծառայությունների հերթականությունը և նկարները։ Տեքստերը՝ content/dictionaries/*.ts (services.items)։
export const serviceKeys = ['architecture', 'engineering', 'construction', 'renovation', 'pools'] as const;
export type ServiceKey = (typeof serviceKeys)[number];

export const serviceImages: Record<ServiceKey, string> = {
  architecture: '/media/services/residential.webp',
  engineering: '/media/services/public-works.webp',
  construction: '/media/projects/house-01/09.webp',
  renovation: '/media/frames/renovation-after.webp',
  pools: '/media/projects/pool-01/06.webp'
};

/** Real GARON site photos, in build order, for the Construction scene. */
export const constructionStages = [
  '/media/projects/house-01/02.webp',
  '/media/projects/house-01/05.webp',
  '/media/projects/house-01/09.webp',
  '/media/projects/house-01/11.webp',
  '/media/projects/house-01/12.webp'
];

/** Pool stages: rebar cage → concrete shell → mosaic → water. */
export const poolStages = [
  '/media/projects/pool-02/01.webp',
  '/media/projects/pool-01/02.webp',
  '/media/projects/pool-01/05.webp',
  '/media/projects/pool-01/06.webp'
];
