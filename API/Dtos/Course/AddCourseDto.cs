using API.Dtos.Section;

namespace API.Dtos.Course
{
    public class AddCourseDto
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public int PriceFull { get; set; }
        public int PriceMonthly { get; set; }
    }
}