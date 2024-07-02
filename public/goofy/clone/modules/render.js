import {
  mergeHex,
  print,
  centeredFillRect,
  centeredStrokeRect,
} from "./util.js";
import { global } from "../global.js";

export function renderEntity(e, x, y, tur = false) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  
  let size = e.body.size || 50;
  let color = e.body.color || global.blue;
  
  if (tur) {
    size *= tur.s;
  }
  
  x = x || e.body.x;
  y = y || e.body.y;
  
  if (e.body.color[0] === "_") {
    color = global[e.body.color.substring(1)];
  }
  
  ctx.lineWidth = global.borderWidth;
  
  if (e.guns) {
    e.guns.forEach(gun => {
      let gunColor = gun.attributes.color || global.gunColor;
      ctx.fillStyle = gunColor;
      ctx.strokeStyle = mergeHex(gunColor, global.borderColor, 1 - global.borderSharpness);
      centeredFillRect(x + (gun.position.length + gun.position.x) * size, y + gun.position.y * size, size * 2 * gun.position.length, size * 2 * gun.position.width);
      centeredStrokeRect(x + (gun.position.length + gun.position.x) * size, y + gun.position.y * size, size * 2 * gun.position.length, size * 2 * gun.position.width);
    });
  }
  
  ctx.fillStyle = color;
  ctx.strokeStyle = mergeHex(color, global.borderColor, 1 - global.borderSharpness);
  
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  if (e.turrets) {
    e.turrets.forEach(turret => {
      let turretColor = turret.attributes.color || global.gunColor;
      
      renderEntity(turret.turret, x + size * turret.position.x, y + size * turret.position.y, {s: turret.position.size});
    });
  }
}