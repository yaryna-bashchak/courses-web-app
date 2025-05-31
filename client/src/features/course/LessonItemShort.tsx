import { ListItemButton, ListItemText } from "@mui/material";
import { Lesson } from "../../app/models/lesson";
import { Link, useParams } from "react-router-dom";

interface Props {
    icon: JSX.Element;
    lesson: Lesson;
    isAvailable: boolean;
}

export default function LessonItemShort({ icon, lesson, isAvailable }: Props) {
    const { courseId } = useParams<{ courseId: string }>();

    return (
        <>
            <Link to={isAvailable ? `/course/${courseId}/lesson/${lesson.id}` : ''} style={{ textDecoration: 'none', color: 'rgba(0, 0, 0, 0.87)' }}>
                <ListItemButton disabled={!isAvailable} sx={{ p: "4px 16px" }}>
                    <ListItemText>
                        <span style={{ display: "flex", alignItems: "center" }}>
                            {icon}
                            {lesson.number}. {lesson.title}
                        </span>
                    </ListItemText>
                </ListItemButton>
            </Link>
        </>
    )
}