using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc; 


namespace funniOverlayAPIController.Controllers
{

    [ApiController]
    [Route("funni")]
    public class funniOverlayAPIController : ControllerBase
    {
        static ConcurrentBag<string> requests = new ConcurrentBag<string>();
        static ConcurrentBag<string> autoShout = new ConcurrentBag<string>();
        [HttpGet("route/{message}")]
        [Consumes("application/json")]
        public async Task<IActionResult> FunniRequest(string message)
        {

            requests.Add(message);
            return Ok();
        }
        [HttpGet("getBag")]
        [Consumes("application/json")]
        public async Task<ActionResult<ConcurrentBag<string>>> GameLogicFetch()
        {
            List<string> copyOfRequests = requests.ToList<string>();
            requests.Clear();
            return Ok(copyOfRequests);
            
        }
        [HttpGet("autoShoutOut/{message}")]
        [Consumes("application/json")]
        public async Task<IActionResult> AutoShoutOut(string message)
        {
            autoShout.Add(message);
            return Ok();
        }
        [HttpGet("getASOList")]
        [Consumes("application/json")]
        public async Task<ActionResult<ConcurrentBag<string>>> GetASOList()
        {
            List<string> copyOfASOList = autoShout.ToList<string>();
            autoShout.Clear();
            return Ok(copyOfASOList);
        }
    }
}
