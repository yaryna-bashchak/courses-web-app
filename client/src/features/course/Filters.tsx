import { Button, TextField, debounce } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
// import StarPurple500RoundedIcon from '@mui/icons-material/StarPurple500Rounded';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { grey, yellow } from '@mui/material/colors';
import { setLessonParams } from "../courses/coursesSlice";
import { useParams } from "react-router-dom";
import { useState } from "react";

export default function Filters() {
    const dispatch = useAppDispatch();
    const { courseId } = useParams<{ courseId: string }>();
    const courseStatus = useAppSelector(state => state.courses.individualCourseStatus[parseInt(courseId!)]);
    const { lessonParams } = courseStatus || {};
    const [searchTerm, setSearchTerm] = useState(lessonParams?.searchTerm || '');

    const getBoolButtonStyle = (state: boolean) => {
        if (state) return styles.checked;
        return styles.unchecked;
    }

    const styles = {
        unchecked: {
            textTransform: 'none',
            fontSize: 11,
            '& .MuiButton-endIcon': {
                marginLeft: '2px',
                color: grey[400],
            },
        },
        checked: {
            textTransform: 'none',
            fontSize: 11,
            borderColor: 'transparent',
            color: 'rgb(0, 140, 0)',
            boxShadow: '0 0 0 0.1rem rgba(0,155,0,.5)',
            '&:hover': {
                borderColor: 'rgba(0, 155, 0,.5)',
                boxShadow: '0 0 0 0.1rem rgba(0, 155, 0, 0.5)',
            },
            '& .MuiButton-endIcon': {
                marginLeft: '2px',
                color: yellow[800],
            },
        }
    };

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