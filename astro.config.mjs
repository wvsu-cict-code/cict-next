import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwind from "@astrojs/tailwind";

import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  site: 'https://cictwvsu.com/',
  integrations: [mdx(), sitemap(), tailwind(), react(), compress()]
});