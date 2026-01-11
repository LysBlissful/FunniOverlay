using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Evolution;
using Newtonsoft.Json.Linq;
using System.Security.Cryptography;
using Microsoft.VisualBasic;

namespace funniOverlay
{
    public class Game1 : Game
    {   
        //constants for URLS and hardcoded IDs used throughout the code
        const string UserAPIUrl = "http://localhost:8911/api/v2/users/active";
        const string CommandAPIUrl = "https://localhost:24756/funni/getBag";
        const string AutoShoutOutListAPIUrl = "https://localhost:24756/funni/getASOList";
        const string MessageAPIUrl = "http://localhost:8911/api/v2/chat/message";
        const string GenericInventoryAPIUrl = "http://localhost:8911/api/v2/inventory/";
        const string ActionInventoryID = "208f774c-de7e-48d1-a7fe-d54a7f5c9c73";
        const string UserInventoryCalls = GenericInventoryAPIUrl + ActionInventoryID + "/";
        const string AllSaveLocation = "C:\\Users\\Slipk\\Games\\FunniOverlay\\";
        const string AutoShoutOutListLocation = AllSaveLocation + "AutoShoutoutList.txt";
        const int CosmTextureBounds = 112;


        readonly string[] APICommands =
        {
            "changecolor",
            "equipitem",
            "say",
            "equipcosmetic",
            "showcharacter",
            "addcosmetic"
        };
        readonly Dictionary<string, Point> CosmNose = new Dictionary<string, Point>
        {
            { "widepointynose", new Point(CosmTextureBounds * 3, CosmTextureBounds * 2)},
            { "widenose", new Point(CosmTextureBounds * 2, CosmTextureBounds * 2) },
            { "upturnednose", new Point(CosmTextureBounds, CosmTextureBounds * 2) },
            { "thiccnose", new Point(0, CosmTextureBounds * 2) },
            { "stubbybeak", new Point(CosmTextureBounds * 3, CosmTextureBounds) },
            { "skullnose", new Point(CosmTextureBounds * 2, CosmTextureBounds) },
            { "roundnose", new Point(CosmTextureBounds, CosmTextureBounds) },
            { "ratnose", new Point(0, CosmTextureBounds) },
            { "pointynose", new Point(CosmTextureBounds * 3, 0) },
            { "gobbinnose", new Point(CosmTextureBounds * 2, 0) },
            { "downturnedpointynose", new Point(CosmTextureBounds, 0) },
            { "cthulu", new Point(0,0) }
        };
        readonly Dictionary<string, Point> CosmHat = new Dictionary<string, Point>
        {
            { "vikinghelmet", new Point(0, CosmTextureBounds) },
            { "unwashedsonichair", new Point(CosmTextureBounds * 3, 0) },
            { "offcolorflamingo", new Point(CosmTextureBounds * 2, 0) },
            { "karateheadband", new Point(CosmTextureBounds, 0) },
            { "demonhorns", new Point(0, 0) }
        };
        readonly Dictionary<string, Point> CosmBody = new Dictionary<string, Point>
        {
            { "themightybowl", new Point(CosmTextureBounds * 3, 0) },
            { "monkrobes", new Point(CosmTextureBounds * 2, 0) },
            { "kimono", new Point(CosmTextureBounds, 0) },
            { "bronzebreastplate", new Point(0, 0) }
        };
        readonly Dictionary<string, Point> CosmEyes = new Dictionary<string, Point>
        {
            { "sadgeeyes", new Point(CosmTextureBounds * 2, 0) },
            { "coolglasses", new Point(CosmTextureBounds, 0) },
            { "angyeyes", new Point(0, 0) }
        };
        readonly Dictionary<string, Point> CosmMouth = new Dictionary<string, Point>
        {
            { "toothysmirk", new Point(CosmTextureBounds * 2, CosmTextureBounds) },
            { "threesmile", new Point(CosmTextureBounds, CosmTextureBounds) },
            { "shiteatinggrin", new Point(0, CosmTextureBounds) },
            { "omouth", new Point(CosmTextureBounds * 3, 0) },
            { "lookatthisguysmile", new Point(CosmTextureBounds * 2, 0) },
            { "dcolon", new Point(CosmTextureBounds, 0) },
            { "canadian", new Point(0, 0) }
        };

        readonly Dictionary<string, Point> PremCosmBody = new Dictionary<string, Point>
        {
            { "testcosmetic", new Point(0, 0) },
            {"lizard-0", new Point(CosmTextureBounds, 0) },
            {"lizard-1", new Point(CosmTextureBounds * 2, 0)},
            {"weddingdress", new Point(CosmTextureBounds * 3, 0)}
        };
        readonly Dictionary<string, Point> PremCosmHat = new Dictionary<string, Point>
        {
            {"weddingveil", new Point(0,0) }
        };

        readonly Dictionary<string, int> AnimationFrameTimes = new Dictionary<string, int>
        {
            { "lizard", 20}
        };

