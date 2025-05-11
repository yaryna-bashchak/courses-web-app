using System.ComponentModel.DataAnnotations;

namespace API.Dtos.Lesson
{
    public class AddLessonDto
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string TheoryTitle { get; set; } = "";
        public IFormFile TheoryFile { get; set; }
        public string PracticeTitle { get; set; } = "";
        public IFormFile PracticeFile { get; set; }
        public int Number { get; set; }
        
        [Range(0, 2, ErrorMessage = "Importance must be only 0, 1 or 2")]
        public int Importance { get; set; } = 0;
    }
}