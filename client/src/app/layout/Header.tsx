import { AppBar, Avatar, Box, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
// import SearchIcon from '@mui/icons-material/Search';
import { NavLink } from "react-router-dom";
import RightMobileMenu from "./RightMobileMenu";
import LaptopNavLinks from "./LaptopNavLinks";

export const navStyles = {
    color: 'inherit',
    textDecoration: 'none',
    fontSize: '14px',
    lineHeight: 1.5,
    '&:hover': {
        color: 'grey.300',
    }
}

// const Search = styled('div')(({ theme }) => ({
//     position: 'relative',
//     borderRadius: theme.shape.borderRadius,
//     backgroundColor: alpha(theme.palette.common.white, 0.15),
//     '&:hover': {
//         backgroundColor: alpha(theme.palette.common.white, 0.25),
//     },
//     marginRight: theme.spacing(2),
//     marginLeft: 0,
//     width: '100%',
//     [theme.breakpoints.up('sm')]: {
//         marginLeft: theme.spacing(3),
//         width: 'auto',
//     },
// }));

// const SearchIconWrapper = styled('div')(({ theme }) => ({
//     padding: theme.spacing(0, 2),
//     height: '100%',
//     position: 'absolute',
//     pointerEvents: 'none',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
// }));

// const StyledInputBase = styled(InputBase)(({ theme }) => ({
//     color: 'inherit',
//     '& .MuiInputBase-input': {
//         padding: theme.spacing(1, 1, 1, 0),
//         // vertical padding + font size from searchIcon
//         paddingLeft: `calc(1em + ${theme.spacing(4)})`,
//         transition: theme.transitions.create('width'),
//         width: '100%',
//         [theme.breakpoints.up('md')]: {
//             width: '20ch',
//         },
//     },
// }));

export default function Header() {
    const theme = useTheme();
    const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <AppBar position="fixed" sx={{ top: 0, bottom: "auto" }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: "100%", [theme.breakpoints.up('md')]: { width: '80%', maxWidth: "980px" } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NavLink to='/course' style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                            <Avatar alt="Logo" src="/images/header/logo.jpg" sx={{ mr: "10px" }} />
                            <Typography variant="h6"
                                sx={{
                                    ...navStyles,
                                }}>
                                План ЗНО-шника
                            </Typography>
                            {/* <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Знайти..."
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search> */}
                        </NavLink>
                    </Box>

                    {isMobileOrTablet
                        ? <RightMobileMenu />
                        : <LaptopNavLinks />
                    }
                </Toolbar>
            </Box>
        </AppBar>
    )
}