        readonly string[] EquipPet =
        {
            "blahaj",
            "explodingfox",
            "minime",
            "anomalocaris"
        };
        readonly string[] EquipWeapon =
        {
            "shotgungauntlets",
            "literallyjustasword",
            "themightierpencil",
            "thehibachomagicmace"
        };
        readonly string[] EquipShield =
        {
            "genericassmagiccircle",
            "puppycolabottlecap",
            "literallyjustashield",
            "landmineducttapedtometalsheet"
        };
        readonly string[] EquipNavigator =
        {
            "incoherentscreeching",
            "duelist",
            "bitchmode",
            "lolsorandom"
        };
        readonly string[] EquipVehicle =
        {
            "truckkun",
            "robotspiderlegs",
            "skates",
            "pogostick"

        };
        //gluttony 25% less hp, sloth lowers action speed by 10%, lust 25% less damage, wrath increases pet cooldown by 25%
        readonly string[] EquipCurse =
        {
            "gluttony",
            "sloth",
            "lust",
            "wrath"
        };
        //charity 25% more hp, diligence increases action speed by 10%, chastity 25% more damage, patience lowers pet cooldown by 25%
        readonly string[] EquipBlessing =
        {
            "charity",
            "diligence",
            "chastity",
            "patience"
        };

        private GraphicsDeviceManager _graphics;
        private SpriteBatch _spriteBatch;
        HttpClient http = new();
        ConcurrentBag<string> actionsToPerform = new();
        List<Entity> Spawns = new();
        Texture2D Clothing; Texture2D Eyes; Texture2D Headwear; Texture2D Mouths; Texture2D Noses; Texture2D Shells; Texture2D BodyOutline; Texture2D Placeholder; Texture2D PremClothing; Texture2D PremHeadwear;
        Dictionary<string, Character> ActiveCharacters = new Dictionary<string, Character>();
        //possible states will be: Idle, Fighting, Dungeon
        String State = "Idle";
        List<Rectangle> PlayAreas;


        Int32 timer = 0;
        public Game1()
        {
            _graphics = new GraphicsDeviceManager(this);
            Content.RootDirectory = "Content";
            IsMouseVisible = true;
        }

        protected override void Initialize()
        {
            // TODO: Add your initialization logic here
            //ChatterInput();
            base.Initialize();
        }

        protected override void LoadContent()
        {
            _spriteBatch = new SpriteBatch(GraphicsDevice);

            Clothing = this.Content.Load<Texture2D>("spriteSheets/clothing");
            PremClothing = this.Content.Load<Texture2D>("spriteSheets/PremiumClothing");
            PremHeadwear = this.Content.Load<Texture2D>("spriteSheets/PremiumHeadwear");
            Headwear = this.Content.Load<Texture2D>("spriteSheets/headwear");
            Mouths = this.Content.Load<Texture2D>("spriteSheets/mouthShapes");
            Noses = this.Content.Load<Texture2D>("spriteSheets/noseShapes");
            Shells = this.Content.Load<Texture2D>("spriteSheets/0whiteSkin");
            Eyes = this.Content.Load<Texture2D>("spriteSheets/eyeShapes");
            BodyOutline = this.Content.Load<Texture2D>("spriteSheets/body");
            Placeholder = this.Content.Load<Texture2D>("spriteSheets/placeholder square");
            CheckAndSetSettings();
            _graphics.PreferredBackBufferWidth = GraphicsDevice.DisplayMode.Width;
            _graphics.PreferredBackBufferHeight = GraphicsDevice.DisplayMode.Height - 50;
            _graphics.ApplyChanges();
        }

        protected override void Update(GameTime gameTime)
        {
            Point coords = new();
            Random rnd = new Random();
            double ratio = 0;
            int randomholder = 0;
            int RelativePlayAreaPosition = 0;
            bool isInsidePlayArea = false;


            if (GamePad.GetState(PlayerIndex.One).Buttons.Back == ButtonState.Pressed || Keyboard.GetState().IsKeyDown(Keys.Escape))
                Exit();
            if (timer == 60)
            {
                timer = 0;
                ChatterInput();
            }
            else timer++;
            
            if (!actionsToPerform.IsEmpty)
            {
                    foreach (string act in actionsToPerform)
                    {
                        coords = new Point(new Random().Next(0, 1800), 200);
                        Spawns.Add(new Entity(coords, new Rectangle(coords, new Point(112, 112)), new Color(255,255,255), this.Content.Load<Texture2D>("lysinaboxemote"), 600));
                    }
                actionsToPerform.Clear();
            }
            for (int i = 0; i < Spawns.Count();i++)
            {
                Spawns[i].LifeTick();
                if (Spawns[i].Lifetime == 0) {
                    Spawns.Remove(Spawns[i]);
                }
            }
            if(State == "Idle")
            {
                foreach(Character spawn in ActiveCharacters.Values)
                {
                    isInsidePlayArea = false;
                    spawn.Idle();

                    if(spawn.AnimatedBody == true)
                    {
                        RunAnimationsForEggs(spawn);
                    }

                    foreach (Rectangle playarea in PlayAreas)
                    {
                        if(BoundaryCheck(spawn, playarea))
                        {
                            isInsidePlayArea = true;
                        }
                    }
                    if (isInsidePlayArea == false)
                    {
                        randomholder = rnd.Next(0, PlayAreas.Count());
                        spawn.Position = new Point(rnd.Next(PlayAreas[randomholder].Left, PlayAreas[randomholder].Right - CosmTextureBounds), rnd.Next(PlayAreas[randomholder].Top, PlayAreas[randomholder].Bottom - CosmTextureBounds));
                    }
                }
            }
            
            base.Update(gameTime);
        }

