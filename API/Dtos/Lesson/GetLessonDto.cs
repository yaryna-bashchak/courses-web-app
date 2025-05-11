using API.Dtos.Keyword;

namespace API.Dtos.Lesson
{
    public class GetLessonDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string UrlTheory { get; set; }
        public string UrlPractice { get; set; }
        public string TheoryTitle { get; set; }
        public string PracticeTitle { get; set; }
        public int Number { get; set; }
        public int Importance { get; set; } = 0;
        public float? TestScore { get; set; }
        public bool IsTheoryCompleted { get; set; } = false;
        public bool IsPracticeCompleted { get; set; } = false;
        public string TheoryPublicId { get; set; }
        public string PracticePublicId { get; set; }
        public List<GetKeywordDto> Keywords { get; set; }
        public List<GetPreviousLessonDto> PreviousLessons { get; set; }
    }
}