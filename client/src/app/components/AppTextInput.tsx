import { TextField, TextFieldProps } from "@mui/material";
import { useController, UseControllerProps } from "react-hook-form";

interface Props extends UseControllerProps, Omit<TextFieldProps, 'name' | 'defaultValue'> {
    label?: string;
    multiline?: boolean;
    rows?: number;
    type?: string;
}

export default function AppTextInput(props: Props) {
    const { fieldState, field } = useController({ ...props, defaultValue: '' })

    return (
        <TextField
            {...props}
            {...field}
            multiline={props.multiline}
            rows={props.rows}
            type={props.type}
            fullWidth
            variant="outlined"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            InputProps={{
                ...props.InputProps,
                style: {
                    ...props.InputProps?.style,
                },
            }}
            sx={{ ...props.sx }}
        />
    )
}