        protected override void Draw(GameTime gameTime)
        {
            GraphicsDevice.Clear(new Color(37, 90, 64));

            // TODO: Add your drawing code here
            _spriteBatch.Begin(SpriteSortMode.Deferred);

            /*foreach(Rectangle playarea in PlayAreas)
            {
                _spriteBatch.Draw(Placeholder, playarea, Color.White);
            }*/

            foreach(Character spawn in ActiveCharacters.Values)
            {
                
                _spriteBatch.Draw(Shells, spawn.Body, spawn.Shell, spawn.ShellColor, spawn.TextureAngle, new Vector2(CosmTextureBounds / 2, CosmTextureBounds), spawn.DirectionMod.X == 1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally, 0);
                _spriteBatch.Draw(BodyOutline, spawn.Body, spawn.Shell, new Color(255, 255, 255), spawn.TextureAngle, new Vector2(CosmTextureBounds / 2, CosmTextureBounds), spawn.DirectionMod.X == 1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally, 0);
                
                _spriteBatch.Draw(Eyes, spawn.Body, spawn.Eyes, new Color(255, 255, 255), spawn.TextureAngle, new Vector2(CosmTextureBounds / 2, CosmTextureBounds), spawn.DirectionMod.X == 1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally, 0);
                _spriteBatch.Draw(Mouths, spawn.Body, spawn.Mouth, new Color(255, 255, 255), spawn.TextureAngle, new Vector2(CosmTextureBounds / 2, CosmTextureBounds), spawn.DirectionMod.X == 1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally, 0);
                _spriteBatch.Draw(Noses, spawn.Body, spawn.Nose, new Color(255, 255, 255), spawn.TextureAngle, new Vector2(CosmTextureBounds / 2, CosmTextureBounds), spawn.DirectionMod.X == 1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally, 0);

                _spriteBatch.Draw(spawn.PremiumHeadwear ? PremHeadwear : Headwear, spawn.Body, spawn.HeadGear, new Color(255, 255, 255), spawn.TextureAngle, new Vector2(CosmTextureBounds / 2, CosmTextureBounds), spawn.DirectionMod.X == 1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally, 0);
                _spriteBatch.Draw(spawn.PremiumBody ? PremClothing : Clothing, spawn.Body, spawn.Clothing, new Color(255, 255, 255), spawn.TextureAngle, new Vector2(CosmTextureBounds / 2, CosmTextureBounds), spawn.DirectionMod.X == 1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally, 0);
            }   


            _spriteBatch.End();
            base.Draw(gameTime);
            
        }

