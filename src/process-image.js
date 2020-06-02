const Drawable = require("drawable").default;
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const { interpolateColors } = require("./interpolate-colors");

const read = promisify(fs.readFile);

const flip = () => Math.floor(Math.round(Math.random()));

const pixelateImage = async (photo, size = 1080, pixelSize = 60) => {
  const buffer = Buffer.isBuffer(photo)
    ? photo
    : await read(path.resolve(process.cwd(), photo));
  const drawable = new Drawable({
    width: size,
    height: size,
    backgroundColor: "white"
  });
  const image = Drawable.image(buffer, {
    objectFit: "cover"
  });
  await drawable.append(image);
  const { _context: context } = drawable;
  const imageData = context.getImageData(0, 0, size, size);
  const { data } = imageData;

  const halfPixel = pixelSize / 2;

  const numberOfPixels = Math.pow(size / pixelSize, 2);
  const numberOfRows = size / pixelSize;

  // a pixel is represented as
  const rowFN = (i, _size = 1) => size * 4 * _size * i;
  const colFN = (i, _size = 1) => _size * 4 * i;
  let lastColor;
  const rowCols = [];

  context.clearRect(0, 0, size, size);
  context.beginPath();
  context.fillStyle = 'rgb(50,76,47)';
  context.fillRect(0, 0, size, size);
  context.closePath();

  for (let r = 0; r < numberOfRows; r += 1) {
    for (let c = 0; c < numberOfRows; c += 1) {
      const row = rowFN(r, pixelSize);
      const col = colFN(c, pixelSize);
      const startPixel = row + col;
      // this is to take color from center pixel
      const centerOffset = rowFN(halfPixel, 1) + colFN(halfPixel, 1);

      const red = data[startPixel + centerOffset];
      const green = data[startPixel + centerOffset + 1];
      const blue = data[startPixel + centerOffset + 2];
      const rgb = [red, green, blue];
      const interpolatedColors = interpolateColors(
        rgb,
        !lastColor ? rgb : lastColor,
        pixelSize
      ).reverse();
      lastColor = [red, green, blue];
      rowCols.push({
        startPixel,
        interpolatedColors,
        rgb,
        interpolate: false
      });

      // This creates circle pixels
      context.beginPath();
      context.fillStyle = `rgb(${rgb.join(',')})`
      console.log(`rgb(${rgb.join(',')})`)
      context.arc(
        c * pixelSize + halfPixel,
        r * pixelSize + halfPixel,
        halfPixel - 10,
        0,
        2 * Math.PI
      );
      context.fill();
      // console.log(interpolatedColors);

      // For debugging
      data[startPixel] = 255; // red
      data[startPixel + 1] = 0; // green
      data[startPixel + 2] = 0; // blue
    }
  }


  // This does both pixelated image and an interpolated version
  // rowCols.forEach(
  //   ({ startPixel, interpolatedColors, rgb, interpolate }, i, arr) => {
  //     for (let x = 0; x < pixelSize; x += 1) {
  //       for (let y = 0; y < pixelSize; y += 1) {
  //         const _row = rowFN(x, 1);
  //         const _col = colFN(y, 1);
  //         if (interpolate) {
  //           data[startPixel + _row + _col] = interpolatedColors[y][0];
  //           data[startPixel + _row + _col + 1] = interpolatedColors[y][1];
  //           data[startPixel + _row + _col + 2] = interpolatedColors[y][2];
  //         } else {
  //           data[startPixel + _row + _col] = rgb[0];
  //           data[startPixel + _row + _col + 1] = rgb[1];
  //           data[startPixel + _row + _col + 2] = rgb[2];
  //         }
  //       }
  //     }
  //   }
  // );

  // context.putImageData(imageData, 0, 0);
  // console.log("Image pixelated");
  return { buffer: drawable.toBuffer(), context };
};

module.exports = { pixelateImage };
