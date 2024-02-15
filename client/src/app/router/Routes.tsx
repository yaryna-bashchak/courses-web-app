import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "../layout/App";
import HomePage from "../../features/home/HomePage";
import CourseDetails from "../../features/course/CourseDetails";
import LessonDetails from "../../features/lesson/LessonDetails";
import TestsSpace from "../../features/tests/TestsSpace";
import NotFound from "../errors/NotFound";
import ServerError from "../errors/ServerError";
import CourseCatalog from "../../features/courses/CourseCatalog";
import Login from "../../features/account/Login";
import Register from "../../features/account/Register";
import RequireAuth from "./RequireAuth";
import CourseEditor from "../../features/courseEditor/CourseEditor";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            // authenticated routes
            { element: <RequireAuth />, children: [
                { path: 'course/:courseId/lesson/:lessonId', element: <LessonDetails /> },
                { path: 'course/:courseId/lesson/:lessonId/test', element: <TestsSpace /> },
            ]},
            // admin routes
            { element: <RequireAuth roles={['Admin']}/>, children: [
                { path: 'editor', element: <CourseEditor /> },
            ]},
            { path: '', element: <HomePage /> },
            { path: 'course', element: <CourseCatalog /> },
            { path: 'course/:courseId', element: <CourseDetails /> },
            { path: 'register', element: <Register /> },
            { path: 'login', element: <Login /> },
            { path: 'server-error', element: <ServerError /> },
            { path: 'not-found', element: <NotFound /> },
            { path: '*', element: <Navigate replace to='not-found' /> },
        ]
    }
])