        private bool BoundaryCheck(Character Egg, Rectangle Boundary)
        {
            bool isInside = false;
            Rectangle CorrectedBody = new Rectangle(Egg.Body.X - (CosmTextureBounds / 2), Egg.Body.Y - CosmTextureBounds, Egg.Body.Width, Egg.Body.Height);
            int randomholder = 0;
            Random rnd = new Random();
            int RelativePlayAreaPosition = 0;
            double ratio = 0;
            if (Boundary.Intersects(CorrectedBody))
            {
                isInside = true;
                if (!Boundary.Contains(CorrectedBody))
                {
                    //higher than allowed play area
                    if (CorrectedBody.Top < Boundary.Top)
                    {
                        Egg.Position = new Point(Egg.Position.X, Egg.Position.Y + (Boundary.Height) - CosmTextureBounds);
                    }
                    //lower than allowed play area
                    if (CorrectedBody.Bottom > Boundary.Bottom)
                    {
                        Egg.Position = new Point(Egg.Position.X, Egg.Position.Y - (Boundary.Height) + CosmTextureBounds);
                    }
                    //left of play area
                    if (CorrectedBody.Left < Boundary.Left)
                    {
                        randomholder = rnd.Next(0, PlayAreas.Count());
                        RelativePlayAreaPosition = Egg.Position.Y - Boundary.Top;
                        ratio = (PlayAreas[randomholder].Height > Boundary.Height ? PlayAreas[randomholder].Height / Boundary.Height : Boundary.Height / PlayAreas[randomholder].Height);
                        Egg.Position = new Point(PlayAreas[randomholder].Right - CosmTextureBounds, (PlayAreas[randomholder].Height > Boundary.Height ? (int)(ratio * RelativePlayAreaPosition + PlayAreas[randomholder].Top) : (int)(RelativePlayAreaPosition / ratio + PlayAreas[randomholder].Top)));
                    }
                    //right of play area
                    if (CorrectedBody.Right > Boundary.Right)
                    {
                        randomholder = rnd.Next(0, PlayAreas.Count());
                        RelativePlayAreaPosition = Egg.Position.Y - Boundary.Top;
                        ratio = (PlayAreas[randomholder].Height > Boundary.Height ? PlayAreas[randomholder].Height / Boundary.Height : Boundary.Height / PlayAreas[randomholder].Height);
                        Egg.Position = new Point(PlayAreas[randomholder].Left + CosmTextureBounds, (PlayAreas[randomholder].Height > Boundary.Height ? (int)(ratio * RelativePlayAreaPosition + PlayAreas[randomholder].Top) : (int)(RelativePlayAreaPosition / ratio + PlayAreas[randomholder].Top)));
                    }
                }
            }

            return isInside;
        }
        private void RunAnimationsForEggs(Character Egg)
        {
            string TextureName = "";
            int Iteration = 0;
            foreach (KeyValuePair<string, Point> TextureBox in PremCosmBody)
            {
                if (TextureBox.Value == new Point(Egg.Clothing.X, Egg.Clothing.Y))
                {
                    TextureName = TextureBox.Key.Split("-")[0];
                    Iteration = Convert.ToInt32(TextureBox.Key.Split("-")[1]);
                    Iteration++;

                    if (Egg.Framechange >= AnimationFrameTimes[TextureName])
                    {
                        Egg.ResetFrameCount();
                        if (PremCosmBody.ContainsKey(TextureName + "-" + Iteration))
                        {
                            Egg.Clothing = new Rectangle(PremCosmBody[TextureName + "-" + Iteration], Egg.Clothing.Size);
                        }
                        else
                        {
                            Egg.Clothing = new Rectangle(PremCosmBody[TextureName + "-0"], Egg.Clothing.Size);
                        }
                    }
                }
            }
        }




        private void AutoShoutOut(ConcurrentBag<string> FirstMessageTodayList)
        {
            string FileContents = "";
            Dictionary<string,string> USERIDandMessageFromFile = new();
            List<string> UserInformationSplit = new();
            //FirstMessageTodayList.Add("e109e9b5-cc90-4c0f-9077-5fe1000ac3de&");
            if (!FirstMessageTodayList.IsEmpty)
            {
                foreach (string userInfoShowCharacter in FirstMessageTodayList)
                {
                    ShowCharacter(userInfoShowCharacter.Split('&')[0]);
                }
                
                try
                {
                    FileContents = File.ReadAllText(AutoShoutOutListLocation);
                    for(int i = 0; i < FileContents.Split('|').Length - 1; i++)
                    {
                        USERIDandMessageFromFile[FileContents.Split('|')[i].Split("&")[0]] = FileContents.Split('|')[i].Split('&')[1];

                        foreach (string userInfo in FirstMessageTodayList)
                        {
                            
                            UserInformationSplit.Clear();
                            UserInformationSplit.Add(userInfo.Split('&')[0]);
                            UserInformationSplit.Add(userInfo.Split('&')[1].ToLower().Replace("%2f", "/"));
                            UserInformationSplit.Add(userInfo.Split('&')[2].Replace("+", " "));
                            UserInformationSplit.Add(userInfo.Split('&')[3]);
                            if (USERIDandMessageFromFile.ContainsKey(UserInformationSplit[0]))
                            {
                                if (USERIDandMessageFromFile[UserInformationSplit[0]] == "")
                                {
                                    AutoShoutOutChatMessage(UserInformationSplit[3], UserInformationSplit[2], UserInformationSplit[1]);

                                    
                                }
                                else
                                {
                                    AutoShoutOutChatMessage(UserInformationSplit[3], UserInformationSplit[2], UserInformationSplit[1], USERIDandMessageFromFile[UserInformationSplit[0]]);
                                }
                                USERIDandMessageFromFile.Remove(UserInformationSplit[0]);
                            }
                        }
                    }

                }
                catch (FileNotFoundException)
                {
                    
                }
                catch (Exception ex)
                {
                    
                }
                
                
            }

        }


        //returns a dictionary of a single message's commands in key value pairs where key is the
        //command and value represents the command change value
        private List <string> ParseCommandInputs(string rawCommands)
        {
            List<string> commandPairs = new List<string>();
            string[] splitCommands = rawCommands.Split('&');
            string commandstringholder;
            foreach (string commandstrings in  splitCommands)
            {
                //combing grapheme joiner remover
                commandstringholder = commandstrings.Replace(" ͏", "");
                if (commandstringholder.Contains('|'))
                {
                    commandPairs[commandPairs.Count] = commandstringholder.Split('|')[0].ToLower() + "|" + commandstringholder.Split('|')[1].ToLower();
                }
                else if (commandstringholder.Contains("showcharacter"))
                {
                    commandPairs[commandPairs.Count] = "";
                }
                else
                {
                    ResponseChatMessage(false, "please seperate the command with a '|' from the value. error occurred on '" + commandstringholder + "'and did not execute this command");
                }
            }
            
            return commandPairs;
        }


