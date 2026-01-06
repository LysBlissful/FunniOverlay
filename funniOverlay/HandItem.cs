using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace funniOverlay
{
    internal class HandItem
    {
        public Rectangle TextureBox { get; set; }
        public List<Rectangle> HitBox { get; set; }
        public int Weight { get; set; }
        public int DamageMod { get; set; }
        public bool IsWeapon { get; set; }
        public Point OriginPosition { get; set; }
        public Point ActualPostion { get; private set; }
        public int Angle { get; set; }
        public bool IsAttacking { get; set; }
        public int CharSize {  get; set; }

        private Point Target;
        private int TetherDistance;
        private Rectangle TriggerBox = new Rectangle();
        private int Momentum = 0;
        private int Speed = 0;
        private bool IsLeft = false;
        private bool SwingCD = false;
        public HandItem()
        {
            TextureBox = new Rectangle();
            HitBox = new List<Rectangle>();
            Weight = 0;
            DamageMod = 0;
            OriginPosition = new Point();
            IsWeapon = false;
            IsAttacking = false;
            Angle = 0;
            TriggerBox.X = OriginPosition.X;
            TriggerBox.Y = OriginPosition.Y;
            TriggerBox.Height = 0;
            TetherDistance = 0;
        }
        public HandItem(Rectangle handItemTextureBox, int size, int weight, int damageMod, bool isWeapon, Point pos)
        {
            TextureBox = handItemTextureBox;
            Weight = weight;
            DamageMod = damageMod;
            IsWeapon = isWeapon;
            CharSize = size;
            OriginPosition = new Point(pos.X + (CharSize/2), pos.Y + (CharSize/2));
            IsAttacking = false;
            Angle = 0;
            TriggerBox.X = OriginPosition.X;
            TriggerBox.Y = OriginPosition.Y;
            TriggerBox.Height = CharSize * 2;

            TetherDistance = Convert.ToInt32(CharSize * .6666);
        }
        public void UpdateActivity(bool isAttacking, Point targetPosition)
        {
            IsAttacking = isAttacking;
            Target = targetPosition;
            Tick();
        }
        private void Tick()
        {
            if(IsLeft != Target.X < OriginPosition.X)
            {
                IsLeft = Target.X < OriginPosition.X;
                Speed = 0;
                if(IsWeapon) SwingCD = true;
            }
            
            Speed += Momentum;
            TetherDistance = Convert.ToInt32(CharSize * .6666);
            TriggerBox.X = !IsLeft ? OriginPosition.X : OriginPosition.X - (CharSize * 2);
            TriggerBox.Width = CharSize * 2;
            TriggerBox.Height = CharSize * 2;

            if(Speed > 40)
            {
                Speed = 40;
            }
            if (!SwingCD) {
                if (IsAttacking && IsWeapon)
                {
                    if (TriggerBox.Contains(Target))
                    {
                        if (IsLeft)
                        {
                            Angle -= Speed;
                            if (Angle <= 0) Angle = 360;
                        }
                        if (!IsLeft)
                        {
                            Angle += Speed;
                            if (Angle >= 361) Angle = 0;
                        }
                    }
                    else
                    {
                        if (Angle > 180 && Angle != 0) Angle += Speed;
                        if (Angle < 180 && Angle != 0) Angle -= Speed;
                        if (Angle >= 360 || Angle <= 0) Angle = 0;
                    }
                }
                else if (IsAttacking && !IsWeapon)
                {
                    if (IsLeft)
                    {

                    }
                }
                else if (!IsAttacking && IsWeapon)
                {

                }
                else if (!IsAttacking && !IsWeapon)
                {

                }
            }
            else
            {
                if(Angle >= 180 && Angle !=0)
                {
                    Angle -= Speed;
                    if (Angle <= 0)
                    {
                        Angle = 0;
                    }
                }
                else if(Angle != 0)
                {
                    Angle += Speed;
                    if(Angle >= 360)
                    {
                        Angle = 0;
                    }
                }
                else
                {
                    SwingCD = false;
                }
            }
        }
    }
}
