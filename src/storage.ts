import type { Data } from "@measured/puck";
import type { TemplateId, ThemeMeta } from "./compiler";

export type Project = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  meta: ThemeMeta;
  templates: Record<TemplateId, Data>;
};

const KEY = "peidrag.projects.v3";
const LEGACY_KEY_V1 = "peidrag.project.v1";
const LEGACY_KEY_V2 = "peidrag.projects.v2";

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function defaultMeta(name = "Untitled theme"): ThemeMeta {
  return {
    name,
    description: "A theme built with peidrag.",
    version: "0.1.0",
    author: "Anonymous",
    siteTitle: "My Blog",
    primaryColor: "#1d4ed8",
  };
}

function pid() {
  return "n_" + Math.random().toString(36).slice(2, 10);
}

// Empty starter — users build from primitives. We seed each template with one
// container so there's something to drop into, but no opinionated content.
export function seedTemplates(): Record<TemplateId, Data> {
  const blankContainer = () => ({
    type: "Container",
    props: {
      id: pid(),
      layout: "flex-column",
      gridColumns: 3,
      gap: 32,
      padding: 48,
      align: "stretch",
      justify: "flex-start",
      bg: "transparent",
      textColor: "",
      maxWidth: "1100px",
      radius: 0,
      border: "none",
      content: [],
    },
  });

  // Home: hero (pulled from a Ghost page tagged #hero) + posts grid
  const indexCardId = pid();
  return {
    index: {
      root: { props: {} },
      content: [
        {
          type: "Container",
          props: {
            id: pid(),
            // Pulls from a Ghost page tagged with internal #hero — change in
            // Ghost admin: add a page tagged "#hero" with a title, excerpt,
            // and feature image, and this section will render with that data.
            source: "page-by-tag",
            sourceFilter: "hero",
            sourceLimit: 1,
            layout: "flex-column",
            gridColumns: 3,
            gap: 24,
            padding: 80,
            align: "center",
            justify: "center",
            bg: "transparent",
            textColor: "",
            maxWidth: "880px",
            radius: 0,
            border: "none",
            content: [
              {
                type: "Heading",
                props: {
                  id: pid(),
                  text: "",
                  textSource: "post.title",
                  level: "h1",
                  size: 56,
                  weight: 800,
                  color: "#0b1220",
                  align: "center",
                  letterSpacing: "-0.03em",
                  lineHeight: "1.05",
                  maxWidth: "",
                },
              },
              {
                type: "Text",
                props: {
                  id: pid(),
                  text: "",
                  textSource: "post.excerpt",
                  size: 19,
                  weight: 400,
                  color: "#475569",
                  align: "center",
                  lineHeight: "1.6",
                  maxWidth: "640px",
                },
              },
              {
                type: "Image",
                props: {
                  id: pid(),
                  src: "",
                  srcSource: "post.feature_image",
                  size: "xl",
                  alt: "",
                  altSource: "post.title",
                  width: "100%",
                  height: "auto",
                  fit: "cover",
                  radius: 14,
                },
              },
            ],
          },
        },
        {
          type: "Container",
          props: {
            id: pid(),
            layout: "flex-column",
            gridColumns: 3,
            gap: 24,
            padding: 32,
            align: "stretch",
            justify: "flex-start",
            bg: "transparent",
            textColor: "",
            maxWidth: "1100px",
            radius: 0,
            border: "none",
            content: [
              {
                type: "Heading",
                props: {
                  id: pid(),
                  text: "Latest posts",
                  textSource: "static",
                  level: "h2",
                  size: 28,
                  weight: 700,
                  color: "#0b1220",
                  align: "left",
                  letterSpacing: "-0.01em",
                  lineHeight: "1.2",
                  maxWidth: "",
                },
              },
              {
                type: "PostsLoop",
                props: {
                  id: pid(),
                  filter: "",
                  limit: 9,
                  columns: 3,
                  gap: 24,
                  emptyMessage: "No posts yet.",
                  content: [
                    {
                      type: "Container",
                      props: {
                        id: indexCardId,
                        layout: "flex-column",
                        gridColumns: 3,
                        gap: 12,
                        padding: 20,
                        align: "stretch",
                        justify: "flex-start",
                        bg: "#ffffff",
                        textColor: "",
                        maxWidth: "",
                        radius: 14,
                        border: "1px solid #e6e3dc",
                        content: [
                          {
                            type: "Image",
                            props: {
                              id: pid(),
                              src: "",
                              srcSource: "post.feature_image",
                              size: "m",
                              alt: "",
                              altSource: "post.title",
                              width: "100%",
                              height: "auto",
                              fit: "cover",
                              radius: 10,
                            },
                          },
                          {
                            type: "Heading",
                            props: {
                              id: pid(),
                              text: "",
                              textSource: "post.title",
                              level: "h3",
                              size: 18,
                              weight: 600,
                              color: "#0b1220",
                              align: "left",
                              letterSpacing: "0",
                              lineHeight: "1.3",
                              maxWidth: "",
                            },
                          },
                          {
                            type: "Text",
                            props: {
                              id: pid(),
                              text: "",
                              textSource: "post.excerpt",
                              size: 14,
                              weight: 400,
                              color: "#475569",
                              align: "left",
                              lineHeight: "1.55",
                              maxWidth: "",
                            },
                          },
                          {
                            type: "Text",
                            props: {
                              id: pid(),
                              text: "",
                              textSource: "post.date",
                              size: 12,
                              weight: 500,
                              color: "#94a3b8",
                              align: "left",
                              lineHeight: "1.3",
                              maxWidth: "",
                            },
                          },
                          {
                            type: "Button",
                            props: {
                              id: pid(),
                              label: "Read more",
                              labelSource: "static",
                              href: "",
                              hrefSource: "post.url",
                              variant: "link",
                              size: "sm",
                              align: "flex-start",
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },

    post: {
      root: { props: {} },
      content: [
        {
          type: "Container",
          props: {
            id: pid(),
            layout: "flex-column",
            gridColumns: 3,
            gap: 16,
            padding: 48,
            align: "stretch",
            justify: "flex-start",
            bg: "transparent",
            textColor: "",
            maxWidth: "720px",
            radius: 0,
            border: "none",
            content: [
              {
                type: "Heading",
                props: {
                  id: pid(),
                  text: "",
                  textSource: "post.title",
                  level: "h1",
                  size: 44,
                  weight: 800,
                  color: "#0b1220",
                  align: "left",
                  letterSpacing: "-0.025em",
                  lineHeight: "1.1",
                  maxWidth: "",
                },
              },
              {
                type: "Text",
                props: {
                  id: pid(),
                  text: "",
                  textSource: "post.primary_author.name",
                  size: 14,
                  weight: 500,
                  color: "#64748b",
                  align: "left",
                  lineHeight: "1.4",
                  maxWidth: "",
                },
              },
              {
                type: "Text",
                props: {
                  id: pid(),
                  text: "",
                  textSource: "post.date",
                  size: 13,
                  weight: 400,
                  color: "#94a3b8",
                  align: "left",
                  lineHeight: "1.4",
                  maxWidth: "",
                },
              },
              {
                type: "Image",
                props: {
                  id: pid(),
                  src: "",
                  srcSource: "post.feature_image",
                  size: "xl",
                  alt: "",
                  altSource: "post.title",
                  width: "100%",
                  height: "auto",
                  fit: "cover",
                  radius: 14,
                },
              },
              {
                type: "Text",
                props: {
                  id: pid(),
                  text: "",
                  textSource: "post.content",
                  size: 17,
                  weight: 400,
                  color: "#0b1220",
                  align: "left",
                  lineHeight: "1.75",
                  maxWidth: "",
                },
              },
            ],
          },
        },
      ],
    },

    page: {
      root: { props: {} },
      content: [
        {
          type: "Container",
          props: {
            id: pid(),
            layout: "flex-column",
            gridColumns: 3,
            gap: 16,
            padding: 48,
            align: "stretch",
            justify: "flex-start",
            bg: "transparent",
            textColor: "",
            maxWidth: "720px",
            radius: 0,
            border: "none",
            content: [
              {
                type: "Heading",
                props: {
                  id: pid(),
                  text: "",
                  textSource: "post.title",
                  level: "h1",
                  size: 44,
                  weight: 800,
                  color: "#0b1220",
                  align: "left",
                  letterSpacing: "-0.025em",
                  lineHeight: "1.1",
                  maxWidth: "",
                },
              },
              {
                type: "Text",
                props: {
                  id: pid(),
                  text: "",
                  textSource: "post.content",
                  size: 17,
                  weight: 400,
                  color: "#0b1220",
                  align: "left",
                  lineHeight: "1.75",
                  maxWidth: "",
                },
              },
            ],
          },
        },
      ],
    },

    tag: {
      root: { props: {} },
      content: [
        {
          type: "Container",
          props: {
            id: pid(),
            layout: "flex-column",
            gridColumns: 3,
            gap: 24,
            padding: 48,
            align: "center",
            justify: "center",
            bg: "transparent",
            textColor: "",
            maxWidth: "880px",
            radius: 0,
            border: "none",
            content: [
              {
                type: "Heading",
                props: {
                  id: pid(),
                  text: "",
                  textSource: "tag.name",
                  level: "h1",
                  size: 48,
                  weight: 800,
                  color: "#0b1220",
                  align: "center",
                  letterSpacing: "-0.025em",
                  lineHeight: "1.1",
                  maxWidth: "",
                },
              },
              {
                type: "Text",
                props: {
                  id: pid(),
                  text: "",
                  textSource: "tag.description",
                  size: 18,
                  weight: 400,
                  color: "#475569",
                  align: "center",
                  lineHeight: "1.6",
                  maxWidth: "",
                },
              },
            ],
          },
        },
        {
          type: "PostsLoop",
          props: {
            id: pid(),
            filter: "",
            limit: 12,
            columns: 3,
            gap: 24,
            emptyMessage: "No posts yet in this tag.",
            content: [
              {
                type: "Container",
                props: {
                  id: pid(),
                  layout: "flex-column",
                  gridColumns: 3,
                  gap: 12,
                  padding: 20,
                  align: "stretch",
                  justify: "flex-start",
                  bg: "#ffffff",
                  textColor: "",
                  maxWidth: "",
                  radius: 14,
                  border: "1px solid #e6e3dc",
                  content: [
                    {
                      type: "Heading",
                      props: {
                        id: pid(),
                        text: "",
                        textSource: "post.title",
                        level: "h3",
                        size: 18,
                        weight: 600,
                        color: "#0b1220",
                        align: "left",
                        letterSpacing: "0",
                        lineHeight: "1.3",
                        maxWidth: "",
                      },
                    },
                    {
                      type: "Text",
                      props: {
                        id: pid(),
                        text: "",
                        textSource: "post.excerpt",
                        size: 14,
                        weight: 400,
                        color: "#475569",
                        align: "left",
                        lineHeight: "1.55",
                        maxWidth: "",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },

    author: {
      root: { props: {} },
      content: [
        {
          type: "Container",
          props: {
            id: pid(),
            layout: "flex-column",
            gridColumns: 3,
            gap: 16,
            padding: 48,
            align: "center",
            justify: "center",
            bg: "transparent",
            textColor: "",
            maxWidth: "720px",
            radius: 0,
            border: "none",
            content: [
              {
                type: "Image",
                props: {
                  id: pid(),
                  src: "",
                  srcSource: "author.profile_image",
                  size: "m",
                  alt: "",
                  altSource: "author.name",
                  width: "120px",
                  height: "120px",
                  fit: "cover",
                  radius: 999,
                },
              },
              {
                type: "Heading",
                props: {
                  id: pid(),
                  text: "",
                  textSource: "author.name",
                  level: "h1",
                  size: 40,
                  weight: 800,
                  color: "#0b1220",
                  align: "center",
                  letterSpacing: "-0.02em",
                  lineHeight: "1.1",
                  maxWidth: "",
                },
              },
              {
                type: "Text",
                props: {
                  id: pid(),
                  text: "",
                  textSource: "author.bio",
                  size: 17,
                  weight: 400,
                  color: "#475569",
                  align: "center",
                  lineHeight: "1.6",
                  maxWidth: "",
                },
              },
            ],
          },
        },
        blankContainer(),
      ],
    },
  };
}

function migrateLegacy(): Project[] {
  for (const key of [LEGACY_KEY_V2, LEGACY_KEY_V1]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      // Drop legacy data — schema is incompatible (template-shaped components
      // replaced by primitives). User keeps project names by getting fresh seeds.
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
  return [];
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Project[];
  } catch {
    // ignore
  }
  return migrateLegacy();
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(projects));
  } catch {
    // ignore quota errors
  }
}

export function createProject(name: string): Project {
  const now = Date.now();
  return {
    id: uid(),
    name,
    createdAt: now,
    updatedAt: now,
    meta: { ...defaultMeta(name) },
    templates: seedTemplates(),
  };
}
