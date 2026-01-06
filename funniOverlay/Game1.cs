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
            "showcharacter"
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
        Texture2D Clothing; Texture2D Eyes; Texture2D Headwear; Texture2D Mouths; Texture2D Noses; Texture2D Shells; Texture2D BodyOutline;
        Dictionary<string, Character> ActiveCharacters = new Dictionary<string, Character>();
        //possible states will be: Idle, Fighting, Dungeon
        String State = "Idle";


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
            Headwear = this.Content.Load<Texture2D>("spriteSheets/headwear");
            Mouths = this.Content.Load<Texture2D>("spriteSheets/mouthShapes");
            Noses = this.Content.Load<Texture2D>("spriteSheets/noseShapes");
            Shells = this.Content.Load<Texture2D>("spriteSheets/0whiteSkin");
            Eyes = this.Content.Load<Texture2D>("spriteSheets/eyeShapes");
            BodyOutline = this.Content.Load<Texture2D>("spriteSheets/body");

            _graphics.PreferredBackBufferWidth = GraphicsDevice.DisplayMode.Width;
            _graphics.PreferredBackBufferHeight = GraphicsDevice.DisplayMode.Height;
            _graphics.ApplyChanges();
        }

        protected override void Update(GameTime gameTime)
        {
            Point coords = new();

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
                    spawn.Idle();
                }
            }
            
            base.Update(gameTime);
        }

        protected override void Draw(GameTime gameTime)
        {
            GraphicsDevice.Clear(new Color(37, 90, 64));

            // TODO: Add your drawing code here
            _spriteBatch.Begin(SpriteSortMode.Deferred);
            foreach(Character spawn in ActiveCharacters.Values)
            {
                
                _spriteBatch.Draw(Shells, spawn.Body, new Rectangle(0, 0, CosmTextureBounds, CosmTextureBounds), spawn.ShellColor, spawn.TextureAngle, new Vector2(CosmTextureBounds / 2, CosmTextureBounds), spawn.DirectionMod == 1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally, 0);
                _spriteBatch.Draw(BodyOutline, spawn.Body, new Rectangle(0, 0, CosmTextureBounds, CosmTextureBounds), new Color(255, 255, 255), spawn.TextureAngle, new Vector2(CosmTextureBounds / 2, CosmTextureBounds), spawn.DirectionMod == 1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally, 0);
                
                _spriteBatch.Draw(Eyes, spawn.Body, spawn.Eyes, new Color(255, 255, 255), spawn.TextureAngle, new Vector2(CosmTextureBounds / 2, CosmTextureBounds), spawn.DirectionMod == 1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally, 0);
                _spriteBatch.Draw(Mouths, spawn.Body, spawn.Mouth, new Color(255, 255, 255), spawn.TextureAngle, new Vector2(CosmTextureBounds / 2, CosmTextureBounds), spawn.DirectionMod == 1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally, 0);
                _spriteBatch.Draw(Noses, spawn.Body, spawn.Nose, new Color(255, 255, 255), spawn.TextureAngle, new Vector2(CosmTextureBounds / 2, CosmTextureBounds), spawn.DirectionMod == 1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally, 0);

                _spriteBatch.Draw(Headwear, spawn.Body, spawn.HeadGear, new Color(255, 255, 255), spawn.TextureAngle, new Vector2(CosmTextureBounds / 2, CosmTextureBounds), spawn.DirectionMod == 1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally, 0);
                _spriteBatch.Draw(Clothing, spawn.Body, spawn.Clothing, new Color(255, 255, 255), spawn.TextureAngle, new Vector2(CosmTextureBounds / 2, CosmTextureBounds), spawn.DirectionMod == 1 ? SpriteEffects.None : SpriteEffects.FlipHorizontally, 0);
            }


            _spriteBatch.End();
            base.Draw(gameTime);
            
        }


        private void AutoShoutOut(ConcurrentBag<string> FirstMessageTodayList)
        {
            string FileContents = "";
            Dictionary<string,string> USERIDandMessageFromFile = new();
            List<string> UserInformationSplit = new();
            //FirstMessageTodayList.Add("e109e9b5-cc90-4c0f-9077-5fe1000ac3de&");
            if (!FirstMessageTodayList.IsEmpty)
            {
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
                            UserInformationSplit.Add(userInfo.Split('&')[1].Replace("%2f", "/"));
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
        private Dictionary<string, string> ParseCommandInputs(string rawCommands)
        {
            Dictionary<string,string> commandPairs = new Dictionary<string,string>();
            string[] splitCommands = rawCommands.Split('&');
            string commandstringholder;
            foreach (string commandstrings in  splitCommands)
            {
                //combing grapheme joiner remover
                commandstringholder = commandstrings.Replace(" ͏", "");
                if (commandstringholder.Contains('|'))
                {
                    commandPairs[commandstringholder.Split('|')[0].ToLower()] = commandstringholder.Split('|')[1].ToLower();
                }
                else if (commandstringholder.Contains("showcharacter"))
                {
                    commandPairs[commandstringholder] = "";
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
            //BREAK EVERY OTHER TIME IF ITS NOT REPLACED WITH EMPTY
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
            if(command == "showcharacter") {
                CharacterData = FetchCharacterData(UID);
                if (ActiveCharacters.ContainsKey(UID))
                {
                    ActiveCharacters[UID] = BuildCharacter(CharacterData);
                }
                else
                {
                    ActiveCharacters.Add(UID, BuildCharacter(CharacterData));
                }
            }
            else if (ActiveCharacters.ContainsKey(UID))
            {
                CharacterData = FetchCharacterData(UID);
                ActiveCharacters[UID] = BuildCharacter(CharacterData);
            }
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
            Dictionary<string, string> parsedCommands = new Dictionary<string, string>();

            var JSONResponse = JsonConvert.DeserializeObject <Dictionary<string,dynamic>>(JSON);
            var JSONBag = JsonConvert.DeserializeObject<ConcurrentBag<string>>(JSON3);
            var AutoShoutList = JsonConvert.DeserializeObject<ConcurrentBag<string>>(JSON4);
            dynamic USERID;

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
                    parsedCommands = ParseCommandInputs(APIitem);
                    foreach (string command in APICommands)
                    {
                        if (parsedCommands.ContainsKey(command.ToLower()))
                        {
                            CompleteCommand(command, parsedCommands[command], parsedCommands["userid"]);
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
    }
}
