import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import bgLogin from "../assets/bg-login-hotel.jpeg";



function Login(){
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
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
            localStorage.setItem("token", response.data.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.data.user));

            navigate("/dashboard");
        } catch (err){
            const msg =
            err.response?.data?.message || (isLogin ? "Login Gagal" : "Login Gagal")
            setError(msg);
        } finally{
            setLoading(false);
        }
    };


  return (
    <div className= "min-h-screen relative overflow-hidden">


    {/* div di atas buat ngilangin scroll gajelas dari zoom in zoom out
    div di bawah buatbackground yang zoom in sama zoom out */}
    <div
      className="absolute inset-0 bg-cover bg-center animate-kenburns"
      style={{ backgroundImage: `url(${bgLogin})` }} 
    > </div>

      {/* Overlay gelap */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Card login */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">

          {/* Logo & nama hotel */}
          <div className="text-center mb-6">
            <div className="text-amber-600 text-4xl mb-2">✺</div>
            <h1 className="font-serif text-2xl font-bold text-slate-800 tracking-wide">
              HOTEL GRAND NUSANTARA
            </h1>
            <p className="text-xs tracking-widest text-amber-600 font-semibold mt-1">
              ★★★★★
            </p>
          </div>

          {/* Judul */}
          <div className="text-center mb-6">
            <h2 className="font-semibold text-slate-800">Selamat Datang</h2>
            <p className="text-sm text-gray-500">Silakan login untuk melanjutkan</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* ALERT ERROR */}
  {error && (
    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
      {error}
    </div>
  )}

  {/* ALERT SUKSES */}
  {succes && (
    <div className="bg-green-50 border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg">
      {succes}
    </div>
  )}
            {isLogin && (
              <>
                
                {/*Username*/}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Masukkan username"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                value={form.username}
                onChange={handleChange}
              />
              
            </div>

            </>
            )}
              
        

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type= {showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Masukkan password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  value={form.password}
                  onChange={handleChange}
                  
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >     
                  {showPassword ? "🙉" : "🙈"}
                </button>
              </div>
            </div>

           

            {/* Tombol login */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition"
              disabled={loading}
            >
              {/* loading muter */}
              {loading ? (
                <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 
                </>
             ): isLogin ? (
              "Login"
             ): (   
              "Stay"
             )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-4 w-full text-center text-xs text-gray-300 z-10">
        © 2026 Grand Nusantara Hotel. All rights reserved.
      </p>
    </div>
  );
}


        
    
      


export default Login;

    
    
