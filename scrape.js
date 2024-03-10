import * as cheerio from "cheerio";

async function scrapeWebsiteText(url) {
  console.dir(url, { depth: null, colors: true });
  const req = await fetch(url);
  const text = await req.text();
  return text;
}

export async function extractHTMLBodyAsText(url) {
  const $ = await getHtmlAsCheerioFunction(url);
  const recipeText = $("body").text();
  const textWithoutATonOfWhitespace = recipeText.replace(/\s\s/g, "");
  return textWithoutATonOfWhitespace;
}

export async function getHtmlAsCheerioFunction(url) {
  // Fetch from actual live website
  const html = await scrapeWebsiteText(url);
  const $ = cheerio.load(html);
  return $;
}
