import { TextField, debounce } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
// import StarPurple500RoundedIcon from '@mui/icons-material/StarPurple500Rounded';
import { setLessonParams } from "../courses/coursesSlice";
import { useParams } from "react-router-dom";
import { useState } from "react";

export default function Filters() {
    const dispatch = useAppDispatch();
    const { courseId } = useParams<{ courseId: string }>();
    const courseStatus = useAppSelector(state => state.courses.individualCourseStatus[parseInt(courseId!)]);
    const { lessonParams } = courseStatus || {};
    const [searchTerm, setSearchTerm] = useState(lessonParams?.searchTerm || '');

    const debouncedSearch = debounce((event: any) => {
        dispatch(setLessonParams({ searchTerm: event.target.value, courseId: parseInt(courseId!) }))
    }, 1000)

    return (
        <>
            {lessonParams ?
                <>
                    <TextField
                        label='Знайти...'
                        variant='outlined'
                        size="small"
                        value={searchTerm || ''}
                        onChange={(event: any) => {
                            setSearchTerm(event.target.value);
                            debouncedSearch(event);
                        }}
                    />
                </> : <></>}
        </>
    )
}