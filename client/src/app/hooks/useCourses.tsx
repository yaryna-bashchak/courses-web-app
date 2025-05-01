import { useEffect, useMemo } from "react";
import { courseSelectors, fetchCoursesAsync } from "../../features/courses/coursesSlice";
import { useAppSelector, useAppDispatch } from "../store/configureStore";
import { Course } from "../models/course";

interface UseCoursesParams {
    onlyActive?: boolean;
    onlyEditableByUser?: boolean;
}

export default function useCourses({ onlyActive = false, onlyEditableByUser = false}: UseCoursesParams = {}) {
    const allCourses = useAppSelector(courseSelectors.selectAll);
    const { user } = useAppSelector(state => state.account);
    const { coursesLoaded, status } = useAppSelector(state => state.courses);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!coursesLoaded) dispatch(fetchCoursesAsync())
    }, [coursesLoaded, dispatch])

    const filteredCourses = useMemo(() => {
        return allCourses.filter((course: Course) => {
            if (onlyActive && !course.isActive) return false;

            if (onlyEditableByUser) {
                if (!user) return false;
                const isCreator = course.createdBy === user.username;
                const isAdmin = user.claims?.includes('Permission: AdminAccess');
                return isCreator || isAdmin;
            }

            return true;
        });
    }, [allCourses, onlyActive, onlyEditableByUser, user]);

    return {
        courses: filteredCourses,
        coursesLoaded,
        status
    }
}