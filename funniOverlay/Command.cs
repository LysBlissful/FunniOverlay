using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace funniOverlay
{
    internal class Command
    {
        public string UID { get; set; }
        public string CommandName {  get; set; }
        public string CommandText { get; set; }
        private string holder {  get; set; } 
        public bool ParseCommand(string command, string userID)
        {
            bool isValidCommand = false;
            UID = userID;
            //combing grapheme joiner remover
            holder = command.Replace(" ͏", "");
            if (holder.Contains('|'))
            {
                CommandName = holder.Split("|")[0];
                CommandText = holder.Split("|")[1];
                isValidCommand = true;
            }
            else if (holder.Contains("showcharacter"))
            {
                CommandName = "showcharacter";
                CommandText = "";
                isValidCommand = true;
            }


            return isValidCommand;
        }

    }
}
