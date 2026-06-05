// peidrag — visual editor component registry.
//
// Two layers per component:
//   1. Puck config (fields + render) — drives the visual canvas
//   2. compile()                     — drives the exported Ghost theme .hbs files
//
// Components are PRIMITIVES (Container, Text, Heading, Image, Button, PostsLoop,
// Spacer, Divider, RichText), not page templates. Pages are built by composing
// primitives. Any bindable property (text content, image src, link href) can
// either be static (typed in the panel) or bound to a Ghost data field.

import type { CSSProperties, ReactNode } from "react";
import type { Config, Slot } from "@measured/puck";

// ---------------------------------------------------------------------------
// Data binding
// ---------------------------------------------------------------------------

export type TextSource =
  | "static"
  | "post.title"
  | "post.excerpt"
  | "post.custom_excerpt"
  | "post.content"
  | "post.date"
  | "post.reading_time"
  | "post.url"
  | "post.primary_author.name"
  | "post.primary_author.bio"
  | "post.primary_tag.name"
  | "tag.name"
  | "tag.description"
  | "author.name"
  | "author.bio"
  | "author.website"
  | "site.title"
  | "site.description"
  | "site.url"
  | "member.name"
  | "member.email";

export type ImageSource =
  | "static"
  | "post.feature_image"
  | "post.primary_author.profile_image"
  | "tag.feature_image"
  | "author.profile_image"
  | "author.cover_image"
  | "site.logo"
  | "site.cover_image"
  | "site.icon";

export type HrefSource =
  | "static"
  | "post.url"
  | "tag.url"
  | "author.url"
  | "site.url"
  | "subscribe"
  | "signin";

export const TEXT_SOURCE_OPTIONS: { label: string; value: TextSource }[] = [
  { label: "Static text", value: "static" },
  { label: "Post · Title", value: "post.title" },
  { label: "Post · Excerpt", value: "post.excerpt" },
  { label: "Post · Custom excerpt", value: "post.custom_excerpt" },
  { label: "Post · Content (HTML)", value: "post.content" },
  { label: "Post · Date", value: "post.date" },
  { label: "Post · Reading time", value: "post.reading_time" },
  { label: "Post · URL", value: "post.url" },
  { label: "Post · Author name", value: "post.primary_author.name" },
  { label: "Post · Author bio", value: "post.primary_author.bio" },
  { label: "Post · Primary tag", value: "post.primary_tag.name" },
  { label: "Tag · Name", value: "tag.name" },
  { label: "Tag · Description", value: "tag.description" },
  { label: "Author · Name", value: "author.name" },
  { label: "Author · Bio", value: "author.bio" },
  { label: "Author · Website", value: "author.website" },
  { label: "Site · Title", value: "site.title" },
  { label: "Site · Description", value: "site.description" },
  { label: "Site · URL", value: "site.url" },
  { label: "Member · Name", value: "member.name" },
  { label: "Member · Email", value: "member.email" },
];

export const IMAGE_SOURCE_OPTIONS: { label: string; value: ImageSource }[] = [
  { label: "Static URL", value: "static" },
  { label: "Post · Feature image", value: "post.feature_image" },
  { label: "Post · Author profile image", value: "post.primary_author.profile_image" },
  { label: "Tag · Feature image", value: "tag.feature_image" },
  { label: "Author · Profile image", value: "author.profile_image" },
  { label: "Author · Cover image", value: "author.cover_image" },
  { label: "Site · Logo", value: "site.logo" },
  { label: "Site · Cover image", value: "site.cover_image" },
  { label: "Site · Icon", value: "site.icon" },
];

export const HREF_SOURCE_OPTIONS: { label: string; value: HrefSource }[] = [
  { label: "Static URL", value: "static" },
  { label: "Post · URL", value: "post.url" },
  { label: "Tag · URL", value: "tag.url" },
  { label: "Author · URL", value: "author.url" },
  { label: "Site · URL", value: "site.url" },
  { label: "Member · Subscribe", value: "subscribe" },
  { label: "Member · Sign in", value: "signin" },
];

const TEXT_EXPR: Record<Exclude<TextSource, "static">, string> = {
  "post.title": "{{title}}",
  "post.excerpt": '{{excerpt words="30"}}',
  "post.custom_excerpt": "{{custom_excerpt}}",
  "post.content": "{{content}}",
  "post.date": '{{date format="MMMM D, YYYY"}}',
  "post.reading_time": "{{reading_time}}",
  "post.url": "{{url}}",
  "post.primary_author.name": "{{primary_author.name}}",
  "post.primary_author.bio": "{{primary_author.bio}}",
  "post.primary_tag.name": "{{primary_tag.name}}",
  "tag.name": "{{name}}",
  "tag.description": "{{description}}",
  "author.name": "{{name}}",
  "author.bio": "{{bio}}",
  "author.website": "{{website}}",
  "site.title": "{{@site.title}}",
  "site.description": "{{@site.description}}",
  "site.url": "{{@site.url}}",
  "member.name": "{{@member.name}}",
  "member.email": "{{@member.email}}",
};

