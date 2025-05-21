import { Edit, Close, Done, Delete, Add } from "@mui/icons-material";
import { TableRow, TableCell, Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Test } from "../../../app/models/test";
import { useEffect, useState } from "react";
import { questionValidationSchema } from "../courseForm/validationSchemas";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import AppTextInput from "../../../app/components/AppTextInput";
import { useAppDispatch } from "../../../app/store/configureStore";
import agent from "../../../app/api/agent";
import { removeQuestion, setQuestion } from "../../tests/testsSlice";

interface Props {
    question?: Test;
    index?: number;
    lessonId?: number;
}

interface ActionLoadingState {
    submit?: boolean;
    delete?: boolean;
}

export default function QuestionHeader({ question, index, lessonId }: Props) {
    const questionId = question ? question.id : -1;
    const dispatch = useAppDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [loadingState, setLoadingState] = useState<ActionLoadingState>({});

    const { control, reset, handleSubmit } = useForm({
        resolver: yupResolver<any>(questionValidationSchema),
    });

    useEffect(() => {
        if (question) reset(question);
    }, [question, reset]);

    const setLoading = (action: 'submit' | 'delete', isLoading: boolean) => {
        setLoadingState(prevState => ({
            ...prevState,
            [action]: isLoading
        }));
    };

    const toggleEdit = () => {
        if (isEditing) {
            reset({
                question: question?.question || ""
            });
        }

        setIsEditing(!isEditing);
    };

    const handleSubmitQuestion = async (data: FieldValues) => {
        setLoading('submit', true);

        try {
            let response: Test;
            if (questionId !== -1) {
                const updatedTest = { ...question, ...data };
                response = await agent.Test.update(questionId, updatedTest);
            } else {
                const newTest = { ...data, lessonId };
                response = await agent.Test.create(newTest);
            }

            dispatch(setQuestion(response));
            toggleEdit();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading('submit', false);
        }
    }

    const handleDeleteQuestion = async (id: number) => {
        setLoading('delete', true);

        agent.Test.delete(id)
            .then(() => dispatch(removeQuestion(id)))
            .catch(error => console.log(error))
            .finally(() => setLoading('delete', false));
    }

    const newQuestionMode = !question && !isEditing;
    const editMode = isEditing;
    const viewMode = question && !isEditing;

    return (
        <>
            <TableRow sx={{
                backgroundColor: '#d0e3f7',
                '&:last-child td, &:last-child th': { border: 0 },
                height: '75px'
            }}>
                {(viewMode || editMode) &&
                    <TableCell component="th" scope="row" sx={{ width: '6%', fontSize: '1.1rem' }}>
                        {index ? `${index})` : ""}
                    </TableCell>
                }

                {editMode &&
                    <TableCell sx={{ p: 0 }}>
                        <AppTextInput
                            control={control}
                            name='question'
                            label="Питання"
                            type="text"
                            InputProps={{
                                style: { backgroundColor: '#f7f9fc' }
                            }} />
                    </TableCell>
                }

                {viewMode &&
                    <TableCell align="left" sx={{ width: '60%', fontSize: '1.1rem' }}>{question?.question}</TableCell>
                }

                {(viewMode || editMode) &&
                    <TableCell align="right" sx={{ width: '34%' }} colSpan={2}>
                        {editMode && <>
                            <LoadingButton loading={loadingState.submit} onClick={handleSubmit(handleSubmitQuestion)} color='success'><Done /></LoadingButton>
                            <Button onClick={toggleEdit} color='error'><Close /></Button>
                        </>}
                        <Button onClick={toggleEdit} disabled={isEditing}><Edit /></Button>
                        <LoadingButton loading={loadingState.delete} onClick={() => handleDeleteQuestion(questionId)} color='error' disabled={isEditing}><Delete /></LoadingButton>
                    </TableCell>}

                {newQuestionMode &&
                    <TableCell align="center" colSpan={4}>
                        <Button onClick={toggleEdit} size="large" startIcon={<Add />}>додати питання</Button>
                    </TableCell>
                }
            </TableRow>
        </>
    )
}