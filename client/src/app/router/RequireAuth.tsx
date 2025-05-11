import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/configureStore";
import { toast } from "react-toastify";

interface Props {
    claims?: string[];
}

export default function RequireAuth({ claims }: Props) {
    const { user } = useAppSelector(state => state.account);
    const location = useLocation();

    if (!user) {
        return <Navigate to='/login' state={{ from: location }} />
    }

    if (claims && !claims.some(claim => user.claims?.includes(claim))) {
        toast.error('Not authorised to access this area')
        return <Navigate to='/course' />
    }

    return <Outlet />
}