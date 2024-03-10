import fs from 'fs';
import * as cheerio from 'cheerio';

async function scrapeWebsite(url) {
  const req = await fetch(url);
  const html = await req.text();
  return html;
}

/**
 * For testing DOM selection, without network calls
 */
function readHtmlAsTempCodingThing() {
  const data = fs.readFileSync('./dom-snip-for-testing.html', 'utf-8');
  return data;
}

export async function getHtmlAsCheerioFunction(url) {
  // Fetch from actual live website
  const html = await scrapeWebsite(url);

  // Hard coded HTML snippet for debugging
  // const html = await readHtmlAsTempCodingThing();

  const $ = cheerio.load(html);
  return $;
}

