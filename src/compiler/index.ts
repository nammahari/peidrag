// Compiler: peidrag Puck tree -> Ghost theme files.
//
// Walks the Puck data tree recursively. Each primitive in sections/index.tsx
// owns a compile() that returns a Handlebars fragment; the compiler glues
// them together with proper indentation and wraps each template in the
// default layout via {{!< default}}.

import type { Data } from "@measured/puck";
import JSZip from "jszip";
import { compilers, type ComponentType, type CompileContext } from "../sections";

export type TemplateId = "index" | "post" | "page" | "tag" | "author";

export type ThemeMeta = {
  name: string;
  description: string;
  version: string;
  author: string;
  siteTitle: string;
  primaryColor: string;
};

export type ThemeProject = {
  meta: ThemeMeta;
  templates: Record<TemplateId, Data>;
};

type ComponentNode = {
  type: string;
  props: Record<string, unknown> & { id?: string };
};

function renderNode(node: ComponentNode, ctx: CompileContext, indent: string): string {
  const compile = (compilers as Record<string, (p: any, c: string, ctx: CompileContext, i: string) => string>)[node.type as ComponentType];
  if (!compile) return `${indent}<!-- unknown component: ${node.type} -->`;

  const props = node.props ?? {};
  const slotChildren = Array.isArray(props.content) ? (props.content as ComponentNode[]) : [];

  // PostsLoop and Container-with-source both push "inside loop" context to
  // their children — child bindings resolve against the iterating record,
  // not the page-level context.
  const containerPushesLoop =
    node.type === "Container" && props.source && props.source !== "none";
  const childCtx: CompileContext =
    node.type === "PostsLoop" || containerPushesLoop ? { ...ctx, inLoop: true } : ctx;

  const childIndent = indent + "  ";
  const renderedChildren = slotChildren.map((c) => renderNode(c, childCtx, childIndent)).join("\n");

  return compile(props, renderedChildren, ctx, indent);
}

function renderTemplate(data: Data, ctx: CompileContext): string {
  const items = (data?.content ?? []) as ComponentNode[];
  return items.map((n) => renderNode(n, ctx, "    ")).join("\n");
}

function wrap(body: string): string {
  return `{{!< default}}\n${body}\n`;
}

// ---------------------------------------------------------------------------
// Ghost theme files
// ---------------------------------------------------------------------------

function defaultHbs(): string {
  return `<!DOCTYPE html>
<html lang="{{@site.locale}}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{{meta_title}}</title>
  <meta name="description" content="{{meta_description}}" />
  <link rel="stylesheet" href="{{asset "built/screen.css"}}" />
  <style>:root { --pd-primary: {{@custom.primary_color}}; --pd-accent: {{@site.accent_color}}; }</style>
  {{ghost_head}}
</head>
<body class="{{body_class}}">
  {{> "site-header"}}

  <main class="pd-main">
    {{{body}}}
  </main>

  {{> "site-footer"}}

  <script src="{{asset "built/main.js"}}" defer></script>
  {{ghost_foot}}
</body>
</html>
`;
}

function siteHeaderPartial(): string {
  return `<header class="pd-site-header">
  <div class="pd-site-header__inner">
    <a class="pd-site-logo" href="{{@site.url}}">
      {{#if @site.logo}}
        <img src="{{img_url @site.logo size="s"}}" alt="{{@site.title}}" />
      {{else}}
        {{@site.title}}
      {{/if}}
    </a>
    <nav class="pd-site-nav" aria-label="Primary">
      {{navigation}}
    </nav>
    <div class="pd-site-header__actions">
      {{#unless @member}}
        <a class="pd-button pd-button--ghost pd-button--sm" href="#/portal/signin">Sign in</a>
        <a class="pd-button pd-button--primary pd-button--sm" href="#/portal/signup">Subscribe</a>
      {{else}}
        <a class="pd-button pd-button--ghost pd-button--sm" href="#/portal/account">Account</a>
      {{/unless}}
    </div>
  </div>
</header>
`;
}

function siteFooterPartial(): string {
  return `<footer class="pd-site-footer">
  <div class="pd-site-footer__inner">
    <p>&copy; {{date format="YYYY"}} <a href="{{@site.url}}">{{@site.title}}</a> &middot; Powered by <a href="https://ghost.org">Ghost</a></p>
    {{navigation type="secondary"}}
  </div>
</footer>
`;
}

function packageJson(meta: ThemeMeta): string {
  const slug = slugify(meta.name);
  return (
    JSON.stringify(
      {
        name: slug,
        description: meta.description,
        version: meta.version,
        engines: { ghost: ">=5.0.0" },
        license: "MIT",
        author: { name: meta.author, email: "hello@example.com" },
        keywords: ["ghost-theme", "peidrag"],
        config: {
          posts_per_page: 12,
          card_assets: true,
          image_sizes: {
            xs: { width: 160 },
            s: { width: 400 },
            m: { width: 750 },
            l: { width: 960 },
            xl: { width: 1400 },
          },
          custom: {
            primary_color: { type: "color", default: meta.primaryColor },
          },
        },
      },
      null,
      2,
    ) + "\n"
  );
}

