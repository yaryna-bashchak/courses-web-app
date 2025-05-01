export interface User {
    email: string;
    username: string;
    token: string;
    roles?: string[];
    claims?: string[];
}