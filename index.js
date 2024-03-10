import express from "express";
import fs from "fs";

import bodyParser from "body-parser";
import { getHtmlAsCheerioFunction } from "./biobox.js";
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

function getRecipeName(link) {
  const url = new URL(link);
  const pathname = url.pathname;
  // Split the pathname by '/' and filter out empty strings
  const pathParts = pathname.split("/").filter((part) => part !== "");

  // Get the last part
  const recipeName = pathParts[pathParts.length - 1];

  return recipeName;
}

app.post("/submit", async (req, res) => {
  const link = req.body.link;
  const recipeName = getRecipeName(link);

  const $ = await getHtmlAsCheerioFunction(link);

  const keywords = $("body").text().replace(/\s\s/g, "");

  writeToFile(keywords, recipeName + ".txt");

  console.dir([{ url: link, keywords }], { depth: null, colors: true });
  const fuse = new Fuse([{ url: link, keywords }], {
    keys: ["url", "keywords"],
  });

  const result = fuse.search("aardpeer");
  console.log(result);

  console.log(req.body.link);
  res.send(result);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
