import slugify from 'slugify';

export function generateSlug(title: string): string {
  const baseSlug = slugify(title);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}
