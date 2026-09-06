import type { Listing } from '@/types/listing';

export function slugifyListingTitle(title: string): string {
  const source = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюяўқғҳ';
  const target = ['a','b','v','g','d','e','e','zh','z','i','y','k','l','m','n','o','p','r','s','t','u','f','h','ts','ch','sh','shch','','y','','e','yu','ya','o','q','g','h'];

  const transliterated = title
    .toLowerCase()
    .replace(/[‘’ʻʼ']/g, '')
    .split('')
    .map((char) => {
      const index = source.indexOf(char);
      return index >= 0 ? target[index] : char;
    })
    .join('');

  return transliterated
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/-+$/g, '') || 'listing';
}

export function getListingPublicPath(listing: Pick<Listing, 'title' | 'publicId'>): string {
  return `/listing/${slugifyListingTitle(listing.title)}-${listing.publicId}`;
}
