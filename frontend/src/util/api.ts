export const ROUTES = {
    'register': '/register',
    'logout': '/logout',
    'login': '/login',
    'read': '/store',
    'set': '/store',
}

const BACKEND = 'http://localhost:3200';

export async function post(url: string, data: object) {
    const response = await fetch(BACKEND + url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer' + localStorage.getItem('token'),
        },
        body: JSON.stringify(data),
    });
    return await response.json();
}

export async function put(url: string, data: object) {
    const response = await fetch(BACKEND + url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer' + localStorage.getItem('token'),
        },
        body: JSON.stringify(data),
    });
    return await response.json();
}

export async function get(url: string) {
    const response = await fetch(BACKEND + url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer' + localStorage.getItem('token'),
        },
    });
    return await response.json();
}