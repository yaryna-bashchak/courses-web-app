import { useTheme, useMediaQuery, Box, Typography, Button } from "@mui/material";
import { ArrowBack } from '@mui/icons-material';

interface Props {
    lessonId?: number;
    cancelEdit: () => void;
}

export default function TestsForm({ lessonId, cancelEdit }: Props) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{ p: isMobile ? 2 : 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'start' }}>
                <Button startIcon={<ArrowBack />} variant="outlined" onClick={cancelEdit}>Назад</Button>
            </Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, mt: '16px' }}>
                Тести
            </Typography>
        </Box>
    )
}