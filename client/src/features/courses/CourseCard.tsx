import { Card, CardMedia, CardContent, Typography, CardActions, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../app/store/configureStore";
import { courseSelectors } from "./coursesSlice";
import stageOfCourse from "./stageOfCourse";

interface Props {
    courseId: number;
}

export default function CourseCard({ courseId }: Props) {
    const course = useAppSelector(state => courseSelectors.selectById(state, courseId!));

    return (
        <>
            <Card sx={{
                    width: '90%',
                    maxWidth: '300px',
                    minWidth: '250px',
                    boxShadow: 3,
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                        {course?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {course?.description}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: '5px' }}>
                        Розділів: {course?.sections.length} <br />
                        Ціна: <Box component="span" color="secondary.main">{course?.priceFull} грн</Box>
                        <Box component="span" sx={{ display: 'block', fontSize: '1rem', lineHeight: 1.2, mt: '4px' }}>або {course?.priceMonthly} грн за розділ, якщо купувати частинами</Box>
                    </Typography>
                </CardContent>
                <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button component={Link} to={`/course/${course?.id}`} size="small">
                        {stageOfCourse(course) === "notBought" ? "Теми уроків" : "Проходити курс"}
                    </Button>
                    {stageOfCourse(course) === "notBought" &&
                        <Button
                            component={Link}
                            to={`/checkout/${courseId}`}
                            size="small"
                            variant="contained"
                        >
                            Купити
                        </Button>}
                </CardActions>
            </Card >
        </>
    )
}
