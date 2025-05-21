import { Edit, Delete, Add, CheckCircle, Cancel, Close, Done } from "@mui/icons-material";
import { TableRow, TableCell, Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Option } from "../../../app/models/test";
import { useAppDispatch } from "../../../app/store/configureStore";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { optionValidationSchema } from "../courseForm/validationSchemas";
import { FieldValues, useForm } from "react-hook-form";
import agent from "../../../app/api/agent";
import { removeOption, setOption } from "../../tests/testsSlice";
import AppTextInput from "../../../app/components/AppTextInput";

interface Props {
    option?: Option;
    testId?: number;
}

interface ActionLoadingState {
    submit?: boolean;
    delete?: boolean;
}

export default function OptionLine({ option, testId }: Props) {
    const optionId = option ? option.id : -1;
    const dispatch = useAppDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [loadingState, setLoadingState] = useState<ActionLoadingState>({});

    const { control, reset, handleSubmit } = useForm({
        resolver: yupResolver<any>(optionValidationSchema),
    });

    useEffect(() => {
        if (option) reset(option);
    }, [option, reset]);

    const setLoading = (action: 'submit' | 'delete', isLoading: boolean) => {
        setLoadingState(prevState => ({
            ...prevState,
            [action]: isLoading
        }));
    };

    const toggleEdit = () => {
        if (isEditing) {
            reset({
                text: option?.text || ""
            });
        }

        setIsEditing(!isEditing);
    };

    const handleSubmitOption = async (data: FieldValues) => {
        setLoading('submit', true);

        try {
            let response: Option;
            if (optionId !== -1) {
                const updatedOption = { ...option, ...data };
                response = await agent.Option.update(optionId, updatedOption);
            } else {
                const newOption = { ...data, testId };
                response = await agent.Option.create(newOption);
            }

            dispatch(setOption(response));
            toggleEdit();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading('submit', false);
        }
    }

    const handleDeleteOption = async (id: number) => {
        setLoading('delete', true);

        agent.Option.delete(id)
            .then(() => dispatch(removeOption({ id, testId })))
            .catch(error => console.log(error))
            .finally(() => setLoading('delete', false));
    }

    const newOptionMode = !option && !isEditing;
    const editMode = isEditing;
    const viewMode = option && !isEditing;

    return (
        <>
            <TableRow
                key={option?.id}
                sx={{
                    '&:last-child td, &:last-child th': { border: 0, py: 1 },
                    '& td': { py: 0.5 },
                    '& .MuiInputBase-input': { py: 0 },
                }}
            >
                {(viewMode || editMode) &&
                    <TableCell sx={{ px: 0.5 }} align="center">
                        {option && (option.isAnswer
                            ? <Button color='success'><CheckCircle /></Button>
                            : <Button color='error'><Cancel /></Button>)
                        }
                    </TableCell>
                }

                {editMode &&
                    <TableCell>
                        <AppTextInput
                            control={control}
                            name='text'
                            type="text"
                            InputProps={{
                                sx: { py: 0.5 }
                            }}
                        />
                    </TableCell>
                }

                {viewMode &&
                    <TableCell align="left" sx={{ fontSize: '1.1rem' }}>{option.text}</TableCell>
                }

                {(viewMode || editMode) &&
                    <TableCell align="right" colSpan={2}>
                        {editMode && <>
                            <LoadingButton loading={loadingState.submit} onClick={handleSubmit(handleSubmitOption)} color='success'><Done /></LoadingButton>
                            <Button onClick={toggleEdit} color='error'><Close /></Button>
                        </>}
                        <Button onClick={toggleEdit} disabled={isEditing}><Edit /></Button>
                        <LoadingButton loading={loadingState.delete} onClick={() => handleDeleteOption(optionId)} color='error' disabled={isEditing}><Delete /></LoadingButton>
                    </TableCell>}

                {newOptionMode &&
                    <TableCell align="center" colSpan={4}>
                        <Button onClick={toggleEdit} startIcon={<Add />}>варіант відповіді</Button>
                    </TableCell>
                }
            </TableRow>
        </>
    )
}