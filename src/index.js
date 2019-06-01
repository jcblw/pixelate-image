#!/usr/bin/env node

const argv = require("yargs").argv;
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const { pixelateImage } = require("./process-image");
const GIFEncoder = require("gifencoder");

const write = promisify(fs.writeFile);
const { _, pixelSize = 80, size = 800, amount = 1, outFile } = argv;
const file = _[0];

const createArrayN = n => Array.from(new Array(n)).fill(0);

(async function() {
  const imagePath = path.resolve(process.cwd(), file);
  const iterator = createArrayN(amount);
  const _pixelSize = parseFloat(pixelSize, 10);
  const _canvasSize = parseFloat(size, 10);
  const gif = new GIFEncoder(_canvasSize, _canvasSize);
  gif.start();
  gif.setRepeat(0);
  gif.setDelay(100); // frame delay in ms
  gif.setQuality(10); // image quality. 10 is default.
  const outPath = path.resolve(
    process.cwd(),
    outFile || `${file.split(".").shift()}_${size}-${pixelSize}.png `
  );
  const outGIFPath = path.resolve(
    process.cwd(),
    outFile || `${file.split(".").shift()}_${size}-${pixelSize}.gif `
  );
  gif.createReadStream().pipe(fs.createWriteStream(outGIFPath));
  const image = await iterator.reduce(promise => {
    return promise.then(({ buffer, context }) => {
      if (context) {
        gif.addFrame(context);
      }
      return pixelateImage(buffer, _canvasSize, _pixelSize);
    });
  }, Promise.resolve({ buffer: imagePath }));

  console.log(`Writing ${outPath}`);
  await write(outPath, image.buffer, "binary");
})();