function mainCss(meta: ThemeMeta): string {
  return `/* ${meta.name} — generated by peidrag */
:root {
  --pd-primary: ${meta.primaryColor};
  --pd-primary-fg: #ffffff;
  --pd-bg: #ffffff;
  --pd-fg: #0b1220;
  --pd-fg-muted: #475569;
  --pd-muted: #64748b;
  --pd-border: #e6e3dc;
  --pd-radius: 12px;
  --pd-max: 1100px;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--pd-bg); color: var(--pd-fg); font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif; line-height: 1.6; -webkit-font-smoothing: antialiased; }
img { max-width: 100%; height: auto; display: block; }
a { color: var(--pd-primary); text-decoration: none; }
a:hover { text-decoration: underline; }

.pd-site-header {
  border-bottom: 1px solid var(--pd-border);
  padding: 18px 24px;
  position: sticky;
  top: 0;
  background: var(--pd-bg);
  z-index: 10;
}
.pd-site-header__inner {
  max-width: var(--pd-max);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.pd-site-logo { font-weight: 700; font-size: 20px; color: var(--pd-fg); }
.pd-site-logo img { max-height: 36px; }
.pd-site-nav ul { display: flex; gap: 24px; list-style: none; margin: 0; padding: 0; flex-wrap: wrap; }
.pd-site-nav a { color: var(--pd-fg); font-weight: 500; }
.pd-site-header__actions { display: flex; gap: 8px; }

.pd-main { padding: 32px 0; }
.pd-container-el { box-sizing: border-box; }

.pd-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  text-decoration: none;
  border: 1px solid transparent;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}
.pd-button:hover { text-decoration: none; transform: translateY(-1px); }
.pd-button--sm { padding: 8px 14px; font-size: 13px; }
.pd-button--lg { padding: 14px 28px; font-size: 16px; }

.pd-button--primary { background: var(--pd-primary); color: var(--pd-primary-fg); box-shadow: 0 4px 14px rgba(0,0,0,0.10); }
.pd-button--secondary { background: #fff; color: var(--pd-fg); border-color: var(--pd-border); }
.pd-button--ghost { background: transparent; color: var(--pd-primary); }
.pd-button--link { background: transparent; color: var(--pd-primary); padding: 0; text-decoration: underline; }

.pd-richtext h1, .pd-richtext h2, .pd-richtext h3 { margin-top: 1.4em; }
.pd-richtext p { margin: 0 0 1em; }
.pd-richtext img { border-radius: var(--pd-radius); margin: 1em 0; }

.pd-site-footer {
  border-top: 1px solid var(--pd-border);
  padding: 32px 24px;
  text-align: center;
  color: var(--pd-muted);
  margin-top: 64px;
}
.pd-site-footer__inner { max-width: var(--pd-max); margin: 0 auto; }
.pd-site-footer__inner ul { display: flex; gap: 16px; justify-content: center; list-style: none; padding: 0; margin: 12px 0 0; flex-wrap: wrap; }

/* Koenig editor card widths — required by Ghost themes for full-bleed images in posts. */
.kg-width-wide { margin-left: calc(50% - 50vw + 4rem); margin-right: calc(50% - 50vw + 4rem); max-width: none; }
.kg-width-full { margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); max-width: 100vw; }
.kg-width-full img { width: 100vw; }
@media (max-width: 800px) { .kg-width-wide { margin-left: 0; margin-right: 0; } }

@media (max-width: 900px) {
  .pd-site-header__inner { flex-direction: column; align-items: flex-start; }
}
`;
}

function mainJs(): string {
  return `// ${"theme"} runtime — generated by peidrag.
(function () {
  document.documentElement.classList.add("pd-ready");
})();
`;
}

function errorHbs(): string {
  return `{{!< default}}
<section class="pd-error" style="text-align:center;padding:96px 24px;">
  <h1 style="font-size:48px;margin:0 0 16px;">{{statusCode}}</h1>
  <p style="color:#64748b;">{{message}}</p>
  <p><a class="pd-button pd-button--primary" href="{{@site.url}}">Back home</a></p>
</section>
`;
}

function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "peidrag-theme";
}

function gitkeep(): string {
  return "";
}

export function compile(project: ThemeProject): Record<string, string> {
  const out: Record<string, string> = {};

  out["package.json"] = packageJson(project.meta);
  out["default.hbs"] = defaultHbs();
  out["partials/site-header.hbs"] = siteHeaderPartial();
  out["partials/site-footer.hbs"] = siteFooterPartial();
  out["assets/built/screen.css"] = mainCss(project.meta);
  out["assets/built/main.js"] = mainJs();
  out["assets/images/.gitkeep"] = gitkeep();
  out["error.hbs"] = errorHbs();

  out["index.hbs"] = wrap(renderTemplate(project.templates.index, { template: "index", inLoop: false }));
  out["post.hbs"] = wrap(renderTemplate(project.templates.post, { template: "post", inLoop: false }));
  out["page.hbs"] = wrap(renderTemplate(project.templates.page, { template: "page", inLoop: false }));
  out["tag.hbs"] = wrap(renderTemplate(project.templates.tag, { template: "tag", inLoop: false }));
  out["author.hbs"] = wrap(renderTemplate(project.templates.author, { template: "author", inLoop: false }));

  return out;
}

export async function downloadZip(project: ThemeProject): Promise<void> {
  const files = compile(project);
  const zip = new JSZip();
  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const slug = slugify(project.meta.name);

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
