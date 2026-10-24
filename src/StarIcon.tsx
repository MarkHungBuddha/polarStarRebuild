/** The five-pointed star drawn in the masthead and as the scenario card's sticker; purely decorative. */
export function StarIcon({ className }: { className?: string }) {
  return <svg className={className} aria-hidden="true" viewBox="0 0 24 24"><path d="m12 2 2.8 6.4 7 .7-5.3 4.6 1.6 6.8-6.1-3.6-6.1 3.6 1.6-6.8L2.2 9.1l7-.7Z" /></svg>;
}
