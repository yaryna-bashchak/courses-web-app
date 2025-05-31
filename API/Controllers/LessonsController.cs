using API.Dtos.Lesson;
using API.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize(Policy = "ManageCourses")]
    public class LessonsController : BaseApiController
    {
        private ILessonsRepository _lessonsRepository;
        public LessonsController(ILessonsRepository lessonsRepository)
        {
            _lessonsRepository = lessonsRepository;
        }

        [HttpPost]
        public async Task<ActionResult<GetLessonDto>> AddLesson([FromForm] AddLessonDto newLesson)
        {
            var username = User.Identity.Name ?? "";
            var result = await _lessonsRepository.AddLesson(newLesson, username);

            if (!result.IsSuccess)
            {
                return BadRequest(result.ErrorMessage);
            }

            return result.Data;
        }

        [HttpGet]
        public async Task<ActionResult<List<GetLessonDto>>> GetLessons()
        {
            var result = await _lessonsRepository.GetLessons();

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return result.Data;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GetLessonDto>> GetLesson(int id)
        {
            var username = User.Identity.Name ?? "";
            var result = await _lessonsRepository.GetLesson(id, username);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return result.Data;
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<GetLessonDto>> UpdateLesson(int id, [FromForm] UpdateLesssonDto updatedLesson)
        {
            var username = User.Identity.Name ?? "";
            var result = await _lessonsRepository.UpdateLesson(id, updatedLesson, username);

            if (!result.IsSuccess)
            {
                if (result.ErrorMessage.Contains("Unauthorized")) return Unauthorized();
                return NotFound(result.ErrorMessage);
            }

            return result.Data;
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteLesson(int id)
        {
            var result = await _lessonsRepository.DeleteLesson(id);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return Ok();
        }
    }
}