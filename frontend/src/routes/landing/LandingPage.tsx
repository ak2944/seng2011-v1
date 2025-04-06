import React from "react";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";

export default function LandingPage() {

    return (
        <div className="flex flex-col items-center p-4 space-y-4 w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Despatch Advice Generation</h2>
            <Link to={"/login"}><Button>Login</Button></Link>
            <Link to={"/register"}><Button>Register</Button></Link>
        </div>
    )
}