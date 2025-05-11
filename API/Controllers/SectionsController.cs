using API.Dtos.Section;
using API.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize(Policy = "ManageCourses")]
    public class SectionsController : BaseApiController
    {
        private ISectionsRepository _sectionsRepository;
        public SectionsController(ISectionsRepository sectionsRepository)
        {
            _sectionsRepository = sectionsRepository;
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<GetSectionDto>> UpdateSection(int id, UpdateSectionDto updatedSection)
        {
            var username = User.Identity.Name ?? "";
            var result = await _sectionsRepository.UpdateSection(id, updatedSection, username);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return result.Data;
        }

        [HttpPost]
        public async Task<ActionResult<GetSectionDto>> AddSection(AddSectionDto newSection)
        {
            var username = User.Identity.Name ?? "";
            var result = await _sectionsRepository.AddSection(newSection, username);

            if (!result.IsSuccess)
            {
                return BadRequest(result.ErrorMessage);
            }

            return result.Data;
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteSection(int id)
        {
            var result = await _sectionsRepository.DeleteSection(id);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return Ok();
        }
    }
}