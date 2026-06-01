/** URL 경로 인코딩 (공백 파일명) — 클라이언트·서버 공용 */
export function encodeTarotAssetPath(path: string) {
  const slash = path.lastIndexOf('/');
  if (slash === -1) return encodeURIComponent(path);
  const dir = path.slice(0, slash + 1);
  const file = path.slice(slash + 1);
  return `${dir}${encodeURIComponent(file)}`;
}

/** jpg → png, cards 폴더 폴백 */
export function getTarotImageCandidates(image: string, englishName: string) {
  const primary = image.includes('%') ? image : encodeTarotAssetPath(image);
  const pngInTarot = encodeTarotAssetPath(image.replace(/\.jpg$/i, '.png'));
  const pngInCards = encodeTarotAssetPath(`/tarot/cards/${englishName}.png`);
  return [primary, pngInTarot, pngInCards];
}
