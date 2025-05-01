import CourseCard from "./CourseCard";
import { Course } from "../../app/models/course";
import { Typography } from "@mui/material";

interface Props {
    courseCategory: { title: string, courses: Course[] },
}

export default function CourseCategory({ courseCategory }: Props) {
    const {title, courses} = courseCategory;

    return (
        <div>
            <Typography variant="h5">{title}</Typography>
            {courses.length === 0
                ? <Typography>Курсів не знайдено</Typography>
                : <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                    {courses.sort((a, b) => a.id - b.id).map((course) =>
                        <CourseCard courseId={course.id} key={course.id + 1} />
                    )}
                </div>}
        </div>
    )
}