namespace API.Entities
{
    public class Lesson
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string UrlTheory { get; set; }
        public string UrlPractice { get; set; }
        public string TheoryTitle { get; set; } = "Теорія";
        public string PracticeTitle { get; set; } = "Практика";
        public string TheoryPublicId { get; set; }
        public string PracticePublicId { get; set; }
        public int Number { get; set; }
        public int Importance { get; set; } = 0;
        public List<UserLesson> UserLessons { get; set; }
        public List<SectionLesson> SectionLessons { get; set; }
        public List<LessonKeyword> LessonKeywords { get; set; }
        public List<LessonPreviousLesson> PreviousLessons { get; set; } = new List<LessonPreviousLesson>();
        public List<LessonPreviousLesson> PreviousLessonOf { get; set; } = new List<LessonPreviousLesson>();
        public List<Test> Tests { get; set; }
    }
}