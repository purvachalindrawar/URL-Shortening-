import React, { useState } from 'react'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'

const AuthPage = () => {

    const [login, setLogin] = useState(true)

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl p-8">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-rose-300 text-center mb-6 tracking-wide">
                {login ? 'Welcome Back' : 'Create Account'}
              </h1>
              {login ? <LoginForm state={setLogin} /> : <RegisterForm state={setLogin} />}
            </div>
        </div>
    )
}

export default AuthPage