        private async void CompleteCommand(string command, string value, string UID)
        {
            string[] splitColor;
            Color newCharacterColor = Color.White;
            int red = 0; int blue = 0; int green = 0;
            bool isValidCosmetic = false;
            bool isValidEquipment = false;
            Dictionary<string, string> CharacterData;
            value = value.ToLower();
            //THIS IS NOT A SINGLE SPACE, IT IS A COMBINING GRAPHEME JOINER AND ITS FROM FUCKING MIXITUP AND THE CODE
            //BREAKS EVERY OTHER TIME IF ITS NOT REPLACED WITH EMPTY
            value = value.Replace(" ͏","");
            if(command == "changecolor")
            {
                splitColor = value.Split(',');
                if(splitColor.Length != 3 ) {
                    await ResponseChatMessage(false, "color must be in xxx,xxx,xxx format");
                }
                else if (!int.TryParse(splitColor[0], out red) || !int.TryParse(splitColor[1], out green) || !int.TryParse(splitColor[2], out blue))
                {
                    await ResponseChatMessage(false, "color must be a number between 0 and 255");
                }
                else if(!(red > -1 && red < 256 && blue > -1 && blue < 256 && green > -1 && green < 256))
                {
                    await ResponseChatMessage(false, "color must be a number between 0 and 255");
                }
                else
                {
                    newCharacterColor = new Color(red, green, blue);
                    await UpdateColor(newCharacterColor, UID);
                }
            }
            if(command == "equipcosmetic")
            {

                if (CosmBody.ContainsKey(value))
                {
                    await UpdateEquippables("body", value, UID);
                    isValidCosmetic = true;
                }
                else if (CosmEyes.ContainsKey(value))
                {
                    await UpdateEquippables("eyes", value, UID);
                    isValidCosmetic = true;
                }
                else if (CosmMouth.ContainsKey(value))
                {
                    await UpdateEquippables("mouth", value, UID);
                    isValidCosmetic = true;
                }
                else if (CosmHat.ContainsKey(value))
                {
                    await UpdateEquippables("hat", value, UID);
                    isValidCosmetic = true;
                }
                else if (CosmNose.ContainsKey(value))
                {
                    await UpdateEquippables("nose", value, UID);
                    isValidCosmetic = true;
                }
                else if (PremCosmBody.ContainsKey(value) || PremCosmBody.ContainsKey(value + "-0"))
                {
                    if(UserHasCosmetic(value, UID))
                    {
                        await UpdateEquippables("body", value, UID);
                        isValidCosmetic = true;
                    }
                }
                else if(PremCosmHat.ContainsKey(value)||PremCosmHat.ContainsKey(value + "-0"))
                {
                    if (UserHasCosmetic(value, UID))
                    {
                        await UpdateEquippables("hat", value, UID);
                        isValidCosmetic = true;
                    }
                }


                if (!isValidCosmetic)
                {
                    await ResponseChatMessage(false, "please enter a valid cosmetic name");
                }

            }
            if(command == "equipitem")
            {
                if (EquipPet.Contains(value))
                {
                    await UpdateEquippables("pet", value, UID);
                    isValidEquipment = true;
                }
                else if (EquipShield.Contains(value))
                {
                    await UpdateEquippables("shield", value, UID);
                    isValidEquipment = true;
                }
                else if (EquipVehicle.Contains(value))
                {
                    await UpdateEquippables("vehicle", value, UID);
                    isValidEquipment = true;
                }
                else if (EquipCurse.Contains(value))
                {
                    await UpdateEquippables("curse", value, UID);
                    isValidEquipment = true;
                }
                else if (EquipBlessing.Contains(value))
                {
                    await UpdateEquippables("blessing", value, UID);
                    isValidEquipment = true;
                }
                else if (EquipNavigator.Contains(value))
                {
                    await UpdateEquippables("navigator", value, UID);
                    isValidEquipment = true;
                }
                else if (EquipWeapon.Contains(value))
                {
                    await UpdateEquippables("weapon", value, UID);
                    isValidEquipment = true;
                }
                if (!isValidEquipment)
                {
                    await ResponseChatMessage(false, "please enter a valid equipment name");
                }
            }
            if(command == "updatesettings")
            {

            }
            if(command == "showcharacter") {
                ShowCharacter(UID);
                
            }
            if(command == "addcosmetic")
            {
                await UpdateInventory("cosmetic", value, UID);
                await ResponseChatMessage(true, "Successfully bought: " + value);
            }
            else if (ActiveCharacters.ContainsKey(UID))
            {
                CharacterData = FetchCharacterData(UID);
                ActiveCharacters[UID] = BuildCharacter(CharacterData);
            }
        }

