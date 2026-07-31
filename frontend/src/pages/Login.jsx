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
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        } catch (err){
            const msg =
            err.response?.data?.message || (isLogin ? "Login Gagal" : "Login Gagal")
            setError(msg);
        } finally{
            setLoading(false);
        }
    };

    return (
        <div className="container containerl mt-5" style={{ maxWidth: "420px" }}>
      <div className="card">
        <div className="card-header text-center">
          <h2 className="m-0">{isLogin ? "Login" : "Login"}</h2>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {succes && (
            <div className="alert alert-success" role="alert">
              {succes}
            </div>
          )}

          <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username"
                />
              </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                placeholder="Password (minimal 6 karakter)"
              />
            </div>

            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Memproses...": isLogin? "Login": "Login"}
              </button>
            </div>
          </form>

          </div>
        </div>
      </div>
  );
}

export default Login;

    
    
