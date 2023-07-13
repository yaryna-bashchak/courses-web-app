using API.Dtos.Section;

namespace API.Dtos.Course
{
    public class GetCourseDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Duration { get; set; }
        public int PriceFull { get; set; }
        public int PriceMonthly { get; set; }
        public List<GetSectionDto> Sections { get; set; }
    }
}