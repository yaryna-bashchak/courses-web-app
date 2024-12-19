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
            <Card sx={{ width: '90%', maxWidth: '300px', minWidth: '250px' }}>
                <CardMedia
                    sx={{ height: 140 }}
                    image="https://naurok.ua/uploads/blog/eksetasi-odhgon-23-11-2018.jpg"
                    title="green iguana"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {course?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {course?.description}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: '5px' }}>
                        Тривалість: {course?.duration} місяців <br />
                        Ціна: <Box component="span" color="secondary.main">{course?.priceMonthly} грн/міс</Box> або {course?.priceFull} грн
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