        private void ShowCharacter(string UID)
        {
            Dictionary<string, string> CData = FetchCharacterData(UID);
            if (ActiveCharacters.ContainsKey(UID))
            {
                ActiveCharacters[UID] = BuildCharacter(CData);
            }
            else
            {
                ActiveCharacters.Add(UID, BuildCharacter(CData));
            }
        }

        private async Task UpdateInventory(string ItemType, string NewItem, string UID)
        {
            string FileContents = "";
            string NewSaveData = "";
            string Addition = ItemType + "-" + NewItem + "|";
            try
            {
                FileContents = File.ReadAllText(AllSaveLocation + UID + "Inventory.txt");
            }
            catch (FileNotFoundException)
            {

            }
            if (FileContents == "")
            {
                NewSaveData = Addition;
            }
            else
            {
                NewSaveData = FileContents + Addition;
            }
            File.WriteAllText(AllSaveLocation + UID + "Inventory.txt", NewSaveData);
        }

        private Character BuildCharacter(Dictionary<string,string> RawCharacterData)
        {
            Character NewCharacter = new Character(CosmTextureBounds);
            string Nose; string Body; string Mouth; string Eyes; string Hat; string[] Colors;
            NewCharacter.Screenwidth = this.Window.ClientBounds.Width;
            if (RawCharacterData.ContainsKey("nose"))
            {
                Nose = RawCharacterData["nose"];
                if (CosmNose.ContainsKey(Nose))
                {
                    NewCharacter.Nose = new Rectangle(CosmNose[Nose].X, CosmNose[Nose].Y, CosmTextureBounds, CosmTextureBounds);
                }
            }
            if (RawCharacterData.ContainsKey("hat"))
            {
                Hat = RawCharacterData["hat"];
                if (CosmHat.ContainsKey(Hat))
                {
                    NewCharacter.HeadGear = new Rectangle(CosmHat[Hat].X, CosmHat[Hat].Y, CosmTextureBounds, CosmTextureBounds);
                }
                else if (PremCosmHat.ContainsKey(Hat))
                {
                    NewCharacter.HeadGear = new Rectangle(PremCosmHat[Hat].X, PremCosmHat[Hat].Y, CosmTextureBounds, CosmTextureBounds);
                    NewCharacter.PremiumHeadwear = true;
                }
                else if (PremCosmBody.ContainsKey(Hat + "-0"))
                {
                    NewCharacter.HeadGear = new Rectangle(PremCosmHat[Hat + "-0"].X, PremCosmBody[Hat + "-0"].Y, CosmTextureBounds, CosmTextureBounds);
                    NewCharacter.PremiumHeadwear = true;
                    NewCharacter.AnimatedBody = true;
                }
            }
            if (RawCharacterData.ContainsKey("eyes"))
            {
                Eyes = RawCharacterData["eyes"];
                if (CosmEyes.ContainsKey(Eyes))
                {
                    NewCharacter.Eyes = new Rectangle(CosmEyes[Eyes].X, CosmEyes[Eyes].Y, CosmTextureBounds, CosmTextureBounds);
                }
            }
            if (RawCharacterData.ContainsKey("body"))
            {
                Body = RawCharacterData["body"];
                if (CosmBody.ContainsKey(Body))
                {
                    NewCharacter.Clothing = new Rectangle(CosmBody[Body].X, CosmBody[Body].Y, CosmTextureBounds, CosmTextureBounds);
                    NewCharacter.PremiumBody = false;
                }
                else if (PremCosmBody.ContainsKey(Body))
                {
                    NewCharacter.Clothing = new Rectangle(PremCosmBody[Body].X, PremCosmBody[Body].Y, CosmTextureBounds, CosmTextureBounds);
                    NewCharacter.PremiumBody = true;
                }
                else if(PremCosmBody.ContainsKey(Body + "-0"))
                {
                    NewCharacter.Clothing = new Rectangle(PremCosmBody[Body+"-0"].X, PremCosmBody[Body+"-0"].Y, CosmTextureBounds, CosmTextureBounds);
                    NewCharacter.PremiumBody = true;
                    NewCharacter.AnimatedBody = true;
                }
            }
            if (RawCharacterData.ContainsKey("mouth"))
            {
                Mouth = RawCharacterData["mouth"];
                if (CosmMouth.ContainsKey(Mouth))
                {
                    NewCharacter.Mouth = new Rectangle(CosmMouth[Mouth].X, CosmMouth[Mouth].Y, CosmTextureBounds, CosmTextureBounds);
                }
            }
            if (RawCharacterData.ContainsKey("colors"))
            {
                Colors = RawCharacterData["colors"].Split(':');
                NewCharacter.ShellColor = new Color(Convert.ToInt32(Colors[1].Replace("green", "")), Convert.ToInt32(Colors[2].Replace("blue", "")), Convert.ToInt32(Colors[3]) );

            }
            return NewCharacter;
        }
        private Dictionary<string, string> FetchCharacterData(string UID)
        {
            Dictionary<string, string> CharacterData = new Dictionary<string, string>();
            string[] RawDataSplit;
            string FileContents;
            try
            {
                FileContents = File.ReadAllText(AllSaveLocation + UID + ".txt");
                RawDataSplit = FileContents.Split('|');
                foreach(string attribute in  RawDataSplit)
                {
                    if(attribute != "") CharacterData.Add(attribute.Split('-')[0], attribute.Split('-')[1]);
                }
            }
            catch (FileNotFoundException)
            {

            }

            return CharacterData;
        }

