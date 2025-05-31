import { Edit, Close, Done, Delete, Add } from "@mui/icons-material";
import { TableRow, TableCell, Button } from "@mui/material";
import { Section } from "../../../app/models/course";
import { LoadingButton } from "@mui/lab";
import { LoadingState } from "./SectionForm";

interface Props {
    section?: Section;
    handleEditClick: () => void;
    handleSubmitData: () => void;
    isEditing: boolean;
    handleDeleteData: (id: number) => void;
    loadingState: LoadingState;
}

export default function SectionHeader({ section, handleEditClick, handleSubmitData, isEditing, handleDeleteData, loadingState }: Props) {
    const sectionId = section ? section.id : -1;
    const sectionCellStyle = {
        fontSize: '1.1rem',
    };

    return (
        <>
            <TableRow sx={{
                backgroundColor: '#d0e3f7',
                '&:last-child td, &:last-child th': { border: 0 }
            }}>
                {section || isEditing ? <>
                    <TableCell align="left" sx={{ ...sectionCellStyle, fontWeight: 'bold' }}>{section?.title}</TableCell>

                    <TableCell align="right" colSpan={2}>
                        {isEditing && <>
                            <LoadingButton loading={loadingState[sectionId]?.submit} onClick={handleSubmitData} startIcon={<Done />} color='success' />
                            <Button onClick={handleEditClick} startIcon={<Close />} color='error' />
                        </>}
                        <Button onClick={handleEditClick} startIcon={<Edit />} disabled={isEditing} />
                        <LoadingButton loading={loadingState[sectionId]?.delete} onClick={() => handleDeleteData(sectionId)} startIcon={<Delete />} color='error' disabled={isEditing} />
                    </TableCell>
                </> : <>
                    <TableCell align="center" colSpan={4}>
                        <Button onClick={handleEditClick} size="large" startIcon={<Add />}>додати розділ</Button>
                    </TableCell>
                </>
                }
            </TableRow>
        </>
    )
}