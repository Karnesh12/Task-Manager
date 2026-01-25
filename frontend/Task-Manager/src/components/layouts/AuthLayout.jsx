import React from "react";
import AuthAnimation from "../AuthAnimation";

const AuthLayout = ({ children }) => {
    return <div className="flex">
        <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12">
            <h2 className="text-lg font-medium text-black">Task Manager</h2>
            {children}
        </div>

        <div className="hidden md:flex w-[40vw] h-screen items-center justify-center bg-blue-50 overflow-hidden p-8">
            <AuthAnimation />
        </div>
    </div>
};

export default AuthLayout