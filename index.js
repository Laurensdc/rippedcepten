import express from "express";
import fs from "fs";

import bodyParser from "body-parser";
import { readFilesAndMergeThem, writeRecipeToFile } from "./files.js";
import path from "path";
import Fuse from "fuse.js";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  res.render("./index", { recipe: undefined });
});

function fuzzySearch(json, searchTerm) {
  const fuse = new Fuse(json, {
    keys: ["url", "recipe"],

    // Search the whole string, not just first 60 characters
    // finding a match closer to the start of the string doesn't make it more relevant
    ignoreLocation: true,
    // Short and long fields are treated equally
    ignoreFieldNorm: true,

    includeScore: true,
  });

  const result = fuse.search(searchTerm);

  return result;
}

app.get("/login", async (req, res) => {
  res.render("./login");
});

app.post("/search", async (req, res) => {
  const searchTerm = req.body.keyword;
  const ultimateJson = readFilesAndMergeThem();

  const result = fuzzySearch(ultimateJson, searchTerm);

  console.dir(result, { depth: null, colors: true });

  const urls = result.map((r) => r.item.url);
  res.send(urls);
});

app.post("/submit", async (req, res) => {
  const url = req.body.url;

  // TODO: Write this to firebase instead of to file
  // and then we can fuzzy search all those recipes
  await writeRecipeToFile(url);
  res.send(url);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
