export interface User {
    id: string;
    email: string;
    username: string;
    token: string;
    roles?: string[];
    claims?: string[];
}