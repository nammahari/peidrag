export const seed = {
  meta: {
    name: "My peidrag theme",
    description: "A theme built with peidrag.",
    version: "0.1.0",
    author: "Anonymous",
    siteTitle: "My Blog",
    primaryColor: "#6366f1",
  },
  templates: {
    index: {
      root: { props: {} },
      content: [
        { type: "Hero", props: { id: "hero-1", heading: "Welcome to my blog", subheading: "Thoughts, stories and ideas.", ctaText: "Start reading", ctaLink: "#", bg: "#0f172a" } },
        { type: "PostList", props: { id: "list-1", title: "Latest posts", limit: 6, columns: 3, showExcerpt: true } },
        { type: "CTA", props: { id: "cta-1", heading: "Subscribe to the newsletter", buttonText: "Subscribe", buttonLink: "#/portal/signup" } },
        { type: "Footer", props: { id: "footer-1", copyright: "© 2026 My Blog" } },
      ],
    },
    post: {
      root: { props: {} },
      content: [
        { type: "PostContent", props: { id: "content-1" } },
        { type: "AuthorBio", props: { id: "author-1" } },
        { type: "Footer", props: { id: "footer-2", copyright: "© 2026 My Blog" } },
      ],
    },
    page: {
      root: { props: {} },
      content: [
        { type: "RichText", props: { id: "rt-1", html: "<h1>About</h1><p>Edit this rich text block in peidrag.</p>" } },
        { type: "Footer", props: { id: "footer-3", copyright: "© 2026 My Blog" } },
      ],
    },
    tag: {
      root: { props: {} },
      content: [
        { type: "PostList", props: { id: "list-2", title: "Posts in this tag", limit: 12, columns: 3, showExcerpt: true } },
        { type: "Footer", props: { id: "footer-4", copyright: "© 2026 My Blog" } },
      ],
    },
    author: {
      root: { props: {} },
      content: [
        { type: "AuthorBio", props: { id: "author-2" } },
        { type: "PostList", props: { id: "list-3", title: "Posts by this author", limit: 12, columns: 3, showExcerpt: true } },
        { type: "Footer", props: { id: "footer-5", copyright: "© 2026 My Blog" } },
      ],
    },
  },
};
