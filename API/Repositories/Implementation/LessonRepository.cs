using System.Text.RegularExpressions;
using API.Data;
using API.Dtos.Course;
using API.Dtos.Lesson;
using API.Entities;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories.Implementation
{
    public class LessonsRepository : ILessonsRepository
    {
        private readonly CourseContext _context;
        private readonly IMapper _mapper;
        private readonly VideoService _videoService;
        private readonly UserManager<User> _userManager;
        public LessonsRepository(
            CourseContext context,
            UserManager<User> userManager,
            IMapper mapper,
            VideoService videoService)
        {
            _userManager = userManager;
            _context = context;
            _mapper = mapper;
            _videoService = videoService;
        }

        public async Task<Result<List<GetLessonDto>>> GetLessons()
        {
            var dbLessons = _context.Lessons
                .Include(l => l.LessonKeywords).ThenInclude(lk => lk.Keyword)
                .Include(l => l.PreviousLessons).ThenInclude(lpl => lpl.PreviousLesson);

            var lessons = await dbLessons.Select(l => _mapper.Map<GetLessonDto>(l)).ToListAsync();
            return new Result<List<GetLessonDto>> { IsSuccess = true, Data = lessons };
        }

        public async Task<Result<GetLessonDto>> GetLesson(int id, string username)
        {
            var user = await _userManager.FindByNameAsync(username);

            var dbLesson = await _context.Lessons
                .Include(l => l.LessonKeywords).ThenInclude(lk => lk.Keyword)
                .Include(l => l.PreviousLessons).ThenInclude(lpl => lpl.PreviousLesson)
                .Include(l => l.UserLessons)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (dbLesson == null) return NotFoundResult("Lesson with the provided ID not found.");

            var lesson = _mapper.Map<GetLessonDto>(dbLesson, opts => opts.Items["UserId"] = user?.Id);
            return new Result<GetLessonDto> { IsSuccess = true, Data = lesson };
        }

        public async Task<Result<GetLessonDto>> AddLesson(AddLessonDto newLesson, string username)
        {
            var lesson = _mapper.Map<Lesson>(newLesson);

            var theoryResult = await ProcessVideoForLesson(newLesson.TheoryFile, null, (url, id) => { lesson.UrlTheory = url; lesson.TheoryPublicId = id; });
            if (theoryResult != null) return theoryResult;

            var practiceResult = await ProcessVideoForLesson(newLesson.PracticeFile, null, (url, id) => { lesson.UrlPractice = url; lesson.PracticePublicId = id; });
            if (practiceResult != null) return practiceResult;

            lesson.Id = _context.Lessons.Any() ? _context.Lessons.Max(c => c.Id) + 1 : 1;
            await _context.Lessons.AddAsync(lesson);

            return await SaveChangesAndReturnResult(lesson.Id, username);
        }

        public async Task<Result<GetLessonDto>> UpdateLesson(int id, UpdateLesssonDto updatedLesson, string username)
        {
            var dbLesson = await GetLessonById(id);

            if (dbLesson == null) return NotFoundResult("Lesson with the provided ID not found.");

            UpdateLessonDetails(dbLesson, updatedLesson);

            var theoryResult = await ProcessVideoForLesson(updatedLesson.TheoryFile, dbLesson.TheoryPublicId, (url, id) => { dbLesson.UrlTheory = url; dbLesson.TheoryPublicId = id; });
            if (theoryResult != null) return theoryResult;

            var practiceResult = await ProcessVideoForLesson(updatedLesson.PracticeFile, dbLesson.PracticePublicId, (url, id) => { dbLesson.UrlPractice = url; dbLesson.PracticePublicId = id; });
            if (practiceResult != null) return practiceResult;

            return await SaveChangesAndReturnResult(id, username);
        }

        public async Task<Result<GetLessonDto>> UpdateLessonCompletion(int lessonId, UpdateUserLesssonDto updatedUserLesson, GetCourseDto course, string username)
        {
            var user = await GetUser(username);
            if (user == null) return UnauthorizedResult("Unauthorized user.");

            if (!await UserIsAdmin(user))
            {
                var lessonAvailabilityResult = CheckLessonAvailability(lessonId, updatedUserLesson, course, username);
                if (lessonAvailabilityResult != null)
                {
                    return lessonAvailabilityResult;
                }
            }

            var dbLesson = await GetLessonById(lessonId);
            if (dbLesson == null) return NotFoundResult("Lesson with the provided ID not found.");

            var userLesson = await GetUserLesson(lessonId, user.Id);
            if (userLesson == null)
            {
                CreateUserLesson(lessonId, user.Id, updatedUserLesson);
            }
            else
            {
                UpdateExistingUserLesson(userLesson, updatedUserLesson);
            }

            return await SaveChangesAndReturnResult(lessonId, username);
        }

        public async Task<Result<bool>> DeleteLesson(int id)
        {
            var dbLesson = await GetLessonById(id);
            if (dbLesson == null)
                return new Result<bool> { IsSuccess = false, ErrorMessage = "Lesson with the provided ID not found." };

            if (!string.IsNullOrEmpty(dbLesson.TheoryPublicId))
                await _videoService.DeleteVideoAsync(dbLesson.TheoryPublicId);

            if (!string.IsNullOrEmpty(dbLesson.PracticePublicId))
                await _videoService.DeleteVideoAsync(dbLesson.PracticePublicId);

            _context.Lessons.Remove(dbLesson);
            await _context.SaveChangesAsync();

            return new Result<bool> { IsSuccess = true, Data = true };
        }

        private async Task<Result<GetLessonDto>> ProcessVideoForLesson(IFormFile file, string existingPublicId, Action<string, string> updateLesson)
        {
            if (file != null)
            {
                if (!string.IsNullOrEmpty(existingPublicId))
                    await _videoService.DeleteVideoAsync(existingPublicId);

                var videoResult = await _videoService.AddVideoAsync(file);

                if (videoResult.Error != null)
                    return new Result<GetLessonDto> { IsSuccess = false, ErrorMessage = videoResult.Error.Message };

                updateLesson(videoResult.SecureUrl.ToString(), videoResult.PublicId);
            }
            return null;
        }

        private Result<GetLessonDto> CheckLessonAvailability(int id, UpdateUserLesssonDto updatedUserLesson, GetCourseDto course, string username)
        {
            if (updatedUserLesson.courseId == -1)
                return new Result<GetLessonDto> { IsSuccess = false, ErrorMessage = "You should provide course ID." };

            var section = course.Sections.FirstOrDefault(s => s.Lessons.Any(l => l.Id == id));
            if (section == null)
                return new Result<GetLessonDto> { IsSuccess = false, ErrorMessage = "Lesson with the provided ID was not found in any of sections." };

            var isLessonAvailable = section?.IsAvailable;
            if (!isLessonAvailable.HasValue || !isLessonAvailable.Value)
                return new Result<GetLessonDto> { IsSuccess = false, ErrorMessage = "Lesson is not available." };

            return null;
        }

        private async Task<UserLesson> GetUserLesson(int lessonId, string userId)
        {
            return await _context.UserLessons
                .Where(sl => sl.LessonId == lessonId)
                .FirstOrDefaultAsync(sl => sl.UserId == userId);
        }

        private void CreateUserLesson(int lessonId, string userId, UpdateUserLesssonDto updatedUserLesson)
        {
            _context.UserLessons.Add(new UserLesson
            {
                LessonId = lessonId,
                UserId = userId,
                IsTheoryCompleted = updatedUserLesson.IsTheoryCompleted != -1 && (updatedUserLesson.IsTheoryCompleted != 0),
                IsPracticeCompleted = updatedUserLesson.IsPracticeCompleted != -1 && (updatedUserLesson.IsPracticeCompleted != 0),
                TestScore = updatedUserLesson.TestScore != -1 ? updatedUserLesson.TestScore : null,
            });
        }

        private void UpdateExistingUserLesson(UserLesson userLesson, UpdateUserLesssonDto updatedUserLesson)
        {
            userLesson.IsTheoryCompleted = updatedUserLesson.IsTheoryCompleted != -1 ? (updatedUserLesson.IsTheoryCompleted != 0) : userLesson.IsTheoryCompleted;
            userLesson.IsPracticeCompleted = updatedUserLesson.IsPracticeCompleted != -1 ? (updatedUserLesson.IsPracticeCompleted != 0) : userLesson.IsPracticeCompleted;
            userLesson.TestScore = updatedUserLesson.TestScore != -1 ? updatedUserLesson.TestScore : userLesson.TestScore;
        }

        private Result<GetLessonDto> UnauthorizedResult(string errorMessage)
        {
            return new Result<GetLessonDto> { IsSuccess = false, ErrorMessage = errorMessage };
        }

        private Result<GetLessonDto> NotFoundResult(string errorMessage)
        {
            return new Result<GetLessonDto> { IsSuccess = false, ErrorMessage = errorMessage };
        }

        private async Task<bool> UserIsAdmin(User user)
        {
            return await _userManager.IsInRoleAsync(user, "Admin");
        }

        private async Task<Result<GetLessonDto>> SaveChangesAndReturnResult(int lessonId, string username)
        {
            try
            {
                await _context.SaveChangesAsync();
                return new Result<GetLessonDto> { IsSuccess = true, Data = GetLesson(lessonId, username).Result.Data };
            }
            catch (System.Exception ex)
            {
                return new Result<GetLessonDto> { IsSuccess = false, ErrorMessage = ex.Message };
            }
        }

        private async Task<User> GetUser(string username)
        {
            return await _userManager.FindByNameAsync(username);
        }

        private async Task<Lesson> GetLessonById(int id)
        {
            return await _context.Lessons.FirstOrDefaultAsync(l => l.Id == id);
        }

        private void UpdateLessonDetails(Lesson dbLesson, UpdateLesssonDto updatedLesson)
        {
            dbLesson.Title = updatedLesson.Title ?? dbLesson.Title;
            dbLesson.Description = updatedLesson.Description ?? "";
            dbLesson.Number = updatedLesson.Number != -1 ? updatedLesson.Number : dbLesson.Number;
            dbLesson.Importance = updatedLesson.Importance != -1 ? updatedLesson.Importance : dbLesson.Importance;
        }

        // public async Task<Result<List<GetLessonDto>>> GetLessonsByKeyword(string keyword)
        // {
        //     var regex = new Regex(keyword, RegexOptions.IgnoreCase);

        //     var dbLessons = await _context.Lessons
        //         .Include(l => l.LessonKeywords).ThenInclude(lk => lk.Keyword)
        //         .Include(l => l.PreviousLessons).ThenInclude(lpl => lpl.PreviousLesson)
        //         .ToListAsync();

        //     var lessons = dbLessons
        //         .Select(l => _mapper.Map<GetLessonDto>(l))
        //         .Where(l => l.Keywords.Any(lk => regex.IsMatch(lk.Word)))
        //         .ToList();

        //     if (lessons == null || !lessons.Any())
        //     {
        //         return new Result<List<GetLessonDto>> { IsSuccess = false, ErrorMessage = "Lessons with this keyword pattern not found." };
        //     }

        //     return new Result<List<GetLessonDto>> { IsSuccess = true, Data = lessons };
        // }

        // public async Task<Result<List<GetLessonDto>>> GetLessonsByKeywordID(int id)
        // {
        //     var dbLessons = _context.Lessons
        //         .Include(l => l.LessonKeywords).ThenInclude(lk => lk.Keyword)
        //         .Include(l => l.PreviousLessons).ThenInclude(lpl => lpl.PreviousLesson)
        //         .Where(l => l.LessonKeywords.Any(lk => lk.Keyword.Id == id));

        //     var lessons = await dbLessons
        //         .Select(l => _mapper.Map<GetLessonDto>(l)).ToListAsync();

        //     if (lessons == null || !lessons.Any())
        //     {
        //         return new Result<List<GetLessonDto>> { IsSuccess = false, ErrorMessage = "Lessons with this keyword ID not found." };
        //     }

        //     return new Result<List<GetLessonDto>> { IsSuccess = true, Data = lessons };
        // }

        // public async Task<Result<List<GetLessonDto>>> GetLessonsByImportance(int importance)
        // {
        //     if (importance < 0)
        //     {
        //         return new Result<List<GetLessonDto>> { IsSuccess = false, ErrorMessage = "Importance cannot be less than 0 (it can only be 0, 1 or 2)." };
        //     }

        //     var dbLessons = _context.Lessons
        //         .Include(l => l.LessonKeywords).ThenInclude(lk => lk.Keyword)
        //         .Include(l => l.PreviousLessons).ThenInclude(lpl => lpl.PreviousLesson)
        //         .Where(l => l.Importance <= importance);

        //     var lessons = await dbLessons.Select(l => _mapper.Map<GetLessonDto>(l)).ToListAsync();

        //     if (lessons == null || !lessons.Any())
        //     {
        //         return new Result<List<GetLessonDto>> { IsSuccess = false, ErrorMessage = "It seems there are no lessons whose importance is equal to or less than given one (it can only be 0, 1 or 2)." };
        //     }

        //     return new Result<List<GetLessonDto>> { IsSuccess = true, Data = lessons };
        // }
    }
}