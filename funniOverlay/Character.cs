using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
namespace funniOverlay
{
    internal class Character
    {
        private int RandomMode { get; set; }
        private Rectangle[] Hitboxes { get; set; }
        private int AITimer { get; set; }

        public Color ShellColor { get; set; }
        public Rectangle Body { get; set; }
        public Rectangle HeadGear { get; set; }
        public Rectangle Clothing { get; set; }
        public Rectangle Nose { get; set; }
        public Rectangle Eyes {  get; set; }
        public Rectangle Mouth { get; set; }
        public Rectangle Shell {  get; set; }
        public Point Position { get; set; }
        public int Size {  get; set; }
        
        public int HP { get; private set; }
        public int ActionSpeed {  get; set; }
        public string AI {  get; set; }

        public Character(int size)
        {
            Size = size;
            Position = new Point(new Random().Next(0, 1920), new Random().Next(0, 500));
            HP = 0;
            ActionSpeed = 0;
            AI = "lolsorandom";
            RandomMode = 0;
            Body = new Rectangle(new Random().Next(0, 1800), Size, Size, Size);
            HeadGear = new Rectangle(0, 0 , Size, Size);
            Clothing = new Rectangle(0, 0, Size, Size);
            Nose = new Rectangle(0, 0, Size, Size);
            Eyes = new Rectangle(0, 0 , Size, Size);
            Mouth = new Rectangle(0, 0, Size, Size);
            Shell = new Rectangle(0, 0, Size, Size);
            ShellColor = new Color(255, 255, 255);
        }
        public Character(Rectangle body, Rectangle headGear, Rectangle clothing, Rectangle nose, Rectangle eyes, Rectangle mouth, Rectangle shell, Point position, int hP, int actionSpeed, int size)
        {
            Body = body;
            HeadGear = headGear;
            Clothing = clothing;
            Nose = nose;
            Eyes = eyes;
            Mouth = mouth;
            Shell = shell;
            Position = position;
            HP = hP;
            ActionSpeed = actionSpeed;
            Size = size;
            RandomMode = 0;

            //usable code, hitboxoffsettop is the step to take to make egg shaped 7 part hitbox from the top, bottom is its bottom counterpart. use hitboxoffsettop x for distance from top
            //and hitboxoffsettop y for distance from bottom
            /*Point HitboxOffsetTop = new Point(Convert.ToInt32(.06 * Size), Convert.ToInt32(.07 * Size));
            Point HitboxOffsetBottom = new Point(Convert.ToInt32(.06 * Size), Convert.ToInt32(.04 * Size));
            Point MaximumBounds = new Point(Convert.ToInt32(Size * .9), Convert.ToInt32(Size * .75));*/
            
        }
        public void LifeTick()
        {
            AITimer++;
            PathFinding();
        }
        private void PathFinding()
        {
            switch (AI)
            {
                case "incoherentscreeching": IncoherentScreeching();
                    break;
                case "bitchmode": BitchMode();
                    break;
                case "duelist": Duelist();
                    break;
                case "lolsorandom":
                    if (AITimer > 600 || RandomMode == 0)
                    {
                        AITimer = 0;
                        RandomMode = new Random().Next(3) + 1;
                    }
                    switch (RandomMode)
                    {
                        case 1: IncoherentScreeching(); break;
                        case 2: BitchMode(); break;
                        case 3: Duelist(); break;
                    }
                    break;
            }


            
            void IncoherentScreeching()
            {

            }
            void BitchMode() 
            {
                
            }
            void Duelist()
            {

            }
        }
        private void Damage()
        {

        }
    }
}
