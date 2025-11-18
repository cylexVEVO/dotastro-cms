# Why
I was previously using Payload to power my website's content, but found the setup of an entire CMS to be a bit too complicated. I moved back to using plain old files, but missed the clean, block-based editing experience with my old Payload config. This project aims to provide that experience for any Astro site. It's like TinaCMS, but for .astro files!

# Status
This project is currently in a very early state. Most features are not implemented and this should not be used in production.

# Compatibility
This project currently makes a lot of assumptions about your site, most notably:
- Your site is designed to be "block-based", with almost all of a page being composed of components
- You only use `.astro` for content (no markdown, tsx, or other file types for components or pages)
- Your components destructure their props (`const { one, two } = Astro.props`), and don't assign it to a variable (`const props = Astro.props`)
- Your components are always in `src/components`
- And probably other assumptions about your site's structure

These will probably be addressed as I continue development, but I expect this will only be used by me, so I'm not promising anything.
