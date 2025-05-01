import { Box, Button, List, Typography } from "@mui/material";
import SectionItem from "./SectionItem";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NotFound from "../../app/errors/NotFound";
import LoadingComponent from "../../app/layout/LoadingComponent";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Filters from "./Filters";
import SectionSkeleton from "./SectionSkeleton";
import useCourse from "../../app/hooks/useCourse";
import stageOfCourse from "../courses/stageOfCourse";

export default function CourseDetails() {
    const { course, status, courseLoaded, lessonParams } = useCourse();

    useEffect(() => {
        if (course) {
            const index = firstUncompletedSection();
            setOpenIndex(index);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [course]);

    const firstUncompletedSection = () => {
        if (course) {
            for (let i = 0; i < course.sections.length; i++) {
                if (!course.sections[i].lessons.every(l =>
                    (l.urlPractice === "" || l.isPracticeCompleted)
                    && (l.urlTheory === "" || l.isTheoryCompleted)
                    && l.testScore
                ))
                    return course.sections[i].id;
            }
        }
        return -1;
    }

    const [openIndex, setOpenIndex] = useState(firstUncompletedSection());

    const handleItemClick = (index: number) => {
        setOpenIndex(openIndex !== index ? index : -1);
    };

    if ((!course || course.sections.length === 0) && !courseLoaded) {
        if (!lessonParams || status.includes('pending')) return <LoadingComponent />;
        return <NotFound />;
    }

    const isCourseBought = stageOfCourse(course) !== "notBought";

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'start', mb: '10px' }}>
                <Button startIcon={<ArrowBackIcon />} variant="outlined" component={Link} to={`/course`}>Назад до курсів</Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: isCourseBought ? 'start' : 'space-between', alignItems: "center", gap: '10px' }}>
                <Typography variant="h5">{course?.title}</Typography>
                {isCourseBought
                    ? <Filters />
                    : <Button
                        component={Link}
                        to={`/checkout/${course?.id}`}
                        size="small"
                        variant="contained"
                        sx={{p: '4px 20px'}}
                    >
                        Купити
                    </Button>}
            </Box>
            <List className="list-border" sx={{ p: "0px", m: "16px 0px" }}>
                {course && course.sections.map((section) =>
                    section.lessons.length !== 0 ?
                        !courseLoaded ?
                            <SectionSkeleton
                                key={section.id}
                                section={section}
                                isOpen={openIndex === section.id}
                            /> :
                            <SectionItem
                                key={section.id}
                                section={section}
                                isOpen={openIndex === section.id}
                                onItemClick={handleItemClick}
                            /> : <></>
                )}
            </List>
        </>
    )
}