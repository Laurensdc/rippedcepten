import fs from "fs";
import * as cheerio from "cheerio";

async function scrapeWebsiteText(url) {
  const req = await fetch(url);
  const text = await req.text();
  return text;
}

/**
 * For testing DOM selection, without network calls
 */
function readHtmlAsTempCodingThing() {
  const data = fs.readFileSync("./dom-snip-for-testing.html", "utf-8");
  return data;
}

export async function getHtmlAsCheerioFunction(url) {
  // Fetch from actual live website
  const html = await scrapeWebsiteText(url);

  // Hard coded HTML snippet for debugging
  // const html = await readHtmlAsTempCodingThing();

  const $ = cheerio.load(html);
  return $;
}
