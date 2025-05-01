import { List, ListItem } from "@mui/material";
import { NavLink } from "react-router-dom";
import SignedInMenu from "./SignedInMenu";
import { useAppSelector } from "../store/configureStore";
import { navStyles } from "./Header";
import { adminLinks, baseLinks, nonAuthorizedLinks } from "./links";

export default function LaptopNavLinks() {
    const { user } = useAppSelector(state => state.account);

    return (
        <>
            <List sx={{ display: 'flex' }}>
                {baseLinks.map(({ title, path }) => (
                    <ListItem
                        component={NavLink}
                        to={path}
                        key={path}
                        sx={navStyles}
                    >
                        {title.toUpperCase()}
                    </ListItem>
                ))}
                {user && user.claims?.includes('Permission: ManageCourses') && adminLinks.map(({ title, path }) => (
                    <ListItem
                        component={NavLink}
                        to={path}
                        key={path}
                        sx={navStyles}
                    >
                        {title.toUpperCase()}
                    </ListItem>
                ))}
            </List>
            {user ?
                <SignedInMenu /> :
                <List sx={{ display: 'flex' }}>
                    {nonAuthorizedLinks.map(({ title, path }) => (
                        <ListItem
                            component={NavLink}
                            to={path}
                            key={path}
                            sx={navStyles}
                        >
                            {title}
                        </ListItem>
                    ))}
                </List>
            }
        </>
    )
}