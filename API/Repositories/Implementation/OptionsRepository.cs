using API.Data;
using API.Dtos.Option;
using API.Dtos.Test;
using API.Entities;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories.Implementation
{
    public class OptionsRepository : IOptionsRepository
    {
        private CourseContext _context;
        private IMapper _mapper;
        private readonly UserManager<User> _userManager;
        private readonly ImageService _imageService;
        public OptionsRepository(
            CourseContext context,
            UserManager<User> userManager,
            IMapper mapper,
            ImageService imageService)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
            _imageService = imageService;
        }

        public async Task<Result<GetOptionDto>> AddOption(AddOptionDto newOption)
        {
            var option = _mapper.Map<Option>(newOption);

            if (newOption.File != null)
            {
                var result = await _imageService.ProcessImageAsync(newOption.File, null, (url, id) => { option.ImgUrl = url; option.PublicId = id; });
                if (!result.IsSuccess) return new Result<GetOptionDto> { IsSuccess = false, ErrorMessage = result.ErrorMessage }; ;
            }

            option.Id = _context.Options.Max(o => o.Id) + 1;

            await _context.Options.AddAsync(option);

            return await SaveChangesAndReturnResult(option.Id);
        }

        public async Task<Result<GetOptionDto>> UpdateOption(int id, UpdateOptionDto updatedOption)
        {
            var dbOption = await _context.Options.FirstOrDefaultAsync(t => t.Id == id);

            if (dbOption == null) return new Result<GetOptionDto> { IsSuccess = false, ErrorMessage = "Option with the provided ID not found." };

            UpdateOptionDetails(dbOption, updatedOption);

            if (updatedOption.File != null)
            {
                var result = await _imageService.ProcessImageAsync(updatedOption.File, dbOption.PublicId, (url, id) => { dbOption.ImgUrl = url; dbOption.PublicId = id; });
                if (!result.IsSuccess) return new Result<GetOptionDto> { IsSuccess = false, ErrorMessage = result.ErrorMessage };
            }

            return await SaveChangesAndReturnResult(id);
        }

        public async Task<Result<bool>> DeleteOption(int id)
        {
            try
            {
                var dbOption = await _context.Options.FirstOrDefaultAsync(o => o.Id == id);

                if (dbOption == null) return new Result<bool> { IsSuccess = false, ErrorMessage = "Option with the provided ID not found." };

                if (!string.IsNullOrEmpty(dbOption.PublicId))
                    await _imageService.DeleteImageAsync(dbOption.PublicId);

                _context.Options.Remove(dbOption);
                await _context.SaveChangesAsync();

                return new Result<bool> { IsSuccess = true, Data = true };
            }
            catch (System.Exception ex)
            {
                return new Result<bool> { IsSuccess = false, ErrorMessage = ex.Message };
            }
        }

        public async Task<Result<bool>> DeleteAllOptionsOfTest(int testId)
        {
            var dbOptions = _context.Options
                .Where(o => o.TestId == testId);

            foreach (var option in dbOptions)
            {
                var result = await DeleteOption(option.Id);

                if (!result.IsSuccess) return result;
            }

            return new Result<bool> { IsSuccess = true, Data = true };
        }

        private void UpdateOptionDetails(Option dbOption, UpdateOptionDto updatedOption)
        {
            dbOption.Text = updatedOption.Text ?? "";
            dbOption.isAnswer = updatedOption.isAnswer != -1 ? (updatedOption.isAnswer != 0) : dbOption.isAnswer;
        }

        private async Task<Result<GetOptionDto>> SaveChangesAndReturnResult(int optionId)
        {
            try
            {
                await _context.SaveChangesAsync();

                var dbOption = await _context.Options
                                    .FirstOrDefaultAsync(t => t.Id == optionId);

                return new Result<GetOptionDto> { IsSuccess = true, Data = _mapper.Map<GetOptionDto>(dbOption) };
            }
            catch (System.Exception ex)
            {
                return new Result<GetOptionDto> { IsSuccess = false, ErrorMessage = ex.Message };
            }
        }
    }
}