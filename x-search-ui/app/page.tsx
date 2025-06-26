"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

const suggestedQueries = [
  "什么是人工智能？",
  "如何学习编程？",
  "最新的科技趋势",
  "健康饮食建议",
  "旅行攻略推荐",
  "投资理财知识",
]

export default function HomePage() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo and Title */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)] animate-pulse relative">
                <Sparkles className="w-8 h-8 text-white" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-600/30 blur-xl animate-ping"></div>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4 animate-[fadeIn_1s_ease-in]">
              X-Search AI 智能搜索
            </h1>
            <p className="text-gray-400 max-w-md mx-auto animate-[fadeIn_1.5s_ease-in]">探索未来的搜索体验，由先进AI技术驱动</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-12 animate-[fadeIn_1.2s_ease-in]">
            <div className="relative max-w-2xl mx-auto animate-[float_6s_ease-in-out_infinite]">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-50 blur-md"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 z-10" />
                  <Input
                    type="text"
                    placeholder="输入您的问题..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-12 pr-24 py-6 text-lg border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-gray-900/90 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-sm"
                  />
                  <Button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full transition-all duration-300 z-10"
                  >
                    搜索
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Suggested Queries */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-300 mb-6">热门搜索</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedQueries.map((suggestion, index) => (
                <Card
                  key={index}
                  className="cursor-pointer tech-card transition-all duration-300 hover:scale-105"
                  onClick={() => handleSearch(suggestion)}
                >
                  <CardContent className="p-4">
                    <p className="text-gray-300 font-medium">{suggestion}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Features */}
          {/* <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">AI 智能回答</h3>
              <p className="text-gray-600 text-sm">基于先进AI模型，提供准确详细的答案</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">实时搜索</h3>
              <p className="text-gray-600 text-sm">实时获取最新信息和相关内容</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-green-600 rounded-full"></div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">流式响应</h3>
              <p className="text-gray-600 text-sm">逐步显示答案，提供流畅体验</p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}
