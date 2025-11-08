import AnimationManager from "./modules/animationManager.js";
import Timer from "./modules/timer.js";

const canvas = document.querySelector("canvas");
canvas.height = 112;
canvas.width = 112;
const ctx = canvas.getContext("2d");

const body = new Image();
body.src = "../img/spriteSheets/body.png";
const timer = new Timer(1000 / 60);

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

/** @type {Map<string, ImageBitmap|HTMLElement>} */
const character = new Map([
   ["body", body],
   ["clothing", null],
   ["eyeShape", null],
   ["headwear", null],
   ["mouthShape", null],
   ["noseShape", null]
]);


const color = document.querySelector("input[type='color']");

export {canvas, color, ctx, body, timer, cosmetics, parts, shellColor, character};