import { Table, TableBody, TableCell, TableHead, TableRow, useMediaQuery, useTheme } from "@mui/material";
import { Test } from "../../../app/models/test";
import QuestionHeader from "./QuestionHeader";
import OptionLine from "./OptionLine";

interface Props {
    question?: Test;
    index?: number;
    lessonId?: number;
}

export default function QuestionForm({ question, index, lessonId }: Props) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                            <OptionLine key={option.id} option={option} testId={question.id} />
                        ))}
                        <OptionLine testId={question.id} />
                    </TableBody>
                </Table>
            </TableCell>
        </TableRow>)}
    </>)
}