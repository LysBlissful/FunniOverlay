using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using System.Collections.Generic;

namespace Evolution;

/// <summary>
/// An entity which exists in the world. Any object which can be rendered.
/// </summary>
class Entity
{
    /// <summary>The position of the entity in the world.</summary>
    public Point Position
    {
        get {
            return this.position;
        }

        set {
            this.position = value;
            HitBox.Location = value;
        }
    }
    private Point position;

    /// <summary>The hitbox of the entity.</summary>
    public Rectangle HitBox;

    /// <summary>A color to use to filter the entity.</summary>
    public Color ColorFilter;

    /// <summary>The texture to use to display the entity.</summary>
    public Texture2D Texture;

    /// <summary>Lifetime before the entity removes itself</summary>
    public Int32 Lifetime;

    /// <summary>Create a new <see cref="Entity">Entity</cref>.</summary>
    /// <param name="pos">The position of the entity.</param>
    /// <param name="hitbox">The hitbox of the entity.</param>
    /// <param name="color">The color filter to use for the entity.</param>
    /// <param name="texture">The texture to use for the entity.</param>
    public Entity(Point pos, Rectangle hitbox, Color color, Texture2D texture, Int32 lifetime)
    {
        HitBox = hitbox;
        Position = pos;
        ColorFilter = color;
        Texture = texture;
        Lifetime = lifetime;
    }
    public Entity()
    {
        HitBox = new Rectangle();
        Position = new Point();
        ColorFilter = Color.White;
    }
    //called every tick of gametime
    public void LifeTick()
    {
        Lifetime--;
        position.X += new Random().Next(-10, 10);
        position.Y += new Random().Next(-10, 10);
        HitBox.Location = position;
    }
}
