/* Eleventy build.

   This exists for one reason: Ava needs to be able to change her own hours,
   phone number and photos, and a CMS edits data files rather than HTML. Without
   something to turn data into pages there is nothing for a CMS to write to.

   The thing it actually buys is a single source of truth. Her phone number is
   currently written out in 55 places across 7 files and her email in 18. An
   admin panel on top of that would let her correct one of them and leave the
   other fifty-four wrong, which is worse than no panel at all.

   At this commit the build is deliberately a no-op: it takes the hand-written
   HTML and copies it out unchanged, so the pipeline can be proved before any
   page is restructured. Templating comes next, one page at a time.

   Local preview still works the old way for now. Once pages start using
   includes, .claude/serve.py has to point at _site rather than the project
   root, because the root files will no longer be the finished pages. */
module.exports = function (eleventyConfig) {
  /* Everything that is already a finished file goes across untouched. Eleventy
     only copies what it is told to, and none of this needs processing. */
  /* The admin panel is two static files and is not a page. Copy it, and tell
     Eleventy not to also treat the HTML as a template: the config it sits next
     to is full of {{fields.q}} placeholders that belong to the CMS, and there is
     no reason to let a template engine anywhere near either of them. */
  eleventyConfig.addPassthroughCopy('admin');
  eleventyConfig.ignores.add('admin/**');

  eleventyConfig.addPassthroughCopy('css');
  eleventyConfig.addPassthroughCopy('js');
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('robots.txt');
  eleventyConfig.addPassthroughCopy('sitemap.xml');
  eleventyConfig.addPassthroughCopy('site.webmanifest');
  eleventyConfig.addPassthroughCopy('favicon.ico');
  eleventyConfig.addPassthroughCopy('favicon.svg');
  eleventyConfig.addPassthroughCopy('apple-touch-icon.png');
  eleventyConfig.addPassthroughCopy('icon-192.png');
  eleventyConfig.addPassthroughCopy('icon-512.png');
  eleventyConfig.addPassthroughCopy('icon-maskable-512.png');

  /* Percent-encode a path for use inside the Image CDN's url= parameter.
     encodeURI rather than encodeURIComponent, because it leaves the slashes
     alone: Netlify's own examples pass a plain /assets/name.jpg, and a photo
     Ava names "my car.jpg" still needs its space escaped. */
  eleventyConfig.addFilter('imgSrc', (value) => encodeURI(String(value || '')));

  /* The admin panel's image field writes a path, like "assets/work-cargo-640.jpg"
     or "/assets/work-cargo.jpg", because that is what it knows about. The photo
     macro wants the stem. Rather than making Ava type "work-cargo" into a text
     box and hoping, this takes whatever she picked and reduces it: drop the
     folder, drop any -640 the file already carries, drop the extension. */
  eleventyConfig.addFilter('photoStem', (value) =>
    String(value || '')
      .replace(/^\/?assets\//, '')
      .replace(/\.(jpe?g|png|webp)$/i, '')
      .replace(/-\d+$/, '')
  );

  /* Eleventy's default would turn about.html into about/index.html, which
     serves at /about/ with a trailing slash. Every canonical on this site says
     /about without one, and the sitemap agrees with the canonicals. Keeping the
     flat filename keeps all three pointing at the same URL — the alternative is
     a redirect hop on every page and a canonical that disagrees with the address
     bar. */
  eleventyConfig.addGlobalData('permalink', () => (data) =>
    `${data.page.filePathStem}.html`
  );

  return {
    dir: { input: '.', output: '_site', includes: '_includes', data: '_data' },
    /* Nunjucks, now that pages pull in includes. Its delimiters are {{ }} and
       {% %}; the JSON-LD blocks use single braces on their own lines and never
       double them, so they pass through untouched. The byte-diff against the
       pre-conversion files is what actually proves that, and it is checked on
       every page as it is converted. */
    templateFormats: ['html'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: false,
  };
};
