using API.Dtos.Course;
using API.Repositories;
using API.RequestHelper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class CoursesController : BaseApiController
    {
        private ICoursesRepository _coursesRepository;
        public CoursesController(ICoursesRepository coursesRepository)
        {
            _coursesRepository = coursesRepository;
        }

        [HttpGet]
        public async Task<ActionResult<List<GetCoursePreviewDto>>> GetCourses()
        {
            var username = User.Identity.Name ?? "";
            var result = await _coursesRepository.GetCourses(username);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return result.Data;
        }

        [HttpGet("preview/{id}")]
        public async Task<ActionResult<GetCoursePreviewDto>> GetCoursePreview(int id)
        {
            var result = await _coursesRepository.GetCoursePreview(id);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return result.Data;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GetCourseDto>> GetCourse(int id, [FromQuery] LessonParams lessonParams)
        {
            var username = User.Identity.Name ?? "";
            var result = await _coursesRepository.GetCourse(id, lessonParams.MaxImportance, lessonParams.OnlyUncompleted, lessonParams.SearchTerm, username);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return result.Data;
        }

        [Authorize(Policy = "ManageCourses")]
        [HttpPost]
        public async Task<ActionResult<GetCourseDto>> AddCourse(AddCourseDto newCourse)
        {
            var username = User.Identity.Name ?? "";

            if (newCourse.Duration <= 0 || newCourse.PriceFull <= 0 || newCourse.PriceMonthly <= 0)
                return BadRequest("Duration, full price and price monthly must be greater than zero.");

            var result = await _coursesRepository.AddCourse(newCourse, username);

            if (!result.IsSuccess)
            {
                return BadRequest(result.ErrorMessage);
            }

            return result.Data;
        }

        [Authorize(Policy = "ManageCourses")]
        [HttpPut("{id}")]
        public async Task<ActionResult<GetCourseDto>> UpdateCourse(int id, UpdateCourseDto updatedCourse)
        {
            var username = User.Identity.Name ?? "";

            if (updatedCourse.Duration <= 0 || updatedCourse.PriceFull <= 0 || updatedCourse.PriceMonthly <= 0)
                return BadRequest("Duration, full price and price monthly must be greater than zero.");

            var result = await _coursesRepository.UpdateCourse(id, updatedCourse, username);

            if (!result.IsSuccess)
            {
                if (result.ErrorMessage.Contains("Unauthorized")) return Unauthorized();
                return NotFound(result.ErrorMessage);
            }

            return result.Data;
        }

        [Authorize(Policy = "ManageCourses")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCourse(int id)
        {
            var result = await _coursesRepository.DeleteCourse(id);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return Ok();
        }
    }
}