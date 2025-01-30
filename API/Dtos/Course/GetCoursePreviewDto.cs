using API.Dtos.Section;

namespace API.Dtos.Course
{
    public class GetCoursePreviewDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Duration { get; set; }
        public int PriceFull { get; set; }
        public int PriceMonthly { get; set; }
        public List<GetSectionPreviewDto> Sections { get; set; }
        public string CreatedBy { get; set; }
        public bool IsActive { get; set; }
    }
}