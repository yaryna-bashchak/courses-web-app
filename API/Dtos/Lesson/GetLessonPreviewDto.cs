using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Dtos.Lesson
{
    public class GetLessonPreviewDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int MonthNumber { get; set; }
        public bool IsAvailable { get; set; } = false;
    }
}