const HREF_EXPR: Record<Exclude<HrefSource, "static">, string> = {
  "post.url": "{{url}}",
  "tag.url": "{{url}}",
  "author.url": "{{url}}",
  "site.url": "{{@site.url}}",
  subscribe: "#/portal/signup",
  signin: "#/portal/signin",
};

function imageExpr(source: Exclude<ImageSource, "static">, size: string): string {
  const sz = size || "l";
  switch (source) {
    case "post.feature_image":
      return `{{img_url feature_image size="${sz}"}}`;
    case "post.primary_author.profile_image":
      return `{{img_url primary_author.profile_image size="${sz}"}}`;
    case "tag.feature_image":
      return `{{img_url feature_image size="${sz}"}}`;
    case "author.profile_image":
      return `{{img_url profile_image size="${sz}"}}`;
    case "author.cover_image":
      return `{{img_url cover_image size="${sz}"}}`;
    case "site.logo":
      return `{{img_url @site.logo size="${sz}"}}`;
    case "site.cover_image":
      return `{{img_url @site.cover_image size="${sz}"}}`;
    case "site.icon":
      return `{{@site.icon}}`;
  }
}

export function bindText(source: TextSource | undefined, staticValue: string): string {
  if (!source || source === "static") return escapeHtml(staticValue ?? "");
  return TEXT_EXPR[source];
}

export function bindHref(source: HrefSource | undefined, staticValue: string): string {
  if (!source || source === "static") return escapeAttr(staticValue || "#");
  return HREF_EXPR[source];
}

export function bindImage(source: ImageSource | undefined, staticValue: string, size = "l"): string {
  if (!source || source === "static") return escapeAttr(staticValue || "");
  return imageExpr(source, size);
}

export function sourceLabel(
  source: string | undefined,
  options: { label: string; value: string }[],
): string {
  if (!source || source === "static") return "";
  const found = options.find((o) => o.value === source);
  return found ? found.label : source;
}

// ---------------------------------------------------------------------------
// Mock data for canvas previews
// ---------------------------------------------------------------------------

const MOCK_TEXT: Record<Exclude<TextSource, "static">, string> = {
  "post.title": "Sample post title",
  "post.excerpt": "A short, lively excerpt from this Ghost post — shown here with mock data inside the editor.",
  "post.custom_excerpt": "Hand-written excerpt from the editor.",
  "post.content": "Full post HTML rendered at build time.",
  "post.date": "May 6, 2026",
  "post.reading_time": "4 min read",
  "post.url": "/sample-post/",
  "post.primary_author.name": "Jane Doe",
  "post.primary_author.bio": "Writes about design, engineering, and the spaces between them.",
  "post.primary_tag.name": "design",
  "tag.name": "Tag name",
  "tag.description": "All posts tagged with this topic.",
  "author.name": "Jane Doe",
  "author.bio": "Author bio, surfaced from Ghost.",
  "author.website": "https://example.com",
  "site.title": "My Blog",
  "site.description": "A site description.",
  "site.url": "https://example.com",
  "member.name": "Member Name",
  "member.email": "member@example.com",
};

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='%23dbeafe'/><stop offset='1' stop-color='%231d4ed8'/>
      </linearGradient></defs>
      <rect width='800' height='500' fill='url(%23g)'/>
      <g fill='white' opacity='0.7' font-family='Inter,sans-serif' font-size='28' font-weight='600'>
        <text x='40' y='460'>image placeholder</text>
      </g>
    </svg>`,
  );

function previewText(source: TextSource | undefined, staticValue: string): string {
  if (!source || source === "static") return staticValue ?? "";
  return MOCK_TEXT[source] ?? `{{ ${source} }}`;
}

function previewImage(source: ImageSource | undefined, staticValue: string): string {
  if (!source || source === "static") return staticValue || PLACEHOLDER_IMG;
  return PLACEHOLDER_IMG;
}

// ---------------------------------------------------------------------------
// Component property types
// ---------------------------------------------------------------------------

export type ComponentType =
  | "Container"
  | "Heading"
  | "Text"
  | "Image"
  | "Button"
  | "PostsLoop"
  | "Spacer"
  | "Divider"
  | "RichText";

// "Content source" tells Ghost to fetch a specific post/page/etc at render
// time and bind every child element to it. This is the Ghost {{#get}} pattern.
// Example: source="post-by-tag", sourceFilter="hero" generates
//   {{#get "posts" filter="tag:hash-hero" limit="1"}}{{#foreach posts}}...{{/foreach}}{{/get}}
// All `post.*` bindings on children inside resolve to the fetched post.
export type ContentSource =
  | "none"
  | "post-by-slug"
  | "post-by-tag"
  | "page-by-slug"
  | "page-by-tag"
  | "featured-post"
  | "latest-post"
  | "posts-list"
  | "pages-list"
  | "tags-list"
  | "authors-list";

type ContainerProps = {
  content: Slot;
  layout: "block" | "flex-row" | "flex-column" | "grid";
  gap: number;
  padding: number;
  bg: string;
  maxWidth: string;
  align: "flex-start" | "center" | "flex-end" | "stretch";
  justify: "flex-start" | "center" | "flex-end" | "space-between";
  radius: number;
  border: string;
  textColor: string;
  gridColumns: number;
  source: ContentSource;
  sourceFilter: string;
  sourceLimit: number;
};

export const CONTENT_SOURCE_OPTIONS: { label: string; value: ContentSource }[] = [
  { label: "None (use template context)", value: "none" },
  { label: "Post — by slug", value: "post-by-slug" },
  { label: "Post — by tag", value: "post-by-tag" },
  { label: "Page — by slug", value: "page-by-slug" },
  { label: "Page — by tag", value: "page-by-tag" },
  { label: "Featured post (latest)", value: "featured-post" },
  { label: "Latest post", value: "latest-post" },
  { label: "Posts list (custom filter)", value: "posts-list" },
  { label: "Pages list (custom filter)", value: "pages-list" },
  { label: "Tags list", value: "tags-list" },
  { label: "Authors list", value: "authors-list" },
];

export function describeSource(p: { source: ContentSource; sourceFilter: string; sourceLimit: number }): string {
  switch (p.source) {
    case "none":
      return "";
    case "post-by-slug":
      return `Post · slug "${p.sourceFilter || "..."}"`;
    case "post-by-tag":
      return `Post · tagged #${p.sourceFilter || "..."}`;
    case "page-by-slug":
      return `Page · slug "${p.sourceFilter || "..."}"`;
    case "page-by-tag":
      return `Page · tagged #${p.sourceFilter || "..."}`;
    case "featured-post":
      return "Featured post";
    case "latest-post":
      return "Latest post";
    case "posts-list":
      return `Posts list · ${p.sourceFilter || "all"} · limit ${p.sourceLimit || 6}`;
    case "pages-list":
      return `Pages list · ${p.sourceFilter || "all"} · limit ${p.sourceLimit || 6}`;
    case "tags-list":
      return `Tags list · ${p.sourceFilter || "all"} · limit ${p.sourceLimit || 12}`;
    case "authors-list":
      return `Authors list · ${p.sourceFilter || "all"} · limit ${p.sourceLimit || 12}`;
  }
}

