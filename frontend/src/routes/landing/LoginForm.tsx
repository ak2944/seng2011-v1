import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES, post } from '@/util/api';
import React from 'react';


export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        post(ROUTES.login, {email, password})
        .then((res) => {
            if (res.error) {
                setError(res.error);
                return
            }
            localStorage.setItem('token', res.token);
            navigate('/dashboard');
        })
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center p-4 space-y-4 w-full max-w-md mx-auto">
            <h2 className='text-2xl font-bold mb-4'>Nice to see you again!</h2>

            <Input id="email" type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input id="password" type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-red-500">{error}</p>}

            <Button type="submit" className="w-full mt-4">
                Login
                </Button>
        </form>
    );
}