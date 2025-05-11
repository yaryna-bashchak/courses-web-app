using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities
{
    public class Course
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Duration { get; set; }
        public int PriceFull { get; set; }
        public int PriceMonthly { get; set; }
        public string ImgUrl { get; set; }
        public string PublicId { get; set; }
        public List<Section> Sections { get; set; }
        public string CreatedBy { get; set; }
        public bool IsActive { get; set; }
    }
}