using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Dtos.Account
{
    public class UserDto
    {
        public string Id { get; set; }
        // public string Email { get; set; }
        public string Username { get; set; }
        public string Token { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        public List<string> Claims { get; set; } = new List<string>();
    }
}