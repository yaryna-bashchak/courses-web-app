import { List, IconButton, ListItem, ListItemText, Drawer } from "@mui/material";
import { useAppSelector } from "../store/configureStore";
import { AccountCircle } from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from "react";
import { useDispatch } from "react-redux";
import { signOut } from "../../features/account/accountSlice";
import { clearCourses } from "../../features/courses/coursesSlice";
import { clearTests } from "../../features/tests/testsSlice";
import { adminLinks, authorizedLinks, baseLinks, nonAuthorizedLinks } from "./links";

export default function RightMobileMenu() {
    const { user } = useAppSelector(state => state.account);
    const [menuOpen, setMenuOpen] = useState(false);
    const dispatch = useDispatch();

    const handleMenuClick = (title: string) => {
        if (title === 'Вийти') {
            dispatch(signOut());
            dispatch(clearCourses());
            dispatch(clearTests());
        }

        setMenuOpen(false);
    };

    const sideList = () => {
        let combinedLinks = (user ? authorizedLinks : nonAuthorizedLinks).concat(baseLinks);
        if (user && user.claims?.includes('Permission: ManageCourses')) combinedLinks = combinedLinks.concat(adminLinks);

        return (
            <List>
                {user && (
                    <ListItem sx={{ borderBottom: '1px solid #ddd' }}>
                        <AccountCircle sx={{ mr: 1, fontSize: '25px', color: 'primary.main' }} />
                        <ListItemText primary={`${user.username.toUpperCase()}`} primaryTypographyProps={{ color: 'primary.main' }} />
                    </ListItem>
                )}
                {combinedLinks.map(({ title, path }) => (
                    <ListItem button component={NavLink} to={path} key={path} onClick={() => handleMenuClick(title)}>
                        {title}
                    </ListItem>
                ))}
            </List>
        )
    };

    return (<>
        <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMenuOpen(true)}
        >
            <MenuIcon />
        </IconButton>
        <Drawer
            anchor="right"
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            sx={{ width: '150px', flexShrink: 0, '& .MuiDrawer-paper': { width: '150px' } }}
        >
            {sideList()}
        </Drawer>
    </>)
}