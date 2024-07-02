export function print(...data) {
  document.getElementById("console").innerText += [data].join(" ") + "\n";
}
export function centeredFillRect(x, y, w, h) {
  let ctx = document.getElementById("canvas").getContext("2d");
  x -= w / 2;
  y -= h / 2;
  ctx.fillRect(x, y, w, h);
}
export function centeredStrokeRect(x, y, w, h) {
  let ctx = document.getElementById("canvas").getContext("2d");
  x -= w / 2;
  y -= h / 2;
  ctx.strokeRect(x, y, w, h);
}
export function mergeHex(c1, c2, blend = 0.5) {
  let r1 = parseInt(c1.substring(1, 3), 16);
  let g1 = parseInt(c1.substring(3, 5), 16);
  let b1 = parseInt(c1.substring(5, 7), 16);
  let r2 = parseInt(c2.substring(1, 3), 16);
  let g2 = parseInt(c2.substring(3, 5), 16);
  let b2 = parseInt(c2.substring(5, 7), 16);
  let r3 = Math.floor(r1 * blend + r2 * (1 - blend));
  let g3 = Math.floor(g1 * blend + g2 * (1 - blend));
  let b3 = Math.floor(b1 * blend + b2 * (1 - blend));
  return "#" + r3.toString(16) + g3.toString(16) + b3.toString(16);
}
