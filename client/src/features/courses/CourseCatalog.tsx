import LoadingComponent from "../../app/layout/LoadingComponent";
import useCourses from "../../app/hooks/useCourses";
import CourseCategory from "./CourseCategory";
import stageOfCourse from "./stageOfCourse";
import { Course } from "../../app/models/course";

function splitCourses(courses: Course[]): { title: string, courses: Course[] }[] {
    const myCourses: Course[] = [];
    const otherCourses: Course[] = [];

    courses.forEach(course => {
        if (stageOfCourse(course) === "notBought") {
            otherCourses.push(course);
        } else {
            myCourses.push(course);
        }
    });

    return [
        { title: "Мої курси", courses: myCourses },
        { title: "Інші курси", courses: otherCourses }
    ];
}

export default function CourseCatalog() {
    const { courses, status } = useCourses({ onlyActive: true });

    if (status.includes('pending')) return <LoadingComponent />

    const splitedCourses = splitCourses(courses);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {splitedCourses.map((courseCategory, index) =>
                <CourseCategory courseCategory={courseCategory} key={index + 1} />
            )}
        </div>
    )
}