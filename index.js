import express from "express";
import fs from "fs";

import bodyParser from "body-parser";
import { getHtmlAsCheerioFunction } from "./scrape.js";
import { writeToFile } from "./files.js";
import path from "path";
import Fuse from "fuse.js";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  res.render("./index", { recipe: undefined });
});

app.get("/test", async (req, res) => {
  try {
    const filePath = path.join(
      "recipes",
      "aardpeer-met-prei-en-notensaus.html"
    );
    const recipe = fs.readFileSync(filePath, "utf-8");

    res.render("./index", { recipe });
  } catch (err) {
    res.status(404).send("File not found: " + err);
  }
});

function fuzzySearch(json, searchTerm) {
  const fuse = new Fuse(json, {
    keys: ["url", "recipe"],
    ignoreLocation: true,
  });

  const result = fuse.search(searchTerm);

  return result;
}

app.post("/search", async (req, res) => {
  const searchTerm = req.body.keyword;
  const ultimateJson = readFilesAndMergeThem();

  const result = fuzzySearch(ultimateJson, searchTerm);

  console.dir(result, { depth: null, colors: true });

  const urls = result.map((r) => r.item.url);
  res.send(urls);
});

function getRecipeNameFromURL(link) {
  const url = new URL(link);
  const pathname = url.pathname;
  // Split the pathname by '/' and filter out empty strings
  const pathParts = pathname.split("/").filter((part) => part !== "");

  // Get the last part
  const recipeName = pathParts[pathParts.length - 1];

  return recipeName;
}

function readFilesAndMergeThem() {
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

async function extractHTMLBodyAsText(url) {
  const $ = await getHtmlAsCheerioFunction(url);
  const recipeText = $("body").text();
  const textWithoutATonOfWhitespace = recipeText.replace(/\s\s/g, "");
  return textWithoutATonOfWhitespace;
}

async function writeRecipeToFile(url) {
  const recipeText = await extractHTMLBodyAsText(url);
  console.dir({ recipeText }, { depth: null, colors: true });
  const recipeName = getRecipeNameFromURL(url);
  writeToFile(
    JSON.stringify({ url, recipe: recipeText }),
    recipeName + ".json"
  );
}

function findRecipe() {}

app.post("/submit", async (req, res) => {
  const url = req.body.link;

  // TODO: Write this to firebase instead of to file
  // and then we can fuzzy search all those recipes
  await writeRecipeToFile(url);
  res.send(url);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
