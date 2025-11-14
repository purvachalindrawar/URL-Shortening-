import React from 'react'
import UrlForm from '../components/UrlForm'
import UserUrl from '../components/UserUrl'

const DashboardPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <div className="w-full max-w-5xl rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl p-8">
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-rose-300 text-center mb-6 tracking-wide">URL Shortener</h1>
      <UrlForm/>
      <UserUrl/>
    </div>
  </div>
  )
}

export default DashboardPage