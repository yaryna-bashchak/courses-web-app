using API.Data;
using API.Dtos.Course;
using API.Dtos.Lesson;
using API.Entities;
using API.Extensions;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories.Implementation
{
    public class CoursesRepository : ICoursesRepository
    {
        private readonly CourseContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;
        private readonly ISectionsRepository _sectionsRepository;
        public CoursesRepository(
            CourseContext context,
            UserManager<User> userManager,
            IMapper mapper,
            ISectionsRepository sectionsRepository)
        {
            _userManager = userManager;
            _context = context;
            _mapper = mapper;
            _sectionsRepository = sectionsRepository;
        }

        public async Task<Result<GetCourseDto>> AddCourse(AddCourseDto newCourse, string username)
        {
            var course = _mapper.Map<Course>(newCourse);
            var user = await _userManager.FindByNameAsync(username);

            course.CreatedBy = user.Id;
            course.Id = _context.Courses.Any() ? _context.Courses.Max(c => c.Id) + 1 : 1;
            await _context.Courses.AddAsync(course);

            return await SaveChangesAndReturnResult(course.Id, username);
        }

        public async Task<Result<GetCourseDto>> UpdateCourse(int id, UpdateCourseDto updatedCourse, string username)
        {
            var dbCourse = await GetCourseById(id);

            if (dbCourse == null) return new Result<GetCourseDto> { IsSuccess = false, ErrorMessage = "Lesson with the provided ID not found." };

            dbCourse.Title = updatedCourse.Title ?? "";
            dbCourse.Description = updatedCourse.Description ?? "";
            dbCourse.PriceFull = updatedCourse.PriceFull != -1 ? updatedCourse.PriceFull : dbCourse.PriceFull;
            dbCourse.PriceMonthly = updatedCourse.PriceMonthly != -1 ? updatedCourse.PriceMonthly : dbCourse.PriceMonthly;
            dbCourse.IsActive = updatedCourse.IsActive;

            return await SaveChangesAndReturnResult(id, username);
        }

        public async Task<Result<GetCourseDto>> GetCourse(int id, int? maxImportance, bool? onlyUncompleted, string searchTerm, string username)
        {
            var user = await _userManager.FindByNameAsync(username);

            try
            {
                var dbCourse = await _context.Courses
                    .Include(c => c.Sections).ThenInclude(s => s.UserSections)
                    .Include(c => c.Sections).ThenInclude(s => s.SectionLessons).ThenInclude(sl => sl.Lesson)
                        .ThenInclude(l => l.LessonKeywords).ThenInclude(lk => lk.Keyword)
                    .Include(c => c.Sections).ThenInclude(s => s.SectionLessons).ThenInclude(sl => sl.Lesson)
                        .ThenInclude(l => l.PreviousLessons).ThenInclude(lpl => lpl.PreviousLesson)
                    .Include(c => c.Sections).ThenInclude(s => s.SectionLessons).ThenInclude(sl => sl.Lesson)
                        .ThenInclude(l => l.UserLessons)
                    .FirstAsync(l => l.Id == id);

                var course = _mapper.Map<GetCourseDto>(dbCourse, opts => opts.Items["UserId"] = user?.Id)
                    .SortAndRenumberLessons()
                    .Filter(maxImportance, onlyUncompleted)
                    .Search(searchTerm);

                foreach (var section in course.Sections)
                {
                    if (!section.IsAvailable)
                    {
                        var lessonPreviews = _mapper.Map<List<GetLessonPreviewDto>>(section.Lessons);
                        var lessons = _mapper.Map<List<GetLessonDto>>(lessonPreviews);
                        section.Lessons = lessons;
                    }
                }

                return new Result<GetCourseDto> { IsSuccess = true, Data = course };
            }
            catch (System.Exception)
            {
                return new Result<GetCourseDto> { IsSuccess = false, ErrorMessage = "Course with the provided ID not found." };
            }
        }

        public async Task<Result<GetCoursePreviewDto>> GetCoursePreview(int id)
        {
            try
            {
                var dbCourse = await _context.Courses
                    .Include(c => c.Sections).ThenInclude(s => s.SectionLessons).ThenInclude(sl => sl.Lesson)
                    .FirstAsync(l => l.Id == id);

                var course = _mapper.Map<GetCoursePreviewDto>(dbCourse)
                    .SortAndRenumberLessons();

                return new Result<GetCoursePreviewDto> { IsSuccess = true, Data = course };
            }
            catch (System.Exception)
            {
                return new Result<GetCoursePreviewDto> { IsSuccess = false, ErrorMessage = "Course with the provided ID not found." };
            }
        }

        public async Task<Result<List<GetCoursePreviewDto>>> GetCourses(string username)
        {
            var user = await _userManager.FindByNameAsync(username);

            try
            {
                var dbCourses = await _context.Courses
                    .Include(c => c.Sections).ThenInclude(s => s.UserSections)
                    .Include(c => c.Sections).ThenInclude(s => s.SectionLessons).ThenInclude(sl => sl.Lesson)
                    .ToListAsync();

                var courses = dbCourses.Select(c => _mapper.Map<GetCoursePreviewDto>(c, opts => opts.Items["UserId"] = user?.Id)).ToList();
                return new Result<List<GetCoursePreviewDto>> { IsSuccess = true, Data = courses };
            }
            catch (System.Exception)
            {
                return new Result<List<GetCoursePreviewDto>> { IsSuccess = false, ErrorMessage = "Courses not found." };
            }
        }

        public async Task<Result<bool>> DeleteCourse(int id)
        {
            try
            {
                var dbCourse = await _context.Courses.Include(c => c.Sections).FirstOrDefaultAsync(c => c.Id == id);

                if (dbCourse == null) return new Result<bool> { IsSuccess = false, ErrorMessage = "Course with the provided ID not found." };

                foreach (var section in dbCourse.Sections.ToList())
                {
                    await _sectionsRepository.DeleteSection(section.Id);
                }

                _context.Courses.Remove(dbCourse);
                await _context.SaveChangesAsync();

                return new Result<bool> { IsSuccess = true, Data = true };
            }
            catch (System.Exception ex)
            {
                return new Result<bool> { IsSuccess = false, ErrorMessage = ex.Message };
            }
        }

        private async Task<Result<GetCourseDto>> SaveChangesAndReturnResult(int courseId, string username)
        {
            try
            {
                await _context.SaveChangesAsync();
                return new Result<GetCourseDto> { IsSuccess = true, Data = GetCourse(courseId, null, null, null, username).Result.Data };
            }
            catch (System.Exception ex)
            {
                return new Result<GetCourseDto> { IsSuccess = false, ErrorMessage = ex.Message };
            }
        }

        private async Task<Course> GetCourseById(int id)
        {
            return await _context.Courses.FirstOrDefaultAsync(c => c.Id == id);
        }
    }
}
