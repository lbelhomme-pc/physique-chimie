import type { APIRoute } from "astro";
import { getGlobalSearchCatalogue } from "../data/globalSearchResources";

export const prerender = true;

export const GET: APIRoute = () => {
  const { resources } = getGlobalSearchCatalogue();

  return new Response(JSON.stringify(resources), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
