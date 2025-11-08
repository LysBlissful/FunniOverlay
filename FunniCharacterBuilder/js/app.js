import AnimationManager from "./modules/animationManager.js";
import Timer from "./modules/timer.js";
import {parts, canvas, character, color, cosmetics, ctx, shellColor, timer, } from "./constants.js";

timer.tick.add(draw)

createParts("clothing");
createParts("eyeShape");
createParts("headwear");
createParts("mouthShape");
createParts("noseShape");

function createParts(category,) {
   for (let i = 0; i < cosmetics.get(category).length; i++) {
      parts.get(category).createAnimation(i.toString(), 1, i, i);
      console.log(category);
   }
}

parts.forEach((a, k) => {
   a.frameChange.add(() => {
      character.set(k, a.sprite);
   })
})

document.querySelectorAll(".input-group.mb-3").forEach(input => {
   const sel = input.querySelector("select");
   if (sel == null)
      return;
   const buttons = input.querySelectorAll("button");
   buttons.forEach(b => {
      b.addEventListener("click", () => {
         sel.selectedIndex = 0;
         character.set(input.id, null);
      });
   });
   Array.from(parts.get(input.id).animations.keys()).forEach((v) => {
      const option = document.createElement("option");
      option.value = v;
      option.text = cosmetics.get(input.id)[Number(v)];
      sel.append(option);
   });
   sel.addEventListener("change", () => {
      const part = parts.get(input.id);
      if (part !== undefined && part.animations.has(sel.value))
         part.play(sel.value);
      else
         character.set(input.id, null);
   })
});

function setLabelsWidth() {
   /** @type {NodeListOf<HTMLLabelElement>} */
   const labels = document.querySelectorAll("#app .input-group-text");
   let maxWidth = 0;

   // Measure all label widths
   labels.forEach(label => {
      const width = label.offsetWidth;
      if (width > maxWidth) maxWidth = width;
   });

   // Apply the max width to all labels
   labels.forEach(label => {
      label.style.width = `${maxWidth}px`;
   });
}

function draw() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);

   if (shellColor.sprite != null) {
      ctx.drawImage(shellColor.sprite, 0, 0);
   }

   // Set global blend mode to colorize
   ctx.globalCompositeOperation = 'source-atop';
   
   // Fill with the tint color
   ctx.fillStyle = color.value;
   ctx.fillRect(0, 0, canvas.width, canvas.height);

   // Reset blend mode to default
   ctx.globalCompositeOperation = 'source-over';

   character.forEach((p, i) => {
      if(p !== null)
         ctx.drawImage(p, 0, 0);
   })
}
setLabelsWidth();
timer.start();