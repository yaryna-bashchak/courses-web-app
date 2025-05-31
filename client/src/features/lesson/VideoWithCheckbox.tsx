import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/store/configureStore';
import { courseSelectors, updateLessonAsync } from '../courses/coursesSlice';
import { findLessonById } from './findLessonById';
import { useState } from 'react';
import { Button } from '@mui/material';
import { PlayArrow } from "@mui/icons-material";

interface Props {
    videoNumber: number;
}

export default function VideoWithCheckbox({ videoNumber }: Props) {
    const dispatch = useAppDispatch();
    const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
    const course = useAppSelector(state => courseSelectors.selectById(state, courseId!));
    const lesson = course ? findLessonById(course, parseInt(lessonId!)) : null;
    const [showVideo, setShowVideo] = useState(false);
    const videoKey = videoNumber === 0 ? lesson?.urlTheory : lesson?.urlPractice;
    const isCompleted = videoNumber === 0 ? lesson?.isTheoryCompleted : lesson?.isPracticeCompleted;
    const videoName = videoNumber === 0 ? "Теорія" : "Практика";

    const handleContextMenu = (event: React.MouseEvent<HTMLVideoElement>) => {
        event.preventDefault();
    }

    const handleDownloadClick = () => {
        setShowVideo(true);
    };

    const handleCheckClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        const body = videoNumber === 0 ? { isTheoryCompleted: Number(event.target.checked), courseId } : { isPracticeCompleted: Number(event.target.checked), courseId }
        dispatch(updateLessonAsync({ id: parseInt(lessonId!), body: body }));
    }

    function getCloudinaryVideoThumbnail(videoUrl: string): string {
        const urlParts = videoUrl.split('/');

        urlParts.splice(6, 0, 'so_0');

        const lastPartIndex = urlParts.length - 1;
        urlParts[lastPartIndex] = urlParts[lastPartIndex].replace(/\.\w+$/, '.jpg');

        return urlParts.join('/');
    }

    const handleTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = event.currentTarget;
        const timeRemaining = video.duration - video.currentTime;

        if (!isCompleted && timeRemaining <= 10) {
            const body = videoNumber === 0
                ? { isTheoryCompleted: 1, courseId }
                : { isPracticeCompleted: 1, courseId };
            dispatch(updateLessonAsync({ id: parseInt(lessonId!), body }));
        }
    };

    return (
        <>
            {videoKey &&
                <div className="video-wrapper">
                    {showVideo ? (
                        <video key={videoKey} style={{ maxWidth: '100%', maxHeight: 200, flex: '0 1 auto', marginBottom: 0 }} controls controlsList="nodownload" onContextMenu={handleContextMenu} onTimeUpdate={handleTimeUpdate}>
                            <source src={videoKey} type="video/mp4" />
                            Ваш браузер не підтримує відео тег.
                        </video>
                    ) : videoKey ? (
                        <Button
                            onClick={handleDownloadClick}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${getCloudinaryVideoThumbnail(videoKey)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: '1px solid black'
                            }}>
                            <PlayArrow sx={{ fontSize: '70px' }} htmlColor="#ce7556" />
                        </Button>
                    ) : null}
                    <FormControlLabel
                        label={videoName}
                        control={
                            <Checkbox checked={isCompleted} onChange={handleCheckClick} />
                        }
                    />
                </div>
            }
        </>
    );
}