import AnimationManager from "./animationManager.js";
import Timer from "./timer.js";
const canvas = document.querySelector("canvas");
canvas.height = 112;
canvas.width = 112;
const ctx = canvas.getContext("2d");

const body = new Image();
body.src = "../img/spriteSheets/body.png";
const timer = new Timer(1000 / 60);
timer.tick.add(draw)

const cosmetics = new Map([
   ["clothing", [
      "bronzeBreastplate",
      "kimono",
      "monkRobes",
      "theMightyBowl"
   ]],
   ["eyeShape", [
      "angyEyes",
      "coolGlasses",
      "sadgeEyes"
   ]],
   ["headwear", [
      "demonHorns",
      "karateHeadband",
      "off-colorFlamingo",
      "vikingHelmet",
      "unwashedSonicHair",
   ]],
   ["mouthShape", [
      "canadian",
      "dColon",
      "lookAtThisGuySmile",
      "oMouth",
      "shitEatingGrin",
      "threeSmile",
      "toothySmirk"
   ]],
   ["noseShape", [
      "cthulu",
      "downturnedPointyNose",
      "gobbinNose",
      "pointyNose",
      "ratNose",
      "roundNose",
      "skullNose",
      "stubbyBeak",
      "thiccNose",
      "upturnedNose",
      "wideNose",
      "widePointyNose"
   ]]
]);


const parts = new Map([
   ["clothing", new AnimationManager("../img/spriteSheets/clothing.png", 4, 1)],
   ["eyeShape", new AnimationManager("../img/spriteSheets/eyeShapes.png", 4, 1)],
   ["headwear", new AnimationManager("../img/spriteSheets/headwear.png", 4, 2)],
   ["mouthShape", new AnimationManager("../img/spriteSheets/mouthShapes.png", 4, 2)],
   ["noseShape", new AnimationManager("../img/spriteSheets/noseShapes.png", 4, 3)],
   ["shellColor", new AnimationManager("../img/spriteSheets/shellColor.png", 4, 4)] 
]);
const shellColor =  new AnimationManager("../img/spriteSheets/shellColor.png", 4, 4);
shellColor.createAnimation("0", 1, 0, 0);
shellColor.play("0");
const character = new Map([
   ["body", body],
   ["clothing", null],
   ["eyeShape", null],
   ["headwear", null],
   ["mouthShape", null],
   ["noseShape", null]
]);

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
const color = document.querySelector("input[type='color']");

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

timer.start();