import { useTheme, useMediaQuery, Box, Typography, Button, Paper, Table, TableBody, TableContainer } from "@mui/material";
import { ArrowBack } from '@mui/icons-material';
import { useEffect } from "react";
import { fetchTestsAsync, testSelectors } from "../../tests/testsSlice";
import { useAppDispatch, useAppSelector } from "../../../app/store/configureStore";
import QuestionForm from "./QuestionForm";
import LoadingComponent from "../../../app/layout/LoadingComponent";

interface Props {
    lessonId?: number;
    cancelEdit: () => void;
}

export default function TestsForm({ lessonId, cancelEdit }: Props) {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const tests = useAppSelector(testSelectors.selectAll);
    const { status } = useAppSelector(state => state.tests);

    useEffect(() => {
        dispatch(fetchTestsAsync(lessonId!));
    }, []);

    if (status.includes('pending')) return <LoadingComponent />;

    return (
        <Box sx={{ p: isMobile ? 2 : 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'start' }}>
                <Button startIcon={<ArrowBack />} variant="outlined" onClick={cancelEdit}>Назад</Button>
            </Box>
            <Box display='flex' justifyContent='space-between'>
                <Typography sx={{ mt: '24px' }} variant='h4'>Тести</Typography>
            </Box>
            <TableContainer component={Paper} sx={{ mt: '16px' }}>
                <Table>
                    <TableBody>
                        {tests.map((test, index) =>
                            <QuestionForm question={test} index={index + 1} key={index} />)}
                        <QuestionForm lessonId={lessonId} />
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}
