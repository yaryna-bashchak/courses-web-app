import { Edit, Delete, Add } from "@mui/icons-material";
import { TableRow, TableCell, Button, useMediaQuery, useTheme } from "@mui/material";
import { Lesson } from "../../../app/models/lesson";
import { LoadingState } from "./SectionForm";
import { LoadingButton } from "@mui/lab";

interface Props {
    lesson?: Lesson;
    handleSelectLesson?: (lesson: Lesson | undefined) => void;
    handleDeleteLesson?: (id: number) => void;
    loadingState?: LoadingState;
}

export default function LessonLine({ lesson, handleSelectLesson, handleDeleteLesson, loadingState }: Props) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <>
            <TableRow
                key={lesson?.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                {handleSelectLesson && (lesson && handleDeleteLesson ? <>
                    <TableCell component="th" scope="row">
                        {lesson?.id}
                    </TableCell>
                    <TableCell align="left">{lesson?.title}</TableCell>
                    {/* {!isMobile && <TableCell align="center">{lesson?.importance}</TableCell>} */}
                    <TableCell align="right">
                        <Button onClick={() => handleSelectLesson(lesson)} startIcon={<Edit />} />
                        <LoadingButton loading={loadingState?.[lesson.id]?.delete} onClick={() => handleDeleteLesson(lesson.id)} startIcon={<Delete />} color='error' />
                    </TableCell>
                </> : <>
                    <TableCell align="center" colSpan={4}>
                        <Button onClick={() => handleSelectLesson(undefined)} startIcon={<Add />}>додати урок</Button>
                    </TableCell>
                </>)
                }
            </TableRow>
        </>
    )
}