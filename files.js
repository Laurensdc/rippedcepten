import fs from "fs";
import path from "path";
import { extractHTMLBodyAsText } from "./scrape.js";

export const recipeDir = "./recipes";

export function getRecipeNameFromURL(link) {
  const url = new URL(link);
  const pathname = url.pathname;
  // Split the pathname by '/' and filter out empty strings
  const pathParts = pathname.split("/").filter((part) => part !== "");

  // Get the last part
  const recipeName = pathParts[pathParts.length - 1];

  return recipeName;
}

export function readFilesAndMergeThem() {
  const file1 = fs.readFileSync(
    "./recipes/broodje-met-aioli-en-geroosterde-paprika.json",
    "utf-8"
  );

  const file2 = fs.readFileSync(
    "./recipes/chinese-kool-uit-de-oven.json",
    "utf-8"
  );

  const json1 = JSON.parse(file1);
  const json2 = JSON.parse(file2);

  const ultimateJson = [json1, json2];
  return ultimateJson;
}

export async function writeRecipeToFile(url) {
  const recipeText = await extractHTMLBodyAsText(url);
  console.dir({ recipeText }, { depth: null, colors: true });
  const recipeName = getRecipeNameFromURL(url);
  writeToFile(
    JSON.stringify({ url, recipe: recipeText }),
    recipeName + ".json"
  );
}

export function writeToFile(recipe, fileName) {
  fs.writeFileSync(`${recipeDir}/${fileName}`, recipe, "utf-8");
}
