using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Dtos.Account
{
    public class RegisterDto : LoginDto
    {
        // public string Email { get; set; }
        public bool IsTeacher { get; set; }
    }
}