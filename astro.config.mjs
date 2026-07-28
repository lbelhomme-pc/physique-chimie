// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { siteConfig } from './src/config/site.ts';
import rehypeCourseSections from './src/utils/rehypeCourseSections.mjs';

export default defineConfig({
  site: siteConfig.productionUrl,
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeCourseSections],
  },
  vite: {
    cacheDir: 'tmp/vite-cache',
  },
  output: 'static',
});