        private async Task UpdateEquippables(string CosmSlot, string NewCosm, string UID)
        {
            string FileContents = "";
            string NewSaveData = "";
            string replacement = CosmSlot + "-" + NewCosm + "|";
            string pattern = CosmSlot + ".*?\\|";
            try
            {
                FileContents = File.ReadAllText(AllSaveLocation + UID + ".txt");
            }
            catch (FileNotFoundException)
            {

            }
            if (FileContents == "")
            {
                NewSaveData = replacement;
            }
            else
            {
                if (FileContents.Contains(CosmSlot))
                {
                    NewSaveData = Regex.Replace(FileContents, pattern, replacement);
                }
                else
                {
                    NewSaveData = FileContents + replacement;
                }

            }
            File.WriteAllText(AllSaveLocation + UID + ".txt", NewSaveData);
        }

        private bool UserHasCosmetic(string CosmName, string UID)
        {
            bool Has = false;
            string FileContents = "";
            try
            {
                FileContents = File.ReadAllText(AllSaveLocation + UID + "Inventory.txt");
            }
            catch (FileNotFoundException)
            {

            }
            if(FileContents != "")
            {
                Has = FileContents.Contains(CosmName);
            }
            return Has;
        }
        private async Task UpdateColor(Color newcolor, string UID)
        {
            string FileContents = "";
            string NewSaveData = "";
            string replacement = "colors-red:" + newcolor.R + "green:" + newcolor.G + "blue:" + newcolor.B + "|";
            string pattern = "colors.*?\\|";
            try
            {
                FileContents = File.ReadAllText(AllSaveLocation + UID + ".txt");
            }
            catch (FileNotFoundException)
            {

            }
            if (FileContents == "")
            {
                NewSaveData = replacement;
            }
            else
            {
                if (FileContents.Contains("colors"))
                {
                    NewSaveData = Regex.Replace(FileContents, pattern, replacement);
                }
                else
                {
                    NewSaveData = FileContents + replacement;
                }
                
            }
            File.WriteAllText(AllSaveLocation + UID + ".txt", NewSaveData);
        }


        //handles 2 different API requests, one for calling to mixitup inventories (port 8911)
        //and to the dedicated API (port 24756)
        private async Task ChatterInput()
        {
            HttpResponseMessage response = await http.GetAsync(UserAPIUrl);
            HttpResponseMessage APIFetch = await http.GetAsync(CommandAPIUrl);
            HttpResponseMessage AutoShoutOutCall = await http.GetAsync(AutoShoutOutListAPIUrl);
            HttpResponseMessage inventoriesbase = new HttpResponseMessage();

            string JSON = await response.Content.ReadAsStringAsync();
            string JSON2 = "";
            string JSON3 = await APIFetch.Content.ReadAsStringAsync();
            string JSON4 = await AutoShoutOutCall.Content.ReadAsStringAsync();
            List<dynamic> inventories = new List<dynamic>();
            List<Command> parsedCommands = new List<Command>();

            var JSONResponse = JsonConvert.DeserializeObject <Dictionary<string,dynamic>>(JSON);
            var JSONBag = JsonConvert.DeserializeObject<ConcurrentBag<string>>(JSON3);
            var AutoShoutList = JsonConvert.DeserializeObject<ConcurrentBag<string>>(JSON4);
            dynamic USERID;
            string UID;

            if(AutoShoutList == null)
            {
                AutoShoutList = new ConcurrentBag<string>();
            }

            AutoShoutOut(AutoShoutList);


            JSONResponse.TryGetValue("Users", out USERID);
            //todo: validation not needed here, replace
            if (JSONBag != null && JSONBag.Count() > 0)
            {
                foreach (var APIitem in JSONBag)
                {
                    UID = APIitem.Split("USERID|")[1].Split("&")[0];
                    foreach(string pairs in APIitem.Split("&"))
                    {
                        parsedCommands.Add(new Command());
                        if(!parsedCommands[parsedCommands.Count - 1].ParseCommand(pairs, UID))
                        {
                            ResponseChatMessage(false, "please seperate the command with a '|' from the value. error occurred on '" + pairs + "'and did not execute this command");
                        }
                    }
                    
                    foreach (string command in APICommands)
                    {
                        foreach (Command activeCommand in parsedCommands)
                        {
                            if (activeCommand.CommandName.ToLower().Contains(command.ToLower()))
                            {
                                CompleteCommand(activeCommand.CommandName, activeCommand.CommandText, UID);
                            }
                        }
                        
                    }
                }
            }
            foreach(var Shopitem in USERID)
            {
                inventoriesbase = await http.GetAsync(UserInventoryCalls + Shopitem.ID);
                JSON2 = await inventoriesbase.Content.ReadAsStringAsync();
                if (JSON2 != "[]")
                {
                    await Actions(JSON2, Convert.ToString(Shopitem["ID"]), ActionInventoryID);
                }
            }
        }
        //replies to chatter who used the updateCharacter command
        private async Task ResponseChatMessage(bool validTask, string commandText)
        {
            
            HttpContent messageBody;
            HttpResponseMessage sendChatMessage = new HttpResponseMessage();
            if (validTask)
            {

                messageBody = new StringContent("{ \"Message\": \"successfuly performed action: " + commandText + "\", \"Platform\": \"Twitch\", \"SendAsStreamer\": false}", encoding: Encoding.UTF8, "application/json");
                sendChatMessage = await http.PostAsync(MessageAPIUrl, messageBody);
            }
            else
            {
                messageBody = new StringContent("{ \"Message\": \"invalid action string: " + commandText + "\", \"Platform\": \"Twitch\", \"SendAsStreamer\": false}", encoding: Encoding.UTF8, "application/json");
                sendChatMessage = await http.PostAsync(MessageAPIUrl, messageBody);
            }
        }

