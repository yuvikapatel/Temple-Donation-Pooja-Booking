import { SITE } from "@/lib/site";
import { getPackages } from "@/lib/queries";

export default async function sitemap() {
  const packages = await getPackages();
  const pages = ["", "/donate", "/booking", "/receipt"].map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: "weekly" }));
  return [...pages, ...packages.map((p) => ({ url: `${SITE.url}/donate/${p.id}`, changeFrequency: "weekly" }))];
}
