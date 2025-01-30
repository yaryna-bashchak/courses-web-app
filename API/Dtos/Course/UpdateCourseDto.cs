using API.Dtos.Section;

namespace API.Dtos.Course
{
    public class UpdateCourseDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int Duration { get; set; } = -1;
        public int PriceFull { get; set; } = -1;
        public int PriceMonthly { get; set; } = -1;
        public string CreatedBy { get; set; }
        public int IsActive { get; set; } = -1;
    }
}