import { useState, useEffect } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { Section } from "../../../app/models/course";
import SectionHeader from "./SectionHeader";
import TableOfSectionLessons from "./TableOfSectionLessons";
import { Grid, TableCell, TableRow, Typography } from "@mui/material";
import AppTextInput from "../../../app/components/AppTextInput";
import { yupResolver } from '@hookform/resolvers/yup';
import { sectionValidationSchema } from "./validationSchemas";
import { Lesson } from "../../../app/models/lesson";
import { useAppDispatch } from "../../../app/store/configureStore";
import agent from "../../../app/api/agent";
import { removeSection, setSection } from "../../courses/coursesSlice";

interface Props {
    section?: Section;
    handleSelectLesson?: (lesson: Lesson | undefined) => void;
    handleSelectTests?: (lesson: Lesson | undefined) => void;
    courseId?: number;
    numberOfNewSection?: number;
}

interface ActionLoadingState {
    submit?: boolean;
    delete?: boolean;
}

export interface LoadingState {
    [key: number]: ActionLoadingState;
}

export default function SectionForm({ section, handleSelectLesson, handleSelectTests, courseId, numberOfNewSection: number }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const dispatch = useAppDispatch();
    const [loadingState, setLoadingState] = useState<LoadingState>({});
    const { control, reset, handleSubmit } = useForm({
        resolver: yupResolver<any>(sectionValidationSchema),
    });

    useEffect(() => {
        if (section) reset(section);
    }, [section, reset]);

    const toggleEdit = () => {
        if (isEditing) {
            reset({
                title: section?.title || "",
                description: section?.description || ""
            });
        }

        setIsEditing(!isEditing);
    };

    const setLoading = (id: number, action: 'submit' | 'delete', isLoading: boolean) => {
        setLoadingState(prevState => ({
            ...prevState,
            [id]: { ...prevState[id], [action]: isLoading }
        }));
    };

    const handleSubmitSection = async (data: FieldValues) => {
        const sectionId = section ? section.id : -1;
        setLoading(sectionId, 'submit', true);

        try {
            let response: Section;
            if (section) {
                const updatedSection = { ...section, ...data };
                response = await agent.Section.update(section.id, updatedSection);
            } else {
                const newSection = { ...data, courseId, number };
                response = await agent.Section.create(newSection);
            }

            dispatch(setSection(response));
            toggleEdit();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(sectionId, 'submit', false);
        }
    }

    const handleDeleteSection = async (id: number) => {
        setLoading(id, 'delete', true);

        try {
            await agent.Section.delete(id);
            if (courseId) dispatch(removeSection({ id, courseId }));
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(id, 'delete', false);
        }
    };

    return courseId ?
        <>
            <SectionHeader
                section={section}
                handleEditClick={toggleEdit}
                handleSubmitData={handleSubmit(handleSubmitSection)}
                handleDeleteData={handleDeleteSection}
                isEditing={isEditing}
                loadingState={loadingState}
            />

            {isEditing && (
                <TableRow>
                    <TableCell style={{}} colSpan={3}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <AppTextInput
                                    control={control}
                                    name='title'
                                    label="Назва секції"
                                    type="text"
                                />
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <AppTextInput
                                    control={control}
                                    name='description'
                                    label="Опис"
                                    multiline={true}
                                    rows={2}
                                    type="text"
                                />
                            </Grid>
                        </Grid>
                    </TableCell >
                </TableRow>
            )}

            {handleSelectLesson && <TableOfSectionLessons section={section} handleSelectLesson={handleSelectLesson} handleSelectTests={handleSelectTests}/>}
        </>
        : <TableRow sx={{ backgroundColor: '#e8e9eb' }}>
            <TableCell align="center" colSpan={4}>
                <Typography>Щоб створити розділи та уроки, спочатку збережіть курс</Typography>
            </TableCell>
        </TableRow>
}