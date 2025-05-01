import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Link, useNavigate } from 'react-router-dom';
import { Checkbox, FormControlLabel, Paper } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { FieldValues, useForm } from 'react-hook-form';
import agent from '../../app/api/agent';
import { toast } from 'react-toastify';

export default function Register() {
    const navigate = useNavigate();
    const { register, handleSubmit, setError, formState: { isSubmitting, errors, isValid } } = useForm({
        mode: 'onTouched',
    });

    const submitForm = (data: FieldValues) => {
        agent.Account.register(data)
            .then(() => {
                toast.success('Ви успішно зареєстровані! Тепер можете увійти');
                navigate('/login');
            })
            .catch(error => handleApiErrors(error))
    }

    const handleApiErrors = (errors: any) => {
        if (errors) {
            errors.forEach((error: string) => {
                if (error.includes('Password')) {
                    setError('password', { message: error });
                } else if (error.includes('Email')) {
                    setError('email', { message: error });
                } else if (error.includes('Username')) {
                    setError('username', { message: error });
                }
            });
        }
    }

    return (
        <Container component={Paper} maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
            <CssBaseline />
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
                Реєстрація
            </Typography>
            <Box component="form"
                onSubmit={handleSubmit(submitForm)}
                noValidate sx={{ mt: 1 }}
            >
                <TextField
                    margin="normal"
                    fullWidth
                    label="Нікнейм"
                    autoComplete="username"
                    autoFocus
                    {...register('username', { required: 'Будь ласка, придумайте свій нікнейм, який ви будете викоритовувати для входу' })}
                    error={!!errors.username}
                    helperText={errors?.username?.message as string}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    label="Електронна пошта"
                    autoComplete="email"
                    {...register('email', {
                        required: 'Будь ласка, вкажіть вашу електронну пошту',
                        pattern: {
                            value: /^\w+[\w-.]*@\w+((-\w+)|(\w*))\.[a-z]{2,3}$/,
                            message: 'Недійсна електронна пошта'
                        }
                    })}
                    error={!!errors.email}
                    helperText={errors?.email?.message as string}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    label="Пароль"
                    type="password"
                    autoComplete="current-password"
                    {...register('password', {
                        required: 'Будь ласка, придумайте пароль',
                        pattern: {
                            value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,12}$/,
                            message: 'Пароль має містити як мінімум одну малу літеру, одну велику та одну цифру і складати з 6-12 символів'
                        }
                    })}
                    error={!!errors.password}
                    helperText={errors?.password?.message as string}
                />
                <FormControlLabel
                    control={
                        <Checkbox {...register('isTeacher')} />
                    }
                    label='Я викладач'
                />
                <LoadingButton
                    loading={isSubmitting}
                    disabled={!isValid}
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                >
                    Зареєструватися
                </LoadingButton>
                <Grid container>
                    <Grid item>
                        <Link to="/login">
                            {"Вже маєте акаунт? Увійти"}
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}