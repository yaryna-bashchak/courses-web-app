using API.Data;
using API.Dtos.Test;
using API.Entities;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories.Implementation;

public class TestsRepository : ITestsRepository
{
    private readonly CourseContext _context;
    private readonly IMapper _mapper;
    private readonly ImageService _imageService;
    private readonly UserManager<User> _userManager;
    private readonly IOptionsRepository _optionsRepository;
    public TestsRepository(
        CourseContext context,
        UserManager<User> userManager,
        IMapper mapper,
        ImageService imageService,
        IOptionsRepository optionsRepository)
    {
        _context = context;
        _mapper = mapper;
        _userManager = userManager;
        _imageService = imageService;
        _optionsRepository = optionsRepository;
    }

    public async Task<Result<List<GetTestDto>>> GetTestsOfLesson(int lessonId, string username)
    {
        var user = await _userManager.FindByNameAsync(username);
        if (user == null) return new Result<List<GetTestDto>> { IsSuccess = false, ErrorMessage = "Unauthorized user." };

        var dbLesson = await _context.Lessons
            .FirstOrDefaultAsync(l => l.Id == lessonId);

        if (dbLesson == null) return new Result<List<GetTestDto>> { IsSuccess = false, ErrorMessage = "Lesson with the provided ID not found." };

        var tests = await _context.Tests
            .Where(t => t.Lesson.Id == lessonId)
            .Include(t => t.Options)
            .Select(t => _mapper.Map<GetTestDto>(t))
            .ToListAsync();

        return new Result<List<GetTestDto>> { IsSuccess = true, Data = tests };
    }

    public async Task<Result<TestsStatisticDto>> GetStatisticsOfLessonTests(TestsStatisticParametersDto parameters, string username)
    {
        var user = await _userManager.FindByNameAsync(username);
        if (user == null) return new Result<TestsStatisticDto> { IsSuccess = false, ErrorMessage = "Unauthorized user." };

        var lessonId = parameters.LessonId;
        var topPercent = parameters.TopPercent;

        var dbLesson = await _context.Lessons
            .FirstOrDefaultAsync(l => l.Id == lessonId);

        if (dbLesson == null) return new Result<TestsStatisticDto> { IsSuccess = false, ErrorMessage = "Lesson with the provided ID not found." };

        var userLessons = await _context.UserLessons
            .Where(ul => ul.Lesson.Id == lessonId && ul.TestScore != null)
            .ToListAsync();

        var isScoreHigherAverage = IsScoreHigherThanAverage(userLessons, user.Id);
        var isUserInTop = IsUserInTopPercent(userLessons, topPercent, user.Id);

        var testsStatistics = new TestsStatisticDto
        {
            IsScoreHigherThanAverage = isScoreHigherAverage,
            IsUserInTopPercent = isUserInTop,
        };

        return new Result<TestsStatisticDto> { IsSuccess = true, Data = testsStatistics };
    }

    public async Task<Result<GetTestDto>> AddTest(AddTestDto newTest)
    {
        var test = _mapper.Map<Test>(newTest);

        if (newTest.File != null)
        {
            var result = await _imageService.ProcessImageAsync(newTest.File, null, (url, id) => { test.ImgUrl = url; test.PublicId = id; });
            if (!result.IsSuccess) return new Result<GetTestDto> { IsSuccess = false, ErrorMessage = result.ErrorMessage }; ;
        }

        test.Id = _context.Tests.Any() ? _context.Tests.Max(c => c.Id) + 1 : 1;
        await _context.Tests.AddAsync(test);

        return await SaveChangesAndReturnResult(test.Id);
    }

