import { Typography, Grid, Box, Button, useMediaQuery, useTheme } from "@mui/material";
import { FieldValues, useForm } from "react-hook-form";
import AppTextInput from "../../../app/components/AppTextInput";
import { Lesson } from "../../../app/models/lesson";
import { useEffect, useState } from "react";
import AppDropzone from "../../../app/components/AppDropzone";
import { yupResolver } from '@hookform/resolvers/yup';
import { lessonValidationSchema } from "../courseForm/validationSchemas";
import VideoPreview from "./VideoPreview";
import agent from "../../../app/api/agent";
import { setLesson } from "../../courses/coursesSlice";
import { useAppDispatch } from "../../../app/store/configureStore";
import { LoadingButton } from "@mui/lab";
import { Section } from "../../../app/models/course";

interface Props {
    lesson?: Lesson;
    cancelEdit: () => void;
    section: Section;
    numberOfNewLesson: number
}

export default function LessonForm({ lesson, cancelEdit, section, numberOfNewLesson: number }: Props) {
    const dispatch = useAppDispatch();
    const [theoryPreviewUrl, setTheoryPreviewUrl] = useState<string | undefined>(undefined);
    const [practicePreviewUrl, setPracticePreviewUrl] = useState<string | undefined>(undefined);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const { control, reset, handleSubmit, formState: { isDirty, isSubmitting } } = useForm({
        resolver: yupResolver<any>(lessonValidationSchema)
    });

    useEffect(() => {
        if (lesson && !isDirty) reset(lesson);
        return () => {
            if (theoryPreviewUrl) URL.revokeObjectURL(theoryPreviewUrl);
            if (practicePreviewUrl) URL.revokeObjectURL(practicePreviewUrl);
        }
    }, [isDirty, lesson, practicePreviewUrl, reset, theoryPreviewUrl]);

    const handleSubmitData = async (data: FieldValues) => {
        try {
            let response: Lesson;
            if (lesson) {
                response = await agent.Lesson.update(lesson.id, data);
            } else {
                const newLesson = { ...data, number }
                response = await agent.Lesson.create(newLesson);
                await agent.Section.update(section.id, { ...section, lessonIdsToAdd: [response.id] })
            }

            cancelEdit();
            dispatch(setLesson({ lesson: response, sectionId: section.id }));
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Box sx={{ p: isMobile ? 2 : 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Урок
            </Typography>
            <form onSubmit={handleSubmit(handleSubmitData)}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={12}>
                        <AppTextInput control={control} name='title' label='Назва уроку' />
                    </Grid>
                    <Grid item xs={12}>
                        <AppTextInput multiline={true} rows={4} control={control} name='description' label='Опис' />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>
                            Теорія
                        </Typography>
                        <Box display='flex' flexWrap='wrap' sx={{gap: '10px'}} justifyContent='space-between' alignItems='center'>
                            <AppDropzone control={control} name='theoryFile' setPreviewUrl={setTheoryPreviewUrl} currentPreviewUrl={theoryPreviewUrl} />
                            <VideoPreview newVideoUrl={theoryPreviewUrl} initialVideoUrl={lesson?.urlTheory} />
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>
                            Практика
                        </Typography>
                        <Box display='flex' flexWrap='wrap' sx={{gap: '10px'}} justifyContent='space-between' alignItems='center'>
                            <AppDropzone control={control} name='practiceFile' setPreviewUrl={setPracticePreviewUrl} currentPreviewUrl={practicePreviewUrl} />
                            <VideoPreview newVideoUrl={practicePreviewUrl} initialVideoUrl={lesson?.urlPractice} />
                        </Box>
                    </Grid>
                </Grid>
                <Box display='flex' justifyContent='space-between' sx={{ mt: 3 }}>
                    <Button onClick={cancelEdit} variant='contained' color='inherit'>Відмінити</Button>
                    <LoadingButton loading={isSubmitting} type="submit" variant='contained' color='success'>Зберегти</LoadingButton>
                </Box>
            </form>
        </Box>
    )
}