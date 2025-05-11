using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedTeacherRoleAndCreatedBy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "47cab803-afe2-4de8-beaa-c523148f19c0");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "9c77e156-c6a3-44e8-b0fe-41dc8a87f625");

            migrationBuilder.AddColumn<string>(
                name: "PracticeTitle",
                table: "Lessons",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TheoryTitle",
                table: "Lessons",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Courses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "27b420ae-cc97-413a-a4f0-93883ec408b4", null, "Teacher", "TEACHER" },
                    { "6ef7d26a-0c48-4fbb-aae4-5d4881155e29", null, "Admin", "ADMIN" },
                    { "72972afd-9a9d-45a2-95bd-0d2e34876e45", null, "Member", "MEMBER" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "27b420ae-cc97-413a-a4f0-93883ec408b4");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "6ef7d26a-0c48-4fbb-aae4-5d4881155e29");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "72972afd-9a9d-45a2-95bd-0d2e34876e45");

            migrationBuilder.DropColumn(
                name: "PracticeTitle",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "TheoryTitle",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Courses");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "47cab803-afe2-4de8-beaa-c523148f19c0", null, "Member", "MEMBER" },
                    { "9c77e156-c6a3-44e8-b0fe-41dc8a87f625", null, "Admin", "ADMIN" }
                });
        }
    }
}
