import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Login(){
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(false);
    const [form, setForm] = useState ({ username: "", password: ""});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [succes, setSucces] = useState("");

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setError("");
        setSucces("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login",{
                username: form.username,
                password: form.password,
            });
            localStorage.setItem
        }
    }
    }
}