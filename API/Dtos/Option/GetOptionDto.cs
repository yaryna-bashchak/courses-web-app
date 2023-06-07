using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Dtos.Option
{
    public class GetOptionDto
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public string ImgUrl { get; set; } = "";
        public bool isAnswer { get; set; }
    }
}