using API.Dtos.Test;
using API.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class TestsController : BaseApiController
    {
        private readonly ITestsRepository _testsRepository;
        public TestsController(ITestsRepository testsRepository)
        {
            _testsRepository = testsRepository;
        }

        [HttpGet("lessonId/{lessonId}")]
        public async Task<ActionResult<List<GetTestDto>>> GetTestsOfLesson(int lessonId)
        {
            var username = User.Identity.Name ?? "";
            var result = await _testsRepository.GetTestsOfLesson(lessonId, username);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return result.Data;
        }

        [HttpPost("statistics")]
        public async Task<ActionResult<TestsStatisticDto>> GetStatisticsOfTests(TestsStatisticParametersDto parameters)
        {
            if (parameters.TopPercent < 0 || parameters.TopPercent > 100)
            {
                return BadRequest("Top Percent must be a number between 0 and 100.");
            }

            var username = User.Identity.Name ?? "";
            var result = await _testsRepository.GetStatisticsOfLessonTests(parameters, username);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return result.Data;
        }

        [Authorize(Policy = "ManageCourses")]
        [HttpPost]
        public async Task<ActionResult<GetTestDto>> AddTest(/*[FromForm]*/ AddTestDto newTest)
        {
            var username = User.Identity.Name ?? "";
            var result = await _testsRepository.AddTest(newTest);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return result.Data;
        }

        [Authorize(Policy = "ManageCourses")]
        [HttpPut("{id}")]
        public async Task<ActionResult<GetTestDto>> UpdateTest(int id, /*[FromForm]*/ UpdateTestDto updatedTest)
        {
            var result = await _testsRepository.UpdateTest(id, updatedTest);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return result.Data;
        }

        [Authorize(Policy = "ManageCourses")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTest(int id)
        {
            var username = User.Identity.Name ?? "";
            var result = await _testsRepository.DeleteTest(id);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return Ok();
        }
    }
}