    public async Task<Result<GetTestDto>> UpdateTest(int id, UpdateTestDto updatedTest)
    {
        var dbTest = await _context.Tests.FirstOrDefaultAsync(t => t.Id == id);

        if (dbTest == null) return new Result<GetTestDto> { IsSuccess = false, ErrorMessage = "Test with the provided ID not found." };

        UpdateTestDetails(dbTest, updatedTest);

        if (updatedTest.File != null)
        {
            var result = await _imageService.ProcessImageAsync(updatedTest.File, dbTest.PublicId, (url, id) => { dbTest.ImgUrl = url; dbTest.PublicId = id; });
            if (!result.IsSuccess) return new Result<GetTestDto> { IsSuccess = false, ErrorMessage = result.ErrorMessage };
        }

        if (updatedTest.OptionIdsToAdd != null)
        {
            foreach (var optionIdToAdd in updatedTest.OptionIdsToAdd)
            {
                var option = await _context.Options.FindAsync(optionIdToAdd);
                if (option != null)
                {
                    option.TestId = id;
                    _context.Options.Update(option);
                }
            }
        }

        if (updatedTest.OptionIdsToDelete != null)
        {
            foreach (var optionIdToDelete in updatedTest.OptionIdsToDelete)
            {
                var option = await _context.Options.FirstOrDefaultAsync(o => o.Id == optionIdToDelete && o.TestId == id);
                if (option != null)
                    await _optionsRepository.DeleteOption(optionIdToDelete);
            }
        }

        return await SaveChangesAndReturnResult(id);
    }

    public async Task<Result<bool>> DeleteTest(int id)
    {
        try
        {
            var dbTest = await _context.Tests.FirstOrDefaultAsync(t => t.Id == id);

            if (dbTest == null) return new Result<bool> { IsSuccess = false, ErrorMessage = "Test with the provided ID not found." };

            if (!string.IsNullOrEmpty(dbTest.PublicId))
                await _imageService.DeleteImageAsync(dbTest.PublicId);

            var resultOfDeletingOptions = await _optionsRepository.DeleteAllOptionsOfTest(id);

            if (!resultOfDeletingOptions.IsSuccess) return resultOfDeletingOptions;

            _context.Tests.Remove(dbTest);
            await _context.SaveChangesAsync();

            return new Result<bool> { IsSuccess = true, Data = true };
        }
        catch (System.Exception ex)
        {
            return new Result<bool> { IsSuccess = false, ErrorMessage = ex.Message };
        }
    }

    private bool? IsScoreHigherThanAverage(List<UserLesson> userLessons, string userId)
    {
        if (!userLessons.Any(ul => ul.UserId != userId))
        {
            return null;
        }

        var otherScores = userLessons
            .Where(ul => ul.UserId != userId && ul.TestScore.HasValue)
            .Select(ul => ul.TestScore.Value)
            .ToList();

        var average = CalculateAverageScore(otherScores);
        var userScore = userLessons.First(ul => ul.UserId == userId).TestScore;

        return userScore >= average;
    }

    private float CalculateAverageScore(List<float> scores)
    {
        float total = scores.Sum();
        float average = total / scores.Count;

        return average;
    }

    private bool? IsUserInTopPercent(List<UserLesson> userLessons, int topPercent, string userId)
    {
        if (!userLessons.Any(ul => ul.UserId != userId))
        {
            return null;
        }
        
        var scores = userLessons
            .Where(ul => ul.TestScore.HasValue)
            .Select(ul => ul.TestScore.Value)
            .ToList();

        var threshold = CalculateTopPercentThreshold(scores, topPercent);
        var userScore = userLessons.First(ul => ul.UserId == userId).TestScore;

        return userScore >= threshold;
    }

    private float CalculateTopPercentThreshold(List<float> scores, int percent)
    {
        scores.Sort();

        int totalCount = scores.Count;
        int topCount = Math.Max(1, (int)Math.Ceiling(totalCount * percent / 100.0));

        float topPercentThreshold = scores[totalCount - topCount];
        return topPercentThreshold;
    }

    private void UpdateTestDetails(Test dbTest, UpdateTestDto updatedTest)
    {
        dbTest.Question = updatedTest.Question ?? "";
        dbTest.Type = updatedTest.Type ?? dbTest.Type;
    }

    private async Task<Result<GetTestDto>> SaveChangesAndReturnResult(int testId)
    {
        try
        {
            await _context.SaveChangesAsync();

            var dbTest = await _context.Tests
                .Include(t => t.Options)
                .FirstOrDefaultAsync(t => t.Id == testId);

            return new Result<GetTestDto> { IsSuccess = true, Data = _mapper.Map<GetTestDto>(dbTest) };
        }
        catch (System.Exception ex)
        {
            return new Result<GetTestDto> { IsSuccess = false, ErrorMessage = ex.Message };
        }
    }
}
