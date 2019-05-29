#!/usr/bin/env node

const argv = require("yargs").argv;
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const { pixelateImage } = require("./process-image");

const write = promisify(fs.writeFile);
const { _, pixelSize = 80, size = 1080, amount = 1, outFile } = argv;
const file = _[0];

const createArrayN = n => Array.from(new Array(n)).fill(0);

(async function() {
  const imagePath = path.resolve(process.cwd(), file);
  const iterator = createArrayN(amount);
  const image = await iterator.reduce(promise => {
    return promise.then(imgdata =>
      pixelateImage(imgdata, parseFloat(size, 10), parseFloat(pixelSize, 10))
    );
  }, Promise.resolve(imagePath));
  const outPath = path.resolve(
    process.cwd(),
    outFile || `${file.split(".").shift()}_${size}-${pixelSize}.jpg `
  );
  console.log(`Writing ${outPath}`);
  await write(outPath, image, "binary");
})();
