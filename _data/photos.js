/* Everything Eleventy needs to know about the files in assets/, worked out by
   looking at them rather than by being told.

   Every photo on the site is served as a <picture> with a srcset of widths, and
   which widths exist depends on how big the master was: a 900px master gets
   400/640/900, a 1179px one gets a 1179 as well. Hand-writing those lists was
   how the markup ended up with 28 near-identical six-line blocks in it.

   So this scans the folder. Drop a new photo in, run tools-resize-images.py, and
   it appears here with the right widths and the right intrinsic size, without
   anyone editing a list. That matters more once Ava is adding her own: the thing
   she will forget is not the photo, it is the bookkeeping around it.

   Dimensions come from the JPEG header directly. Reading four bytes out of a
   file the build already has is not worth a dependency, and width and height on
   the img are what stop the page jumping around while photos load. */
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets');

/* Pull width and height out of a JPEG's start-of-frame marker. Every SOFn
   except C4 (Huffman table), C8 (reserved) and CC (arithmetic coding) carries
   the dimensions in the same place. */
function jpegSize(file) {
  const b = fs.readFileSync(file);
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

module.exports = function () {
  const photos = {};
  if (!fs.existsSync(ASSETS)) return photos;

  for (const file of fs.readdirSync(ASSETS)) {
    const sized = file.match(/^(.+)-(\d+)\.(jpg|webp)$/);
    if (sized) {
      const [, stem, width, ext] = sized;
      const p = (photos[stem] ||= { stem, widths: [], webp: [] });
      if (ext === 'jpg') p.widths.push(Number(width));
      else p.webp.push(Number(width));
      continue;
    }
    /* An unsuffixed master. Mostly these are the originals the variants were
       generated from, but it is also what a photo uploaded through the admin
       panel looks like before anyone has run the resize script over it. Record
       the filename so such a photo still renders, at full size, rather than
       breaking the page. */
    const plain = file.match(/^(.+)\.(jpg|jpeg|png|webp)$/i);
    if (!plain) continue;
    const p = (photos[plain[1]] ||= { stem: plain[1], widths: [], webp: [] });
    p.original ||= file;
  }

  for (const p of Object.values(photos)) {
    p.widths.sort((a, b) => a - b);
    p.webp.sort((a, b) => a - b);
    p.max = p.widths[p.widths.length - 1];

    /* The fallback src is the smallest variant at 640 or above, because that is
       what a 375px phone at 2x actually needs. Falling back to the largest would
       hand a 900px file to anything that ignores srcset. */
    p.fallback = p.widths.find((w) => w >= 640) ?? p.max;

    const measure = p.max
      ? `${p.stem}-${p.max}.jpg`
      : (p.original && /\.jpe?g$/i.test(p.original) ? p.original : null);
    const size = measure ? jpegSize(path.join(ASSETS, measure)) : null;
    if (size) { p.width = size.width; p.height = size.height; }
  }

  return photos;
};
