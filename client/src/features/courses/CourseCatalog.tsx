import LoadingComponent from "../../app/layout/LoadingComponent";
import useCourses from "../../app/hooks/useCourses";
import CourseCategory from "./CourseCategory";
import stageOfCourse from "./stageOfCourse";
import { Course } from "../../app/models/course";
import { useAppSelector } from "../../app/store/configureStore";
import { User } from "../../app/models/user";

function splitCourses(courses: Course[], user?: User | null): { title: string, courses: Course[] }[] {
    
    const ownCourses: Course[] = [];
    const myCourses: Course[] = [];
    const otherCourses: Course[] = [];

    courses.forEach(course => {
        if (course.createdBy === user?.id) {
            ownCourses.push(course);
        } else
        if (stageOfCourse(course) === "notBought") {
            otherCourses.push(course);
        } else {
            myCourses.push(course);
        }
    });

    return [
        { title: "Створені мною", courses: ownCourses },
        { title: "Мої курси", courses: myCourses },
        { title: "Доступні курси", courses: otherCourses }
    ];
}

export default function CourseCatalog() {
    const { courses, status } = useCourses({ onlyActive: true });
    const { user } = useAppSelector(state => state.account);

    if (status.includes('pending')) return <LoadingComponent />

    const splitedCourses = splitCourses(courses, user);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {splitedCourses.map((courseCategory, index) =>
                courseCategory.courses.length > 0 && <CourseCategory courseCategory={courseCategory} key={index + 1} />
            )}
        </div>
    )
}