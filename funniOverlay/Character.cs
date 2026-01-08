using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
namespace funniOverlay
{
    internal class Character
    {
        private int RandomMode { get; set; }
        private Rectangle[] Hitboxes { get; set; }
        private int AITimer { get; set; }
        private int IdleClock { get; set; }
        
        private int OriginalY = 0;


        public Color ShellColor { get; set; }
        public Vector2 DirectionMod { get; set; }
        public Rectangle Body { get; set; }
        public Rectangle HeadGear { get; set; }
        public Rectangle Clothing { get; set; }
        public Rectangle Nose { get; set; }
        public Rectangle Eyes {  get; set; }
        public Rectangle Mouth { get; set; }
        public Rectangle Shell {  get; set; }


        public Point Position { get; set; }
        public int Size {  get; set; }
        public float TextureAngle { get; private set; }
        public int HP { get; private set; }
        public int Screenwidth { private get; set; }
        public int ActionSpeed {  get; set; }
        public string AI {  get; set; }

        public Character(int size)
        {
            Size = size;
            Position = new Point(new Random().Next(0, 1920), new Random().Next(0, 1080));
            HP = 0;
            ActionSpeed = 0;
            AI = "lolsorandom";
            RandomMode = 0;
            Body = new Rectangle(Position.X, Position.Y, Size, Size);
            OriginalY = Position.Y;
            HeadGear = new Rectangle(0, 0 , Size, Size);
            Clothing = new Rectangle(0, 0, Size, Size);
            Nose = new Rectangle(0, 0, Size, Size);
            Eyes = new Rectangle(0, 0 , Size, Size);
            Mouth = new Rectangle(0, 0, Size, Size);
            Shell = new Rectangle(0, 0, Size, Size);
            ShellColor = new Color(255, 255, 255);
            IdleClock = 0;
            Screenwidth = 1920;
            DirectionMod = new Vector2(1,1);
        }
        public Character(Rectangle body, Rectangle headGear, Rectangle clothing, Rectangle nose, Rectangle eyes, Rectangle mouth, Rectangle shell, Point position, int hP, int actionSpeed, int size, int screenwidth)
        {
            Body = body;
            HeadGear = headGear;
            Clothing = clothing;
            Nose = nose;
            Eyes = eyes;
            Mouth = mouth;
            Shell = shell;
            Position = position;
            OriginalY = Position.Y;
            HP = hP;
            ActionSpeed = actionSpeed;
            Size = size;
            RandomMode = 0;
            IdleClock = 0;
            Screenwidth = screenwidth;
            DirectionMod = new Vector2(1, 1);
            //usable code, hitboxoffsettop is the step to take to make egg shaped 7 part hitbox from the top, bottom is its bottom counterpart. use hitboxoffsettop x for distance from top
            //and hitboxoffsettop y for distance from bottom
            /*Point HitboxOffsetTop = new Point(Convert.ToInt32(.06 * Size), Convert.ToInt32(.07 * Size));
            Point HitboxOffsetBottom = new Point(Convert.ToInt32(.06 * Size), Convert.ToInt32(.04 * Size));
            Point MaximumBounds = new Point(Convert.ToInt32(Size * .9), Convert.ToInt32(Size * .75));*/

        }
        //used out of combat
        public void Idle()
        {
            Random rnd = new Random();
            Body = new Rectangle(Position.X, Position.Y, Body.Width, Body.Height);
            if (IdleClock < 300)
            {
                IdleClock++;
                WeebleWobble();
            }
            else if (IdleClock < 1200)
            {
                if (rnd.Next(0, 600) > 598)
                {
                    IdleClock = 1200;
                }
                else IdleClock++;
                WeebleWobble();
            }
            if(IdleClock >= 1200)
            {
                
                if(IdleClock == 1200)
                {
                    TextureAngle = 0;
                    DirectionMod = new Vector2(rnd.Next(0, 2), rnd.Next(-2,3));
                    if (DirectionMod.X == 0) DirectionMod = new Vector2(-1, DirectionMod.Y);
                }
                IdleClock++;
                Position = new Point(Position.X + (int)(2 * DirectionMod.X), Position.Y + (int)(5 * Math.Sin(IdleClock) + DirectionMod.Y));
                Body = new Rectangle(Position.X, Position.Y, Body.Width, Body.Height);
                if (IdleClock >= 1300 + rnd.Next(0, 700)) IdleClock = 0;
            }
        }
        private void WeebleWobble()
        {
            if (IdleClock % 6 == 0)
            {
                TextureAngle = (float)Math.Sin(IdleClock / 6)/2;
                //Position = new Point(Position.X, (int)(99 * Math.Sin(TextureAngle / 2) - (Math.Abs(16 * Math.Sin(TextureAngle)))) * DirectionMod + OriginalY);
                //Body = new Rectangle(Position.X, Position.Y, Body.Width, Body.Height);
            }
           
        }
        //used in combat
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
