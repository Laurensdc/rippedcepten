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
  const files = fs.readdirSync(recipeDir);
  const jsonFiles = files.filter((file) => file.endsWith(".json"));

  const jsons = jsonFiles.map((file) => {
    const filePath = path.join(recipeDir, file);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContents);
  });

  return jsons;
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