        private async Task AutoShoutOutChatMessage(string username, string game, string pronouns)
        {
            HttpResponseMessage sendChatMessage = new HttpResponseMessage();
            HttpContent ShoutoutCommand = new StringContent("{ \"Message\": \"!shoutout " + username + "\", \"Platform\": \"Twitch\", \"SendAsStreamer\": true}", encoding: Encoding.UTF8, "application/json");
            HttpContent ShoutoutMessage = new StringContent("{ \"Message\": \"Check out " + username + " at https://twitch.tv/"+ username + " ! " + pronouns.Split('/')[0] + " was last seen playing/doing " + game + "!\", \"Platform\": \"Twitch\", \"SendAsStreamer\": false}", encoding: Encoding.UTF8, "application/json");

            sendChatMessage = await http.PostAsync(MessageAPIUrl, ShoutoutCommand);
            sendChatMessage = await http.PostAsync(MessageAPIUrl, ShoutoutMessage);
        }
        private async Task AutoShoutOutChatMessage(string username, string game, string pronouns, string custommessage)
        {
            HttpResponseMessage sendChatMessage = new HttpResponseMessage();

            custommessage = custommessage
                .Replace("{username}", username)
                .Replace("{game}", game)
                .Replace("{pronouns[0]}", 
                pronouns.Split('/')[0])
                .Replace("{pronouns[1]}", 
                pronouns.Split('/')[1]);
            HttpContent ShoutoutCommand = new StringContent("{ \"Message\": \"!shoutout " + username + "\", \"Platform\": \"Twitch\", \"SendAsStreamer\": false}", encoding: Encoding.UTF8, "application/json");
            HttpContent ShoutoutMessage = new StringContent("{ \"Message\": \"" + custommessage + "\", \"Platform\": \"Twitch\", \"SendAsStreamer\": false}", encoding: Encoding.UTF8, "application/json");

            sendChatMessage = await http.PostAsync(MessageAPIUrl, ShoutoutCommand);
            sendChatMessage = await http.PostAsync(MessageAPIUrl, ShoutoutMessage);
        }
        //converts the requests from mixitup inventory to a concurrentbag of actions
        //to perform in code.
        private async Task<string> Actions(string raw, string userID, string inventoryID)
        {
            string Action = "";
            List<Dictionary<string,string>> ActionJSON = JsonConvert.DeserializeObject<List<Dictionary<string,string>>>(raw);
            HttpResponseMessage removeItem = new HttpResponseMessage();
            Int32 amount = Convert.ToInt32(ActionJSON[0]["Amount"]); 
            HttpContent RequestBody = new StringContent("{ \"Amount\":" + - amount +  "}", encoding:Encoding.UTF8,"application/json");

            switch (ActionJSON[0]["Name"])
            {
                case "spawnGoober":
                    removeItem = await http.PatchAsync(GenericInventoryAPIUrl + inventoryID + "/" + ActionJSON[0]["ID"] + "/" + userID, RequestBody);
                    for (int i = 0; i < amount; i++)
                    {
                        actionsToPerform.Add("spawnGoober");
                    }
                    break;
            }
            return Action;
        }

        private void CheckAndSetSettings()
        {
            //todo: program write to new settings text document, below are defaults
            PlayAreas = new List<Rectangle>();
            PlayAreas.Add(new Rectangle(0, 850, 1525, 230));
            PlayAreas.Add(new Rectangle(1525, 0, 395, 600));
        }
    }
}