// Build the Ghost {{#get}} ... {{#foreach}} wrapper around a Container's
// children. Returns { open, close } strings (each ending with '\n'), or null
// when no wrapping is needed.
export function buildSourceWrap(
  p: { source: ContentSource; sourceFilter: string; sourceLimit: number },
  indent: string,
): { open: string; close: string; resource: "posts" | "pages" | "tags" | "authors" } | null {
  const f = (p.sourceFilter || "").trim();
  const limit1 = `limit="1"`;
  switch (p.source) {
    case "none":
      return null;
    case "post-by-slug": {
      const filter = f ? `slug:${escapeFilterValue(f)}` : "";
      return wrapGet(indent, "posts", filter, limit1);
    }
    case "post-by-tag": {
      const tag = normalizeTag(f);
      const filter = tag ? `tag:${tag}` : "";
      return wrapGet(indent, "posts", filter, limit1);
    }
    case "page-by-slug": {
      const filter = f ? `slug:${escapeFilterValue(f)}` : "";
      return wrapGet(indent, "pages", filter, limit1);
    }
    case "page-by-tag": {
      const tag = normalizeTag(f);
      const filter = tag ? `tag:${tag}` : "";
      return wrapGet(indent, "pages", filter, limit1);
    }
    case "featured-post":
      return wrapGet(indent, "posts", "featured:true", limit1);
    case "latest-post":
      return wrapGet(indent, "posts", "", limit1);
    case "posts-list":
      return wrapGet(indent, "posts", f, `limit="${Number(p.sourceLimit) || 6}"`);
    case "pages-list":
      return wrapGet(indent, "pages", f, `limit="${Number(p.sourceLimit) || 6}"`);
    case "tags-list":
      return wrapGet(indent, "tags", f, `limit="${Number(p.sourceLimit) || 12}"`);
    case "authors-list":
      return wrapGet(indent, "authors", f, `limit="${Number(p.sourceLimit) || 12}"`);
  }
}

function wrapGet(
  indent: string,
  resource: "posts" | "pages" | "tags" | "authors",
  filter: string,
  limit: string,
): { open: string; close: string; resource: "posts" | "pages" | "tags" | "authors" } {
  const filterAttr = filter ? ` filter="${filter}"` : "";
  const open = `${indent}{{#get "${resource}"${filterAttr} ${limit}}}\n${indent}  {{#foreach ${resource}}}\n`;
  const close = `\n${indent}  {{/foreach}}\n${indent}{{/get}}`;
  return { open, close, resource };
}

