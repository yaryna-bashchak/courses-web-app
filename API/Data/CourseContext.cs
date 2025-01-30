using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class CourseContext : IdentityDbContext<User>
    {
        public CourseContext(DbContextOptions options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<IdentityRole>()
                .HasData(
                    new IdentityRole { Id = "1", Name = "Member", NormalizedName = "MEMBER" },
                    new IdentityRole { Id = "2", Name = "Teacher", NormalizedName = "TEACHER" },
                    new IdentityRole { Id = "3", Name = "Admin", NormalizedName = "ADMIN" }
                );

            modelBuilder.Entity<IdentityRoleClaim<string>>().HasData(
                new IdentityRoleClaim<string> { Id = 1, RoleId = "1", ClaimType = "Permission", ClaimValue = "BasicAccess" },

                new IdentityRoleClaim<string> { Id = 2, RoleId = "2", ClaimType = "Permission", ClaimValue = "BasicAccess" },
                new IdentityRoleClaim<string> { Id = 3, RoleId = "2", ClaimType = "Permission", ClaimValue = "ManageCourses" },

                new IdentityRoleClaim<string> { Id = 4, RoleId = "3", ClaimType = "Permission", ClaimValue = "BasicAccess" },
                new IdentityRoleClaim<string> { Id = 5, RoleId = "3", ClaimType = "Permission", ClaimValue = "ManageCourses" },
                new IdentityRoleClaim<string> { Id = 6, RoleId = "3", ClaimType = "Permission", ClaimValue = "AdminAccess" }
            );

            modelBuilder.Entity<LessonKeyword>()
                .HasKey(lk => new { lk.LessonId, lk.KeywordId });
            modelBuilder.Entity<LessonKeyword>()
                .HasOne(lk => lk.Lesson)
                .WithMany(l => l.LessonKeywords)
                .HasForeignKey(lk => lk.LessonId);
            modelBuilder.Entity<LessonKeyword>()
                .HasOne(lk => lk.Keyword)
                .WithMany(k => k.LessonKeywords)
                .HasForeignKey(lk => lk.KeywordId);

            modelBuilder.Entity<SectionLesson>()
                .HasKey(cl => new { cl.SectionId, cl.LessonId });
            modelBuilder.Entity<SectionLesson>()
                .HasOne(cl => cl.Section)
                .WithMany(c => c.SectionLessons)
                .HasForeignKey(cl => cl.SectionId);
            modelBuilder.Entity<SectionLesson>()
                .HasOne(cl => cl.Lesson)
                .WithMany(l => l.SectionLessons)
                .HasForeignKey(cl => cl.LessonId);

            modelBuilder.Entity<UserSection>()
                .HasKey(us => new { us.SectionId, us.UserId });
            modelBuilder.Entity<UserSection>()
                .HasOne(us => us.Section)
                .WithMany(u => u.UserSections)
                .HasForeignKey(us => us.SectionId);
            modelBuilder.Entity<UserSection>()
                .HasOne(cl => cl.User)
                .WithMany(l => l.UserSections)
                .HasForeignKey(cl => cl.UserId);

            modelBuilder.Entity<UserLesson>()
                .HasKey(us => new { us.LessonId, us.UserId });
            modelBuilder.Entity<UserLesson>()
                .HasOne(us => us.Lesson)
                .WithMany(u => u.UserLessons)
                .HasForeignKey(us => us.LessonId);
            modelBuilder.Entity<UserLesson>()
                .HasOne(cl => cl.User)
                .WithMany(l => l.UserLessons)
                .HasForeignKey(cl => cl.UserId);

            modelBuilder.Entity<Course>()
                .HasMany(c => c.Sections)
                .WithOne(s => s.Course)
                .HasForeignKey(s => s.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Test>()
                .HasMany(t => t.Options)
                .WithOne(o => o.Test)
                .HasForeignKey(o => o.TestId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Lesson>()
                .HasMany(l => l.Tests)
                .WithOne(t => t.Lesson)
                .HasForeignKey(t => t.LessonId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LessonPreviousLesson>()
                .HasKey(lpl => new { lpl.LessonId, lpl.PreviousLessonId });
            modelBuilder.Entity<LessonPreviousLesson>()
                .HasOne(lpl => lpl.Lesson)
                .WithMany(l => l.PreviousLessons) // <--
                .HasForeignKey(lpl => lpl.LessonId);
            modelBuilder.Entity<LessonPreviousLesson>()
                .HasOne(lpl => lpl.PreviousLesson)
                .WithMany(pl => pl.PreviousLessonOf) // <--
                .HasForeignKey(lpl => lpl.PreviousLessonId);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.User)
                .WithMany(u => u.Payments)
                .HasForeignKey(p => p.UserId);
        }

        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Section> Sections { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<SectionLesson> SectionLessons { get; set; }
        public DbSet<LessonPreviousLesson> PreviousLessons { get; set; }
        public DbSet<Keyword> Keywords { get; set; }
        public DbSet<LessonKeyword> LessonKeywords { get; set; }
        public DbSet<Test> Tests { get; set; }
        public DbSet<Option> Options { get; set; }
        public DbSet<UserSection> UserSections { get; set; }
        public DbSet<UserLesson> UserLessons { get; set; }
        public DbSet<Payment> Payments { get; set; }
    }
}