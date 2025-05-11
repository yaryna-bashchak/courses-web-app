namespace API.Dtos.Lesson
{
    public class UpdateLesssonDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string TheoryTitle { get; set; }
        public IFormFile TheoryFile { get; set; }
        public string PracticeTitle { get; set; }
        public IFormFile PracticeFile { get; set; }
        public int Number { get; set; } = -1;
        public int Importance { get; set; } = -1;
    }
}