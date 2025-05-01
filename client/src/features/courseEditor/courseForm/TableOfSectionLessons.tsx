import { useMediaQuery, TableRow, TableCell, Table, TableHead, TableBody, useTheme } from "@mui/material";
import LessonLine from "./LessonLine";
import { Section } from "../../../app/models/course";
import { Lesson } from "../../../app/models/lesson";
import { useState } from "react";
import { LoadingState } from "./SectionForm";
import agent from "../../../app/api/agent";
import { useAppDispatch } from "../../../app/store/configureStore";
import { removeLesson } from "../../courses/coursesSlice";

interface Props {
    section?: Section;
    handleSelectLesson?: (lesson: Lesson | undefined) => void;
}

export default function TableOfSectionLessons({ section, handleSelectLesson }: Props) {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [loadingState, setLoadingState] = useState<LoadingState>({});
    

    const setLoading = (id: number, action: 'submit' | 'delete', isLoading: boolean) => {
        setLoadingState(prevState => ({
            ...prevState,
            [id]: { ...prevState[id], [action]: isLoading }
        }));
    };
    
    const handleDeleteLesson = async (id: number) => {
        setLoading(id, 'delete', true);

        try {
            if (section) {
                await agent.Section.update(section.id, { ...section, lessonIdsToDelete: [id] });
                dispatch(removeLesson({ id, sectionId: section.id }));
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(id, 'delete', false);
        }
    };

    return (
        <>
            {section &&
                <TableRow>
                    <TableCell style={{ padding: isMobile ? 0 : '0 16px 0 40px' }} colSpan={4}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" sx={{ width: '50%' }}>Назва уроку</TableCell>
                                    <TableCell align="right" sx={{ width: '15%' }}>Відео</TableCell>
                                    <TableCell align="right" sx={{ width: '35%' }}></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {section?.lessons?.map((lesson) => (
                                    <LessonLine key={lesson.id} lesson={lesson} loadingState={loadingState} handleSelectLesson={handleSelectLesson} handleDeleteLesson={handleDeleteLesson} />
                                ))}
                                <LessonLine handleSelectLesson={handleSelectLesson} />
                            </TableBody>
                        </Table>
                    </TableCell>
                </TableRow>
            }
        </>
    )
}