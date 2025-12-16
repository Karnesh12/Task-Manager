import React, { useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";

const SignUp = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [adminInviteToken, setAdminInviteToken] = useState('')

    const [error, setError] = useState(null);
    
    return (
        <AuthLayout>
            h
        </AuthLayout>
    )
}

export default SignUp