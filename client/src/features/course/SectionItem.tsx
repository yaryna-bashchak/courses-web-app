import { Box, Button, Collapse, Link, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { green, grey, yellow } from '@mui/material/colors';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Section } from "../../app/models/course";
import { Lesson } from "../../app/models/lesson";
import LessonItemShort from "./LessonItemShort";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from "react-router-dom";
import useCourse from "../../app/hooks/useCourse";
import stageOfCourse from "../courses/stageOfCourse";

interface Props {
    section: Section;
    isOpen: boolean;
    onItemClick: (index: number) => void;
}

export default function SectionItem({ section, isOpen, onItemClick }: Props) {
    const { course } = useCourse();
    type Stage = "unavailable" | "completed" | "inProcess" | "notStarted";
    const navigate = useNavigate();

    const stages = {
        unavailable: <LockOutlinedIcon sx={{ color: grey[400], mr: "5px" }} />,
        completed: <DoneOutlineIcon sx={{ color: green[500], mr: "5px" }} />,
        inProcess: <AccessTimeIcon sx={{ color: yellow[800], mr: "5px" }} />,
        notStarted: <CalculateOutlinedIcon sx={{ color: grey[500], mr: "5px" }} />,
    };

    const stageOfLessonCompletion = (lesson: Lesson, isAvailable: boolean): Stage => {
        if (!isAvailable) return "unavailable";

        const completed = [Boolean(lesson.testScore)]

        if (lesson.urlTheory !== "" && lesson.urlTheory !== null)
            completed.push(lesson.isTheoryCompleted)

        if (lesson.urlPractice !== "" && lesson.urlPractice !== null)
            completed.push(lesson.isPracticeCompleted)

        if (completed.every(value => value === true)) {
            return "completed";
        } else if (completed.some(value => value === true)) {
            return "inProcess";
        } else {
            return "notStarted";
        }
    }

    const stageOfSectionCompletion = (completed: Stage[], isAvailable: boolean): Stage => {
        if (!isAvailable) return "unavailable";

        if (completed.every(value => value === "completed")) {
            return "completed";
        } else if (completed.some(value => value !== "notStarted")) {
            return "inProcess";
        } else {
            return "notStarted";
        }
    }

    const handleListItemClick = () => {
        onItemClick(section.id);
    };

    const handleBuyButtonClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.stopPropagation();
        navigate(`/checkout/${section.courseId}${section.id ? `?sectionId=${section.id}` : ''}`);
    };

    const sectionCompleted = section.lessons.map(lesson => stageOfLessonCompletion(lesson, section.isAvailable));
    const stage = stageOfSectionCompletion(sectionCompleted, section.isAvailable);
    const countOfCompleted = sectionCompleted.filter(value => value === "completed").length;

    return (
        <>
            <Box className='item-border' sx={{ position: 'relative' }}>
                <ListItemButton
                    onClick={handleListItemClick}
                    sx={{ opacity: section.isAvailable ? 1 : 0.5 }}>
                    <ListItemIcon
                        sx={{
                            minWidth: "0",
                            mr: "10px",
                            "& svg": {
                                fontSize: "25px",
                            }
                        }}>
                        {stages[stage]}
                    </ListItemIcon>
                    <ListItemText
                        primary={section.title}
                        secondary={`Завершено: ${countOfCompleted}/${section.lessons.length}`}
                        sx={{
                            ".MuiListItemText-primary": {
                                fontSize: "16px",
                            }
                        }} />
                    {isOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                {stageOfCourse(course) !== "notBought" && !section.isAvailable &&
                    <Button
                        component={Link}
                        size="small"
                        variant="outlined"
                        onClick={handleBuyButtonClick}
                        sx={{
                            position: 'absolute',
                            right: 48,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            boxShadow: 'none'
                        }}
                    >
                        Отримати доступ
                    </Button>
                }
            </Box>
            <Collapse className="item-border" in={isOpen} timeout="auto" unmountOnExit sx={{ pl: "16px" }}>
                {section.lessons.map((lesson, index) =>
                    <LessonItemShort
                        key={lesson.id}
                        icon={stages[sectionCompleted[index]]}
                        lesson={lesson}
                        isAvailable={section.isAvailable}
                    />
                )}
            </Collapse>
        </>
    )
}