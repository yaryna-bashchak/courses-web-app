using API.Dtos.Option;
using API.Dtos.Test;
using API.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize(Policy = "ManageCourses")]
    public class OptionsController : BaseApiController
    {
        private readonly IOptionsRepository _optionsRepository;
        public OptionsController(IOptionsRepository optionsRepository)
        {
            _optionsRepository = optionsRepository;
        }

        [HttpPost]
        public async Task<ActionResult<GetOptionDto>> AddOption(AddOptionDto newOption)
        {
            var result = await _optionsRepository.AddOption(newOption);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return result.Data;
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<GetOptionDto>> UpdateOption(int id, UpdateOptionDto updatedOption)
        {
            var result = await _optionsRepository.UpdateOption(id, updatedOption);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return result.Data;
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOption(int id)
        {
            var result = await _optionsRepository.DeleteOption(id);

            if (!result.IsSuccess)
            {
                return NotFound(result.ErrorMessage);
            }

            return Ok();
        }
    }
}