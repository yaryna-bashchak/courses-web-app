using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Dtos.Keyword;
using API.Dtos.Lesson;
using API.Dtos.LessonKeyword;
using API.Entities;
using AutoMapper;

namespace API
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<Lesson, GetLessonDto>()
                .ForMember(dto => dto.Keywords, l => l.MapFrom(l => l.LessonKeywords.Select(lk => lk.Keyword)))
                .ForMember(dto => dto.PreviousLessons, l => l.MapFrom(l => l.PreviousLessons.Select(lpl => lpl.PreviousLesson)));
            CreateMap<AddLessonDto, Lesson>();
            CreateMap<Lesson, GetPreviousLessonDto>();
            
            CreateMap<Keyword, GetKeywordDto>();
            CreateMap<AddKeywordDto, Keyword>();

            CreateMap<AddLessonKeywordDto, LessonKeyword>();
            CreateMap<LessonKeyword, AddLessonKeywordDto>();
        }
    }
}