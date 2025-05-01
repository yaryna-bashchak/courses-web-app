import { Edit, Delete, Add, Checklist } from "@mui/icons-material";
import { TableRow, TableCell, Button } from "@mui/material";
import { Lesson } from "../../../app/models/lesson";
import { LoadingState } from "./SectionForm";
import { LoadingButton } from "@mui/lab";

interface Props {
    lesson?: Lesson;
    handleSelectLesson?: (lesson: Lesson | undefined) => void;
    handleDeleteLesson?: (id: number) => void;
    handleSelectTests?: (lesson: Lesson | undefined) => void;
    loadingState?: LoadingState;
}

export default function LessonLine({ lesson, handleSelectLesson, handleSelectTests, handleDeleteLesson, loadingState }: Props) {
    return (
        <>
            <TableRow
                key={lesson?.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                {handleSelectLesson && (lesson && handleDeleteLesson && handleSelectTests ? <>
                    <TableCell align="left">{lesson?.title}</TableCell>
                    <TableCell align="right">{[lesson?.urlTheory, lesson?.urlPractice].filter(Boolean).length}/2</TableCell>
                    <TableCell align="right">
                        <Button onClick={() => handleSelectLesson(lesson)} startIcon={<Edit />} sx={{pr: 2, pl: 2}}>урок</Button>
                        <Button onClick={() => handleSelectTests(lesson)} startIcon={<Checklist />} sx={{pr: 1, pl: 2}} color='success'>тести</Button>
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