function normalizeTag(raw: string): string {
  const v = (raw || "").trim().replace(/^#/, "");
  if (!v) return "";
  if (v.startsWith("hash-")) return v;
  return `hash-${v}`;
}

function escapeFilterValue(v: string): string {
  return v.replace(/"/g, '\\"');
}

type HeadingProps = {
  text: string;
  textSource: TextSource;
  level: "h1" | "h2" | "h3" | "h4";
  size: number;
  weight: 400 | 500 | 600 | 700 | 800;
  color: string;
  align: "left" | "center" | "right";
  letterSpacing: string;
  lineHeight: string;
  maxWidth: string;
};

type TextProps = {
  text: string;
  textSource: TextSource;
  size: number;
  weight: 400 | 500 | 600 | 700;
  color: string;
  align: "left" | "center" | "right";
  lineHeight: string;
  maxWidth: string;
};

type ImageProps = {
  src: string;
  srcSource: ImageSource;
  size: "s" | "m" | "l" | "xl";
  alt: string;
  altSource: TextSource;
  width: string;
  height: string;
  fit: "cover" | "contain";
  radius: number;
};

type ButtonProps = {
  label: string;
  labelSource: TextSource;
  href: string;
  hrefSource: HrefSource;
  variant: "primary" | "secondary" | "ghost" | "link";
  size: "sm" | "md" | "lg";
  align: "flex-start" | "center" | "flex-end";
};

type PostsLoopProps = {
  content: Slot;
  filter: string;
  limit: number;
  columns: number;
  gap: number;
  emptyMessage: string;
};

type SpacerProps = { height: number };
type DividerProps = { color: string; thickness: number; margin: number };
type RichTextProps = { html: string };

type AllProps = {
  Container: ContainerProps;
  Heading: HeadingProps;
  Text: TextProps;
  Image: ImageProps;
  Button: ButtonProps;
  PostsLoop: PostsLoopProps;
  Spacer: SpacerProps;
  Divider: DividerProps;
  RichText: RichTextProps;
};

// ---------------------------------------------------------------------------
// Compiler: each primitive produces Handlebars output
// ---------------------------------------------------------------------------

export type CompileContext = {
  template: "index" | "post" | "page" | "tag" | "author";
  inLoop: boolean;
};

type Compiler<P> = (props: P, children: string, ctx: CompileContext, indent: string) => string;

function styleObj(s: Record<string, string | number | undefined>): string {
  return Object.entries(s)
    .filter(([, v]) => v !== undefined && v !== "" && v !== null)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

function containerStyle(p: ContainerProps): string {
  const layout = p.layout || "block";
  const isFlex = layout === "flex-row" || layout === "flex-column";
  const isGrid = layout === "grid";
  return styleObj({
    display: isFlex ? "flex" : isGrid ? "grid" : "block",
    "flex-direction": layout === "flex-column" ? "column" : layout === "flex-row" ? "row" : undefined,
    "grid-template-columns": isGrid ? `repeat(${p.gridColumns || 3}, minmax(0, 1fr))` : undefined,
    gap: isFlex || isGrid ? `${p.gap || 0}px` : undefined,
    "align-items": isFlex || isGrid ? p.align || "stretch" : undefined,
    "justify-content": isFlex ? p.justify || "flex-start" : undefined,
    padding: `${p.padding || 0}px`,
    background: p.bg && p.bg !== "transparent" ? p.bg : undefined,
    "max-width": p.maxWidth || undefined,
    margin: p.maxWidth ? "0 auto" : undefined,
    "border-radius": p.radius ? `${p.radius}px` : undefined,
    border: p.border && p.border !== "none" ? p.border : undefined,
    color: p.textColor || undefined,
  });
}

export const compilers: { [K in ComponentType]: Compiler<AllProps[K]> } = {
  Container: (p, children, _ctx, indent) => {
    const style = containerStyle(p);
    const wrap = buildSourceWrap(p, indent + "  ");
    const body = wrap ? `${wrap.open}${children}${wrap.close}` : children;
    return `${indent}<div class="pd-container-el"${style ? ` style="${style}"` : ""}>${body ? "\n" + body + "\n" + indent : ""}</div>`;
  },

  Heading: (p, _children, _ctx, indent) => {
    const Tag = p.level || "h2";
    const style = styleObj({
      "font-size": p.size ? `${p.size}px` : undefined,
      "font-weight": p.weight || undefined,
      color: p.color || undefined,
      "text-align": p.align || undefined,
      "letter-spacing": p.letterSpacing || undefined,
      "line-height": p.lineHeight || undefined,
      "max-width": p.maxWidth || undefined,
      margin: p.maxWidth ? "0 auto" : undefined,
    });
    return `${indent}<${Tag}${style ? ` style="${style}"` : ""}>${bindText(p.textSource, p.text)}</${Tag}>`;
  },

  Text: (p, _children, _ctx, indent) => {
    const style = styleObj({
      "font-size": p.size ? `${p.size}px` : undefined,
      "font-weight": p.weight || undefined,
      color: p.color || undefined,
      "text-align": p.align || undefined,
      "line-height": p.lineHeight || undefined,
      "max-width": p.maxWidth || undefined,
      margin: p.maxWidth ? "0 auto" : undefined,
    });
    // For content/HTML sources, emit without escaping wrapper.
    if (p.textSource === "post.content") {
      return `${indent}<div${style ? ` style="${style}"` : ""}>{{content}}</div>`;
    }
    return `${indent}<p${style ? ` style="${style}"` : ""}>${bindText(p.textSource, p.text)}</p>`;
  },

  Image: (p, _children, _ctx, indent) => {
    const srcExpr = bindImage(p.srcSource, p.src, p.size);
    const altExpr = bindText(p.altSource, p.alt);
    const style = styleObj({
      width: p.width || undefined,
      height: p.height || undefined,
      "object-fit": p.fit || undefined,
      "border-radius": p.radius ? `${p.radius}px` : undefined,
    });
    // Wrap in {{#if}} when bound to a Ghost image so missing media doesn't render broken <img>.
    if (p.srcSource && p.srcSource !== "static") {
      const cond = p.srcSource === "post.feature_image" ? "feature_image" : null;
      const open = cond ? `{{#if ${cond}}}\n${indent}  ` : "";
      const close = cond ? `\n${indent}{{/if}}` : "";
      return `${indent}${open}<img src="${srcExpr}" alt="${altExpr}" loading="lazy"${style ? ` style="${style}"` : ""} />${close}`;
    }
    return `${indent}<img src="${srcExpr}" alt="${altExpr}" loading="lazy"${style ? ` style="${style}"` : ""} />`;
  },

  Button: (p, _children, _ctx, indent) => {
    const labelExpr = bindText(p.labelSource, p.label);
    const hrefExpr = bindHref(p.hrefSource, p.href);
    const cls = `pd-button pd-button--${p.variant || "primary"} pd-button--${p.size || "md"}`;
    const align = p.align || "flex-start";
    const wrapStyle = `display:flex;justify-content:${align}`;
    return `${indent}<div style="${wrapStyle}"><a class="${cls}" href="${hrefExpr}">${labelExpr}</a></div>`;
  },

  PostsLoop: (p, children, _ctx, indent) => {
    const cols = Number(p.columns) || 1;
    const limit = Number(p.limit) || 6;
    const gridStyle = cols > 1
      ? `display:grid;grid-template-columns:repeat(${cols}, minmax(0, 1fr));gap:${p.gap || 24}px`
      : `display:flex;flex-direction:column;gap:${p.gap || 24}px`;
    const filter = p.filter ? ` filter="${escapeAttr(p.filter)}"` : "";
    const empty = p.emptyMessage
      ? `\n${indent}  {{else}}\n${indent}    <p>${escapeHtml(p.emptyMessage)}</p>`
      : "";

    // Use {{#get}} with filter when one is provided, else {{#foreach posts}}.
    if (p.filter) {
      return `${indent}<div style="${gridStyle}">
${indent}  {{#get "posts"${filter} limit="${limit}" as |custom_posts|}}
${indent}    {{#foreach custom_posts}}
${children}
${indent}    {{/foreach}}${empty}
${indent}  {{/get}}
${indent}</div>`;
    }
    return `${indent}<div style="${gridStyle}">
${indent}  {{#foreach posts limit="${limit}"}}
${children}
${indent}  {{/foreach}}${empty}
${indent}</div>`;
  },

  Spacer: (p, _children, _ctx, indent) =>
    `${indent}<div style="height:${Number(p.height) || 24}px" aria-hidden="true"></div>`,

  Divider: (p, _children, _ctx, indent) =>
    `${indent}<hr style="border:none;border-top:${Number(p.thickness) || 1}px solid ${escapeAttr(p.color || "#e2e8f0")};margin:${Number(p.margin) || 24}px 0" />`,

  RichText: (p, _children, _ctx, indent) =>
    `${indent}<div class="pd-richtext">\n${indent}  ${p.html || "<p></p>"}\n${indent}</div>`,
};

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeAttr(s: string): string {
  return String(s ?? "").replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Editor previews
// ---------------------------------------------------------------------------

function BindBadge({ source, options }: { source: string | undefined; options: { label: string; value: string }[] }) {
  if (!source || source === "static") return null;
  const label = sourceLabel(source, options);
  return (
    <span
      style={{
        position: "absolute",
        top: 6,
        left: 6,
        background: "rgba(29, 78, 216, 0.92)",
        color: "white",
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 7px",
        borderRadius: 4,
        letterSpacing: "0.02em",
        fontFamily: "var(--pd-mono)",
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      ⌁ {label}
    </span>
  );
}

function Wrapper({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: "relative", ...style }}>{children}</div>
  );
}

// ---------------------------------------------------------------------------
// Puck config
// ---------------------------------------------------------------------------

export const puckConfig: Config = {
  categories: {
    layout: { title: "Layout", components: ["Container", "PostsLoop", "Spacer", "Divider"] },
    content: { title: "Content", components: ["Heading", "Text", "Image", "Button", "RichText"] },
  },
  components: {
    Container: {
      label: "Container",
      fields: {
        source: {
          type: "select",
          label: "Pull content from Ghost",
          options: CONTENT_SOURCE_OPTIONS,
        },
        sourceFilter: {
          type: "text",
          label: "Filter value (tag/slug/NQL)",
        },
        sourceLimit: {
          type: "number",
          label: "Limit (for list sources)",
          min: 1,
          max: 50,
        },
        layout: {
          type: "select",
          label: "Layout",
          options: [
            { label: "Block", value: "block" },
            { label: "Flex row", value: "flex-row" },
            { label: "Flex column", value: "flex-column" },
            { label: "Grid", value: "grid" },
          ],
        },
        gridColumns: { type: "number", label: "Grid columns", min: 1, max: 12 },
        gap: { type: "number", label: "Gap (px)", min: 0, max: 96 },
        padding: { type: "number", label: "Padding (px)", min: 0, max: 160 },
        align: {
          type: "select",
          label: "Align items",
          options: [
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "End", value: "flex-end" },
            { label: "Stretch", value: "stretch" },
          ],
        },
        justify: {
          type: "select",
          label: "Justify content",
          options: [
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "End", value: "flex-end" },
            { label: "Space between", value: "space-between" },
          ],
        },
        bg: { type: "text", label: "Background (CSS color)" },
        textColor: { type: "text", label: "Text color" },
        maxWidth: { type: "text", label: "Max width (e.g. 1100px)" },
        radius: { type: "number", label: "Border radius (px)", min: 0, max: 96 },
        border: { type: "text", label: "Border (CSS shorthand)" },
        content: { type: "slot" },
      },
      defaultProps: {
        source: "none",
        sourceFilter: "",
        sourceLimit: 6,
        layout: "block",
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
        content: [],
      },
      render: ({ content: Content, source, sourceFilter, sourceLimit, layout, gap, padding, align, justify, bg, maxWidth, radius, border, textColor, gridColumns }) => {
        const isFlex = layout === "flex-row" || layout === "flex-column";
        const isGrid = layout === "grid";
        const hasSource = source && source !== "none";
        const sourceDesc = hasSource ? describeSource({ source, sourceFilter, sourceLimit }) : "";
        return (
          <div
            style={{
              position: "relative",
              display: isFlex ? "flex" : isGrid ? "grid" : "block",
              flexDirection: layout === "flex-column" ? "column" : layout === "flex-row" ? "row" : undefined,
              gridTemplateColumns: isGrid ? `repeat(${gridColumns || 3}, minmax(0, 1fr))` : undefined,
              gap: isFlex || isGrid ? gap : undefined,
              alignItems: isFlex || isGrid ? align : undefined,
              justifyContent: isFlex ? justify : undefined,
              padding,
              background: bg && bg !== "transparent" ? bg : undefined,
              maxWidth: maxWidth || undefined,
              margin: maxWidth ? "0 auto" : undefined,
              borderRadius: radius,
              border: hasSource
                ? "1px dashed #1d4ed8"
                : border && border !== "none"
                ? border
                : undefined,
              outline: hasSource ? "1px dashed rgba(29,78,216,0.15)" : undefined,
              outlineOffset: hasSource ? 4 : undefined,
              color: textColor || undefined,
              minHeight: 40,
            }}
          >
            {hasSource && (
              <span
                style={{
                  position: "absolute",
                  top: -11,
                  left: 12,
                  background: "#1d4ed8",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 4,
                  letterSpacing: "0.02em",
                  fontFamily: "var(--pd-mono)",
                  zIndex: 1,
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}
              >
                ⌁ {sourceDesc}
              </span>
            )}
            <Content />
          </div>
        );
      },
    },

    Heading: {
      label: "Heading",
      fields: {
        text: { type: "text", label: "Static text" },
        textSource: { type: "select", label: "Data source", options: TEXT_SOURCE_OPTIONS },
        level: {
          type: "select",
          label: "Level",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
            { label: "H4", value: "h4" },
          ],
        },
        size: { type: "number", label: "Font size (px)", min: 12, max: 120 },
        weight: {
          type: "select",
          label: "Weight",
          options: [400, 500, 600, 700, 800].map((v) => ({ label: String(v), value: v })),
        },
        color: { type: "text", label: "Color" },
        align: {
          type: "select",
          label: "Align",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        letterSpacing: { type: "text", label: "Letter spacing (e.g. -0.02em)" },
        lineHeight: { type: "text", label: "Line height (e.g. 1.1)" },
        maxWidth: { type: "text", label: "Max width" },
      },
      defaultProps: {
        text: "Heading",
        textSource: "static",
        level: "h2",
        size: 36,
        weight: 700,
        color: "#0b1220",
        align: "left",
        letterSpacing: "-0.02em",
        lineHeight: "1.15",
        maxWidth: "",
      },
      render: ({ text, textSource, level, size, weight, color, align, letterSpacing, lineHeight, maxWidth }) => {
        const Tag = level || "h2";
        return (
          <Wrapper>
            <BindBadge source={textSource} options={TEXT_SOURCE_OPTIONS} />
            <Tag
              style={{
                fontSize: size,
                fontWeight: weight,
                color,
                textAlign: align,
                letterSpacing,
                lineHeight,
                maxWidth: maxWidth || undefined,
                margin: maxWidth ? "0 auto" : 0,
              }}
            >
              {previewText(textSource, text) || "Heading"}
            </Tag>
          </Wrapper>
        );
      },
    },

    Text: {
      label: "Text",
      fields: {
        text: { type: "textarea", label: "Static text" },
        textSource: { type: "select", label: "Data source", options: TEXT_SOURCE_OPTIONS },
        size: { type: "number", label: "Font size (px)", min: 10, max: 64 },
        weight: {
          type: "select",
          label: "Weight",
          options: [400, 500, 600, 700].map((v) => ({ label: String(v), value: v })),
        },
        color: { type: "text", label: "Color" },
        align: {
          type: "select",
          label: "Align",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        lineHeight: { type: "text", label: "Line height" },
        maxWidth: { type: "text", label: "Max width" },
      },
      defaultProps: {
        text: "Body text. Edit me, or bind to a Ghost field.",
        textSource: "static",
        size: 16,
        weight: 400,
        color: "#334155",
        align: "left",
        lineHeight: "1.65",
        maxWidth: "",
      },
      render: ({ text, textSource, size, weight, color, align, lineHeight, maxWidth }) => (
        <Wrapper>
          <BindBadge source={textSource} options={TEXT_SOURCE_OPTIONS} />
          <p
            style={{
              fontSize: size,
              fontWeight: weight,
              color,
              textAlign: align,
              lineHeight,
              maxWidth: maxWidth || undefined,
              margin: maxWidth ? "0 auto" : 0,
            }}
          >
            {previewText(textSource, text)}
          </p>
        </Wrapper>
      ),
    },

    Image: {
      label: "Image",
      fields: {
        src: { type: "text", label: "Static URL" },
        srcSource: { type: "select", label: "Image source", options: IMAGE_SOURCE_OPTIONS },
        size: {
          type: "select",
          label: "Ghost size",
          options: [
            { label: "Small (s)", value: "s" },
            { label: "Medium (m)", value: "m" },
            { label: "Large (l)", value: "l" },
            { label: "Extra-large (xl)", value: "xl" },
          ],
        },
        alt: { type: "text", label: "Alt (static)" },
        altSource: { type: "select", label: "Alt source", options: TEXT_SOURCE_OPTIONS },
        width: { type: "text", label: "Width (CSS)" },
        height: { type: "text", label: "Height (CSS)" },
        fit: {
          type: "select",
          label: "Object fit",
          options: [
            { label: "Cover", value: "cover" },
            { label: "Contain", value: "contain" },
          ],
        },
        radius: { type: "number", label: "Border radius (px)", min: 0, max: 96 },
      },
      defaultProps: {
        src: "",
        srcSource: "post.feature_image",
        size: "l",
        alt: "",
        altSource: "post.title",
        width: "100%",
        height: "auto",
        fit: "cover",
        radius: 12,
      },
      render: ({ src, srcSource, alt, altSource, width, height, fit, radius }) => (
        <Wrapper>
          <BindBadge source={srcSource} options={IMAGE_SOURCE_OPTIONS} />
          <img
            src={previewImage(srcSource, src)}
            alt={previewText(altSource, alt)}
            style={{
              width,
              height: height && height !== "auto" ? height : undefined,
              aspectRatio: height === "auto" ? "16/9" : undefined,
              objectFit: fit,
              borderRadius: radius,
              display: "block",
            }}
          />
        </Wrapper>
      ),
    },

    Button: {
      label: "Button",
      fields: {
        label: { type: "text", label: "Static label" },
        labelSource: { type: "select", label: "Label source", options: TEXT_SOURCE_OPTIONS },
        href: { type: "text", label: "Static URL" },
        hrefSource: { type: "select", label: "Link source", options: HREF_SOURCE_OPTIONS },
        variant: {
          type: "select",
          label: "Variant",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Ghost", value: "ghost" },
            { label: "Link", value: "link" },
          ],
        },
        size: {
          type: "select",
          label: "Size",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
        align: {
          type: "select",
          label: "Align",
          options: [
            { label: "Left", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "Right", value: "flex-end" },
          ],
        },
      },
      defaultProps: {
        label: "Read more",
        labelSource: "static",
        href: "#",
        hrefSource: "post.url",
        variant: "primary",
        size: "md",
        align: "flex-start",
      },
      render: ({ label, labelSource, hrefSource, variant, size, align }) => {
        const padding =
          size === "sm" ? "8px 14px" : size === "lg" ? "14px 28px" : "10px 20px";
        const fontSize = size === "sm" ? 13 : size === "lg" ? 16 : 14;
        const base: CSSProperties = {
          display: "inline-flex",
          alignItems: "center",
          padding,
          fontSize,
          fontWeight: 600,
          borderRadius: 10,
          textDecoration: "none",
          border: "1px solid transparent",
        };
        const variantStyle: Record<string, CSSProperties> =
          {
            primary: { background: "#1d4ed8", color: "white", boxShadow: "0 4px 14px rgba(29,78,216,0.3)" },
            secondary: { background: "white", color: "#0b1220", borderColor: "#e6e3dc" },
            ghost: { background: "transparent", color: "#1d4ed8" },
            link: { background: "transparent", color: "#1d4ed8", padding: 0, textDecoration: "underline" },
          };
        return (
          <Wrapper style={{ display: "flex", justifyContent: align }}>
            <BindBadge source={labelSource} options={TEXT_SOURCE_OPTIONS} />
            <a href="#" onClick={(e) => e.preventDefault()} style={{ ...base, ...variantStyle[variant] }}>
              {previewText(labelSource, label) || "Button"}
              {hrefSource && hrefSource !== "static" && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 10,
                    opacity: 0.7,
                    fontFamily: "var(--pd-mono)",
                  }}
                >
                  ⌁ {sourceLabel(hrefSource, HREF_SOURCE_OPTIONS)}
                </span>
              )}
            </a>
          </Wrapper>
        );
      },
    },

    PostsLoop: {
      label: "Posts loop",
      fields: {
        filter: { type: "text", label: "Filter (e.g. tag:featured)" },
        limit: { type: "number", label: "Limit", min: 1, max: 50 },
        columns: { type: "number", label: "Grid columns", min: 1, max: 6 },
        gap: { type: "number", label: "Gap (px)", min: 0, max: 96 },
        emptyMessage: { type: "text", label: "Empty state message" },
        content: { type: "slot" },
      },
      defaultProps: {
        filter: "",
        limit: 6,
        columns: 3,
        gap: 24,
        emptyMessage: "No posts yet.",
        content: [],
      },
      render: ({ content: Content, columns, gap }) => (
        <Wrapper>
          <span
            style={{
              position: "absolute",
              top: -10,
              left: 8,
              background: "#0b1220",
              color: "white",
              fontSize: 10,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 4,
              letterSpacing: "0.04em",
              fontFamily: "var(--pd-mono)",
              textTransform: "uppercase",
              zIndex: 1,
            }}
          >
            foreach posts
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns || 1}, minmax(0, 1fr))`,
              gap,
              border: "1px dashed #c7d2fe",
              borderRadius: 12,
              padding: 12,
              background: "rgba(219, 234, 254, 0.25)",
            }}
          >
            <Content />
          </div>
        </Wrapper>
      ),
    },

    Spacer: {
      label: "Spacer",
      fields: {
        height: { type: "number", label: "Height (px)", min: 0, max: 400 },
      },
      defaultProps: { height: 48 },
      render: ({ height }) => (
        <div
          style={{
            height,
            background:
              "repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 6px, #fff 6px, #fff 12px)",
            border: "1px dashed #cbd5e1",
            borderRadius: 6,
          }}
        />
      ),
    },

    Divider: {
      label: "Divider",
      fields: {
        color: { type: "text", label: "Color" },
        thickness: { type: "number", label: "Thickness (px)", min: 1, max: 16 },
        margin: { type: "number", label: "Vertical margin (px)", min: 0, max: 96 },
      },
      defaultProps: { color: "#e6e3dc", thickness: 1, margin: 24 },
      render: ({ color, thickness, margin }) => (
        <hr style={{ border: "none", borderTop: `${thickness}px solid ${color}`, margin: `${margin}px 0` }} />
      ),
    },

    RichText: {
      label: "Rich text",
      fields: { html: { type: "textarea", label: "HTML" } },
      defaultProps: { html: "<h2>Heading</h2>\n<p>Write HTML here. Useful for prose blocks.</p>" },
      render: ({ html }) => (
        <div
          style={{ maxWidth: 720, margin: "0 auto" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ),
    },
  },
};
