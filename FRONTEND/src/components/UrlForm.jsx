import React, { useState } from 'react'
import { createShortUrl } from '../api/shortUrl.api'
import { useSelector } from 'react-redux'
import { QueryClient } from '@tanstack/react-query'
import { queryClient } from '../main'

const UrlForm = () => {
  
  const [url, setUrl] = useState("https://www.google.com")
  const [shortUrl, setShortUrl] = useState()
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const [customSlug, setCustomSlug] = useState("")
  const [password, setPassword] = useState("")
  const [ttlHours, setTtlHours] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const {isAuthenticated} = useSelector((state) => state.auth)

  const handleSubmit = async () => {
    try{
      const options = {}
      if (password.trim()) options.password = password.trim()
      if (ttlHours) options.ttlHours = Number(ttlHours)
      if (expiresAt) options.expiresAt = expiresAt
      const shortUrl = await createShortUrl(url, customSlug || undefined, options)
      setShortUrl(shortUrl)
      queryClient.invalidateQueries({queryKey: ['userUrls']})
      setError(null)
    }catch(err){
      setError(err.message)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-slate-200 mb-1">
            Enter your URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onInput={(event)=>setUrl(event.target.value)}
            placeholder="https://example.com"
            required
            className="w-full px-4 py-2 rounded-md border border-white/10 bg-white/5 placeholder-gray-400 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={handleSubmit}
          type="submit"
          className="relative w-full rounded-md bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 text-white py-2 px-4 shadow-lg transition-all duration-200 hover:shadow-rose-500/25 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 group"
        >
          <span className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:"linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)", transform:"skewX(-12deg)"}}></span>
          <span className="relative font-semibold tracking-wide">Shorten URL</span>
        </button>
         {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        <p className="mt-2 text-xs text-slate-400">Tip: Set a password to require entry before redirect. Use TTL or Expire at to auto-expire links.</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1">
              Password (optional)
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder="Set a password to protect the link"
              className="w-full px-4 py-2 rounded-md border border-white/10 bg-white/5 placeholder-gray-400 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="ttlHours" className="block text-sm font-medium text-slate-200 mb-1">
              TTL in hours (optional)
            </label>
            <input
              type="number"
              min="1"
              id="ttlHours"
              value={ttlHours}
              onChange={(e)=>setTtlHours(e.target.value)}
              placeholder="e.g., 24"
              className="w-full px-4 py-2 rounded-md border border-white/10 bg-white/5 placeholder-gray-400 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="expiresAt" className="block text-sm font-medium text-slate-200 mb-1">
              Expire at (optional, overrides TTL)
            </label>
            <input
              type="datetime-local"
              id="expiresAt"
              value={expiresAt}
              onChange={(e)=>setExpiresAt(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-white/10 bg-white/5 placeholder-gray-400 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        {isAuthenticated && (
          <div className="mt-4">
            <label htmlFor="customSlug" className="block text-sm font-medium text-slate-200 mb-1">
              Custom URL (optional)
            </label>
            <input
              type="text"
              id="customSlug"
              value={customSlug}
              onChange={(event) => setCustomSlug(event.target.value)}
              placeholder="Enter custom slug"
              className="w-full px-4 py-2 rounded-md border border-white/10 bg-white/5 placeholder-gray-400 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
        {shortUrl && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">Your shortened URL:</h2>
            <div className="flex items-center">
              <input
                type="text"
                readOnly
                value={shortUrl}
                className="flex-1 p-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-900"
              />
               <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-r-md transition-colors duration-200 ${
                  copied 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
  )
}

export default UrlForm