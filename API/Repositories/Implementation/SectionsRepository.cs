using API.Controllers;
using API.Data;
using API.Dtos.Course;
using API.Dtos.Section;
using API.Entities;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API.Repositories.Implementation
{
    public class SectionsRepository : ISectionsRepository
    {
        private readonly CourseContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;
        private readonly ILessonsRepository _lessonsRepository;
        public SectionsRepository(
            CourseContext context,
            UserManager<User> userManager,
            IMapper mapper,
            ILessonsRepository lessonsRepository)
        {
            _userManager = userManager;
            _context = context;
            _mapper = mapper;
            _lessonsRepository = lessonsRepository;
        }

        private async Task<Result<GetSectionDto>> GetSection(int id, string username)
        {
            var user = await _userManager.FindByNameAsync(username);

            var dbSection = await _context.Sections
                .Include(s => s.UserSections)
                .Include(s => s.SectionLessons).ThenInclude(sl => sl.Lesson)
                .Include(s => s.SectionLessons).ThenInclude(sl => sl.Lesson)
                    .ThenInclude(l => l.LessonKeywords).ThenInclude(lk => lk.Keyword)
                .Include(s => s.SectionLessons).ThenInclude(sl => sl.Lesson)
                    .ThenInclude(l => l.PreviousLessons).ThenInclude(lpl => lpl.PreviousLesson)
                .Include(s => s.SectionLessons).ThenInclude(sl => sl.Lesson)
                    .ThenInclude(l => l.UserLessons)
                .FirstOrDefaultAsync(l => l.Id == id);

            var section = _mapper.Map<GetSectionDto>(dbSection, opts => opts.Items["UserId"] = user?.Id);
            return new Result<GetSectionDto> { IsSuccess = true, Data = section };
        }

        public async Task<Result<GetSectionDto>> AddSection(AddSectionDto newSection, string username)
        {
            var section = _mapper.Map<Section>(newSection);

            section.Id = _context.Sections.Any() ? _context.Sections.Max(c => c.Id) + 1 : 1;
            await _context.Sections.AddAsync(section);
            await _context.SaveChangesAsync();

            var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == newSection.CourseId);
            if (course == null)
            {
                return NotFoundResult<GetSectionDto>("Course not found.");
            }

            course.Duration += 1;
            await _context.SaveChangesAsync();

            var user = await _userManager.FindByNameAsync(username);
            await MakeSectionAvailable(section.Id, user.Id);

            var result = await GetSection(section.Id, username);
            return new Result<GetSectionDto> { IsSuccess = true, Data = result.Data };
        }

        public async Task<Result<GetSectionDto>> UpdateSection(int id, UpdateSectionDto updatedSection, string username)
        {
            try
            {
                var dbSection = _context.Sections.Find(id);

                if (dbSection == null) return NotFoundResult<GetSectionDto>("Section with the provided ID not found.");

                dbSection.Title = updatedSection.Title ?? "";
                dbSection.Description = updatedSection.Description ?? "";
                dbSection.Number = updatedSection.Number != -1 ? updatedSection.Number : dbSection.Number;

                if (updatedSection.LessonIdsToAdd != null)
                {
                    foreach (var lessonId in updatedSection.LessonIdsToAdd)
                    {
                        Lesson lesson = await _context.Lessons
                            .FirstOrDefaultAsync(l => l.Id == lessonId);

                        if (lesson == null)
                        {
                            return new Result<GetSectionDto> { IsSuccess = false, ErrorMessage = "Lesson with ID " + lessonId + "not found." };
                        }

                        SectionLesson sectionLesson = await _context.SectionLessons
                            .Where(sl => sl.SectionId == id).FirstOrDefaultAsync(sl => sl.LessonId == lessonId);

                        if (sectionLesson != null)
                        {
                            return new Result<GetSectionDto> { IsSuccess = false, ErrorMessage = "Connection between Section with ID " + id + " and Lesson with ID " + lessonId + " already exists." };
                        }

                        _context.SectionLessons.Add(
                            new SectionLesson
                            {
                                SectionId = id,
                                LessonId = lessonId,
                            }
                        );
                    }
                }

                if (updatedSection.LessonIdsToDelete != null)
                {
                    foreach (var lessonId in updatedSection.LessonIdsToDelete)
                    {
                        Lesson lesson = await _context.Lessons
                            .FirstOrDefaultAsync(l => l.Id == lessonId);

                        if (lesson == null)
                        {
                            return new Result<GetSectionDto> { IsSuccess = false, ErrorMessage = "Lesson with ID " + lessonId + "not found." };
                        }

                        SectionLesson sectionLesson = await _context.SectionLessons
                            .Where(sl => sl.SectionId == id).FirstOrDefaultAsync(sl => sl.LessonId == lessonId);

                        if (sectionLesson == null)
                        {
                            return new Result<GetSectionDto> { IsSuccess = false, ErrorMessage = "Connection between Section with ID " + id + " and Lesson with ID" + lessonId + "not found." };
                        }

                        _context.SectionLessons.Remove(sectionLesson);
                        await _context.SaveChangesAsync();

                        var isLessonLinkedToOtherSections = await _context.SectionLessons.AnyAsync(sl => sl.LessonId == lessonId);
                        if (!isLessonLinkedToOtherSections)
                        {
                            await _lessonsRepository.DeleteLesson(lessonId);
                        }
                    }
                }

                return await SaveChangesAndReturnResult(id, username);
            }
            catch (System.Exception ex)
            {
                return new Result<GetSectionDto> { IsSuccess = false, ErrorMessage = ex.Message };
            }
        }

        public async Task<Result<GetSectionDto>> MakeSectionAvailable(int sectionId, string userId)
        {
            var dbSection = _context.Sections.Find(sectionId);
            if (dbSection == null) return NotFoundResult<GetSectionDto>("Section with the provided ID not found.");

            UserSection userSection = await _context.UserSections
                .Where(sl => sl.SectionId == sectionId)
                .FirstOrDefaultAsync(sl => sl.UserId == userId);

            if (userSection == null)
            {
                _context.UserSections.Add(
                    new UserSection
                    {
                        SectionId = sectionId,
                        UserId = userId,
                        isAvailable = true,
                    });
            }
            else
            {
                userSection.isAvailable = true;
            }

            await _context.SaveChangesAsync();

            return new Result<GetSectionDto> { IsSuccess = true };
        }

        public async Task<Result<GetCourseDto>> MakeCourseAvailable(int courseId, string userId)
        {
            var dbSections = await _context.Sections.Where(s => s.CourseId == courseId).ToListAsync();

            if (dbSections.IsNullOrEmpty()) return NotFoundResult<GetCourseDto>("Sections for course with the provided ID not found.");

            foreach (var dbSection in dbSections)
            {
                await MakeSectionAvailable(dbSection.Id, userId);
            }

            return new Result<GetCourseDto> { IsSuccess = true };
        }

        public async Task<Result<bool>> DeleteSection(int id)
        {
            try
            {
                var dbSection = await _context.Sections.Include(s => s.SectionLessons).FirstOrDefaultAsync(s => s.Id == id);
                if (dbSection == null) return new Result<bool> { IsSuccess = false, ErrorMessage = "Section with the provided ID not found." };

                var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == dbSection.CourseId);
                if (course == null)
                {
                    return new Result<bool> { IsSuccess = false, ErrorMessage = "Associated course not found." };
                }

                course.Duration -= 1;
                
                var lessonIds = dbSection.SectionLessons.Select(sl => sl.LessonId).ToList();
                _context.Sections.Remove(dbSection);

                foreach (var lessonId in lessonIds)
                {
                    var isLessonLinkedToOtherSections = await _context.SectionLessons.AnyAsync(sl => sl.LessonId == lessonId && sl.SectionId != id);
                    if (!isLessonLinkedToOtherSections)
                    {
                        await _lessonsRepository.DeleteLesson(lessonId);
                    }
                }

                await _context.SaveChangesAsync();

                return new Result<bool> { IsSuccess = true, Data = true };
            }
            catch (System.Exception ex)
            {
                return new Result<bool> { IsSuccess = false, ErrorMessage = ex.Message };
            }
        }

        private async Task<Result<GetSectionDto>> SaveChangesAndReturnResult(int sectionId, string username)
        {
            try
            {
                await _context.SaveChangesAsync();
                var section = await GetSection(sectionId, username);
                return new Result<GetSectionDto> { IsSuccess = true, Data = section.Data };
            }
            catch (System.Exception ex)
            {
                return new Result<GetSectionDto> { IsSuccess = false, ErrorMessage = ex.Message };
            }
        }

        private Result<T> UnauthorizedResult<T>(string errorMessage)
        {
            return new Result<T> { IsSuccess = false, ErrorMessage = errorMessage };
        }

        private Result<T> NotFoundResult<T>(string errorMessage)
        {
            return new Result<T> { IsSuccess = false, ErrorMessage = errorMessage };
        }
    }
}