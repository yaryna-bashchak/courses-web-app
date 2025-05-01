import { Typography, Button, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, useTheme, useMediaQuery, IconButton } from "@mui/material";
import { Edit, Delete, Visibility, VisibilityOff, Link } from "@mui/icons-material";
import useCourses from "../../app/hooks/useCourses";
import { useEffect, useState } from "react";
import { Course, Section } from "../../app/models/course";
import { Lesson } from "../../app/models/lesson";
import CourseForm from "./courseForm/CourseForm";
import LessonForm from "./lessonForm/LessonForm";
import LoadingComponent from "../../app/layout/LoadingComponent";
import agent from "../../app/api/agent";
import { removeCourse, setCourse } from "../courses/coursesSlice";
import { LoadingButton } from "@mui/lab";
import { useAppDispatch } from "../../app/store/configureStore";

type EditMode = 'false' | 'course' | 'lesson';

export default function CourseEditor() {
    const { courses, status, coursesLoaded } = useCourses({ onlyEditableByUser: true });
    const [isCoursesRequestMade, setIsCoursesRequestMade] = useState(coursesLoaded);
    const [editMode, setEditMode] = useState<EditMode>('false');
    const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(undefined);
    const [selectedSection, setSelectedSection] = useState<Section | undefined>(undefined);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | undefined>(undefined);
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [target, setTarget] = useState(0);
    const [activationLoading, setActivationLoading] = useState(false);
    const [activationTarget, setActivationTarget] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (status === 'pendingFetchCourses') {
            setIsCoursesRequestMade(true);
        }
    }, [status]);

    const handleSelectCourse = (course: Course) => {
        setSelectedCourse(course);
        setEditMode('course');
    }

    const handleDeleteCourse = (id: number) => {
        setLoading(true);
        setTarget(id);
        agent.Course.delete(id)
            .then(() => dispatch(removeCourse(id)))
            .catch(error => console.log(error))
            .finally(() => setLoading(false));
    }

    const handleToggleActiveCourse = async (course: Course) => {
        setActivationLoading(true);
        setActivationTarget(course.id);

        try {
            const updatedCourse = await agent.Course.update(course.id, { ...course, isActive: !course.isActive });
            dispatch(setCourse(updatedCourse));
        } catch (error) {
            console.log(error);
        } finally {
            setActivationLoading(false);
        }
    }

    const handleSelectLesson = (section: Section | undefined) => (lesson: Lesson | undefined,) => {
        setSelectedSection(section);
        setSelectedLesson(lesson);
        setEditMode('lesson');
    }

    const cancelEdit = () => {
        if (editMode === 'lesson') {
            if (selectedLesson) setSelectedLesson(undefined);
            if (selectedSection) setSelectedSection(undefined);
            setEditMode('course');
            return;
        }
        if (editMode === 'course') {
            if (selectedCourse) setSelectedCourse(undefined);
            setEditMode('false');
        }
    }

    if (isCoursesRequestMade === false || status.includes('pending')) return <LoadingComponent />
    if (editMode === 'course') return <CourseForm course={selectedCourse} cancelEdit={cancelEdit} handleSelectLesson={handleSelectLesson} setSelectedCourse={setSelectedCourse} />
    if (editMode === 'lesson' && selectedSection)
        return <LessonForm
            lesson={selectedLesson}
            section={selectedSection}
            cancelEdit={cancelEdit}
            numberOfNewLesson={
                selectedSection.lessons ?
                    selectedSection.lessons.reduce((max, lesson) => lesson.number > max ? lesson.number : max, 0) + 1
                    : 1}
        />

    return (
        <>
            <Box display='flex' justifyContent='space-between'>
                <Typography sx={{ p: 2 }} variant='h4'>Редактор Курсів</Typography>
                <Button onClick={() => setEditMode('course')} sx={{ m: 2 }} size='large' variant='contained'>Створити</Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" sx={{ width: '25%' }}>Назва курсу</TableCell>
                            {!isMobile && <>
                                <TableCell align="right" sx={{ width: '12%' }}>Повна ціна</TableCell>
                                <TableCell align="right" sx={{ width: '15%' }}>Ціна розділу</TableCell>
                                <TableCell align="right" sx={{ width: '10%' }}>Розділів</TableCell>
                                <TableCell align="left" sx={{ width: '13%' }}>Стан</TableCell>
                            </>}
                            <TableCell align="right" sx={{ width: '25%' }}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses.length > 0
                            ? courses.map((course) => (
                                <TableRow
                                    key={course.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell align="left">{course.title}</TableCell>
                                    {!isMobile && <>

                                        <TableCell align="right">{course.priceFull}</TableCell>
                                        <TableCell align="right">{course.priceMonthly}</TableCell>
                                        <TableCell align="right">{course.sections.length}</TableCell>
                                        <TableCell align="left">{course.isActive ? "Активний" : "Неактивний"}</TableCell>
                                    </>}
                                    <TableCell align="right">
                                        <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                                            <IconButton onClick={() => handleSelectCourse(course)} color='primary'>
                                                <Edit />
                                            </IconButton>
                                            <LoadingButton
                                                loading={activationLoading && activationTarget === course.id}
                                                onClick={() => handleToggleActiveCourse(course)}
                                                color={course.isActive ? 'inherit' : 'success'}
                                                sx={course.isActive ? { color: 'gray', minWidth: 0, padding: 1 } : { minWidth: 0, padding: 1 }}
                                            >
                                                {course.isActive ? <VisibilityOff /> : <Visibility />}
                                            </LoadingButton>
                                            <LoadingButton sx={{ minWidth: 0, padding: 1, color: 'grey' }}>
                                                <Link />
                                            </LoadingButton>
                                            <LoadingButton loading={loading && target === course.id} onClick={() => handleDeleteCourse(course.id)} sx={{ minWidth: 0, padding: 1 }} color='error'>
                                                <Delete />
                                            </LoadingButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                            : <TableRow sx={{ backgroundColor: '#e8e9eb' }}>
                                <TableCell align="center" colSpan={7}>
                                    <Typography>У вас поки немає створених курсів</Typography>
                                </TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}