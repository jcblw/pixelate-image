const interpolateColor = (color1, color2, factor) => {
  if (arguments.length < 3) {
    factor = 0.5;
  }
  var result = color1.slice();
  for (var i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return result;
};

// My function to interpolate between two colors completely, returning an array
const interpolateColors = (color1, color2, steps) => {
  let stepFactor = 1 / (steps - 1);
  const interpolatedColorArray = [];

  for (var i = 0; i < steps; i++) {
    interpolatedColorArray.push(
      interpolateColor(color1, color2, stepFactor * i)
    );
  }

  return interpolatedColorArray;
};

module.exports = { interpolateColors };
