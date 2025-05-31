using API.Data;
using API.Dtos.Account;
using API.Entities;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly TokenService _tokenService;
        public AccountController(UserManager<User> userManager, TokenService tokenService, RoleManager<IdentityRole> roleManager)
        {
            _tokenService = tokenService;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.FindByNameAsync(loginDto.Username);
            if (user == null)
                return Unauthorized();

            if (await _userManager.IsLockedOutAsync(user))
                return AccountIsLocked();

            if (!await _userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                await _userManager.AccessFailedAsync(user);

                return Unauthorized();
            }

            await _userManager.ResetAccessFailedCountAsync(user);

            var roles = await _userManager.GetRolesAsync(user);
            var userClaims = await _userManager.GetClaimsAsync(user);

            return new UserDto
            {
                Id = user.Id,
                Username = user.UserName,
                Token = await _tokenService.GenerateToken(user),
                Roles = roles.ToList(),
                Claims = userClaims.Select(c => $"{c.Type}: {c.Value}").ToList()
            };
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register(RegisterDto registerDto)
        {
            var user = new User { UserName = registerDto.Username };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }

                return ValidationProblem();
            }

            if (registerDto.IsTeacher)
            {
                await DbInitializer.AssignRoleWithClaimsAsync(_userManager, _roleManager, user, "Teacher");
            }
            else
            {
                await DbInitializer.AssignRoleWithClaimsAsync(_userManager, _roleManager, user, "Member");
            }

            return StatusCode(201);
        }

        [Authorize]
        [HttpGet("currentUser")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var roles = await _userManager.GetRolesAsync(user);
            var userClaims = await _userManager.GetClaimsAsync(user);

            return new UserDto
            {
                Id = user.Id,
                Username = user.UserName,
                Token = await _tokenService.GenerateToken(user),
                Roles = roles.ToList(),
                Claims = userClaims.Select(c => $"{c.Type}: {c.Value}").ToList()
            };
        }

        private ObjectResult AccountIsLocked()
        {
            var problemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Account is locked due to too many failed password attempts. Please try again later."
            };
            return new ObjectResult(problemDetails)
            {
                StatusCode = StatusCodes.Status401Unauthorized
            };
        }
    }
}