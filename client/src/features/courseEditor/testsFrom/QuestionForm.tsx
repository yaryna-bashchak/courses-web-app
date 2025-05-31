import { Table, TableBody, TableCell, TableHead, TableRow, useMediaQuery, useTheme } from "@mui/material";
import { Test } from "../../../app/models/test";
import QuestionHeader from "./QuestionHeader";
import OptionLine from "./OptionLine";
import { useState } from "react";
import agent from "../../../app/api/agent";
import { Option } from "../../../app/models/test";
import { useAppDispatch } from "../../../app/store/configureStore";
import { setOption } from "../../tests/testsSlice";

interface Props {
    question?: Test;
    index?: number;
    lessonId?: number;
}

export default function QuestionForm({ question, index, lessonId }: Props) {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [loadingAnswer, setLoadingAnswer] = useState<number | null>(null);

    const handleSelectAnswer = async (option: Option) => {
        const currentAnswerId = question?.options.find(o => o.isAnswer)?.id;
        if (option.id === currentAnswerId) return;

        setLoadingAnswer(option.id);

        try {
            let prevAnswerResponse;
            if (currentAnswerId) {
                const currentAnswer = question?.options.find(o => o.id === currentAnswerId);
                prevAnswerResponse = await agent.Option.update(currentAnswerId, { ...currentAnswer, isAnswer: false });
            }

            const response = await agent.Option.update(option.id, { ...option, isAnswer: true });
            dispatch(setOption(response));
            if (prevAnswerResponse) dispatch(setOption(prevAnswerResponse));
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingAnswer(null);
        }
    }

    return (<>
        <QuestionHeader
            question={question}
            index={index}
            lessonId={lessonId}
        />

        {question && (<TableRow>
            <TableCell style={{ padding: isMobile ? 0 : '0 16px 0 40px' }} colSpan={4}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ '& th': { py: 1.2 } }}>
                            <TableCell align="left" sx={{ width: '10%' }}></TableCell>
                            <TableCell align="left" sx={{ width: '50%' }}>Варіанти відповідей</TableCell>
                            <TableCell align="right" sx={{ width: '40%' }}></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {question?.options.map((option) => (
                            <OptionLine key={option.id} option={option} testId={question.id} loadingAnswer={loadingAnswer} handleSelectAnswer={handleSelectAnswer} />
                        ))}
                        <OptionLine testId={question.id} loadingAnswer={loadingAnswer} handleSelectAnswer={handleSelectAnswer} />
                    </TableBody>
                </Table>
            </TableCell>
        </TableRow>)}
    </>)
}