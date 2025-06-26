"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, ArrowLeft, ExternalLink, Clock, Globe, Sparkles, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useChat } from "ai/react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import ReactMarkdown from 'react-markdown'

// 搜索结果接口定义
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  domain?: string;
  publishTime?: string;
}

interface SearchResponse {
  result: string;
  moreQuestions: string;
  searchResponse: SearchResult[];
  query: string;
}

// 默认相关问题
const defaultRelatedQuestions = [
  "人工智能的发展历史是什么？",
  "AI技术有哪些主要分类？",
  "如何开始学习人工智能？",
  "AI对就业市场有什么影响？",
  "未来AI技术的发展方向？",
]

// 注意：parseMarkdown函数已被移除，现在使用ReactMarkdown组件来渲染Markdown内容

// 格式化AI回答，将[citation:x]转换为引用图标并支持Markdown
const formatAIResponseWithCitations = (text: string, searchResults: SearchResult[]) => {
  if (!text) return null;
  
  // 处理引用标记
  const citationRegex = /\[citation:(\d+)\]/g;
  let processedText = text;
  const citations: {[key: string]: SearchResult} = {};
  
  // 替换引用标记为自定义标记
  processedText = processedText.replace(citationRegex, (match, index) => {
    const citationIndex = parseInt(index, 10);
    if (!isNaN(citationIndex) && citationIndex < searchResults.length) {
      const result = searchResults[citationIndex];
      const key = `citation-${citationIndex}`;
      citations[key] = result;
      return `[${citationIndex + 1}](#${key})`;
    }
    return match;
  });
  
  // 自定义组件渲染器
  const components = {
    // 代码块渲染
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : 'text';
      
      return !inline ? (
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{
            borderRadius: '0.375rem',
            padding: '1rem',
            margin: '0.5rem 0',
            fontSize: '0.9rem',
            backgroundColor: '#1e1e1e'
          }}
          showLineNumbers={true}
          wrapLines={true}
          wrapLongLines={true}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      );
    },
    // 链接渲染，处理引用
    a({ node, href, children, ...props }: any) {
      const citationKey = href?.substring(1); // 去掉#号
      if (citationKey && citations[citationKey]) {
        const result = citations[citationKey];
        return (
          <a 
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center mx-1 text-blue-400 hover:text-blue-300 group cursor-pointer"
            title={`引用: ${result.title}`}
            data-x-search="true"
          >
            <BookOpen className="w-4 h-4 mr-1" />
            <span className="text-xs">{children}</span>
            <span className="hidden group-hover:inline-block ml-1 text-xs">
              {result.title.substring(0, 20)}
              {result.title.length > 20 ? '...' : ''}
            </span>
            <span className="sr-only">x-search引用</span>
          </a>
        );
      }
      
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" {...props}>
          {children}
        </a>
      );
    }
  };
  
  return (
    <div className="markdown-content">
      <ReactMarkdown components={components}>
        {processedText}
      </ReactMarkdown>
    </div>
  );
};

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [aiAnswer, setAiAnswer] = useState<string>("") 
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>(defaultRelatedQuestions)
  const [isSearching, setIsSearching] = useState<boolean>(false)

  // 使用AI SDK的聊天功能作为备用
  const { messages, isLoading: isChatLoading } = useChat({
    api: "/api/chat",
    initialMessages: query ? [{ id: "1", role: "user", content: query }] : [],
  })

  // 执行搜索
  const performSearch = async (searchText: string) => {
    if (!searchText.trim()) return
    
    // 清空旧的搜索结果和AI回答
    setSearchResults([])
    setAiAnswer("")
    setIsSearching(true)
    
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchText.trim())}`);
      if (!response.ok) {
        throw new Error(`搜索请求失败: ${response.status}`);
      }
      
      const data: SearchResponse = await response.json();
      
      // 更新搜索结果
      setSearchResults(data.searchResponse || []);
      setAiAnswer(data.result || "");
      
      // 解析更多问题
      if (data.moreQuestions) {
        const questions = data.moreQuestions
          .split('\n')
          .map(q => q.trim())
          .filter(q => q && !q.match(/^\d+\.\s*$/))
          .map(q => q.replace(/^\d+\.\s*/, '').trim())
          .filter(Boolean);
        
        setRelatedQuestions(questions.length > 0 ? questions : defaultRelatedQuestions);
      }
    } catch (error) {
      console.error('搜索出错:', error);
      // 出错时使用AI聊天的回答作为备用
      const aiResponse = messages.find((m) => m.role === "assistant")?.content;
      if (aiResponse) setAiAnswer(aiResponse);
    } finally {
      setIsSearching(false);
    }
  }

  // 当查询参数变化时执行搜索
  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const handleNewSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      const trimmedQuery = newQuery.trim()
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`)
      setSearchQuery(trimmedQuery)
      // 直接执行搜索，不等待URL参数变化触发useEffect
      performSearch(trimmedQuery)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleNewSearch(searchQuery)
  }

  // 如果没有搜索结果但有AI回答，则使用AI回答
  const aiResponse = aiAnswer || messages.find((m) => m.role === "assistant")?.content

  return (
    <div className="min-h-screen bg-black" data-x-search="container">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-2 py-4 max-w-[1400px]">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="shrink-0 text-gray-300 hover:text-white hover:bg-gray-800">
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl" data-x-search="form">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="输入您的问题..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-20 py-2 border-0 bg-gray-800 text-white rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  data-x-search="input"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full transition-all duration-300"
                  data-x-search="button">
                  搜索
                </Button>
              </div>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 py-6 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* AI Answer - Left Side */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI Answer */}
            <Card className="tech-card" data-x-search="ai-answer">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="flex items-center gap-2 text-gray-200">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  AI 智能搜索
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4" data-x-search="ai-content">
                {query && (
                  <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="font-medium text-gray-200">{query}</p>
                  </div>
                )}

                <div className="prose max-w-none prose-invert">
                  {(isSearching || isChatLoading) && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                    AI正在思考中...
                  </div>
                )}

                {!isSearching && !isChatLoading && aiResponse && 
                  <div className="whitespace-pre-wrap text-gray-300 leading-relaxed" data-x-search="ai-response">
                    {formatAIResponseWithCitations(aiResponse, searchResults)}
                  </div>
                }

                {!query && !isSearching && !isChatLoading && <p className="text-gray-400">请输入问题开始搜索</p>}
                </div>
              </CardContent>
            </Card>
            
            {/* Related Questions - Moved to bottom */}
            {query && (
              <Card className="tech-card">
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="text-lg text-gray-200">相关问题</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {relatedQuestions.length > 0 ? (
                    relatedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleNewSearch(question)}
                        className="w-full text-left p-3 rounded-lg border border-gray-800 hover:border-blue-500 hover:bg-gray-800 transition-colors"
                      >
                        <p className="text-sm text-gray-300 line-clamp-2 overflow-hidden">{question}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-2">暂无相关问题</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Search Results - Right Side */}
          <div className="space-y-4">
            {/* Search Results */}
            {query && searchResults.length > 0 && (
              <Card className="tech-card">
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="flex items-center gap-2 text-gray-200">
                    <Globe className="w-5 h-5 text-green-400" />
                    相关搜索结果
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {searchResults.map((result, index) => (
                    <div key={index} className="border-b border-gray-800 last:border-b-0 pb-4 last:pb-0" data-x-search="result">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <a href={result.url.trim()} target="_blank" rel="noopener noreferrer" className="group" data-x-search="link">
                            <h3 className="text-lg font-medium text-blue-400 group-hover:text-blue-300 mb-1 transition-colors line-clamp-2 overflow-hidden">
                              {result.title}
                            </h3>
                          </a>
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <span>{result.domain || new URL(result.url.trim().replace(/`/g, '')).hostname}</span>
                            {result.publishTime && (
                              <>
                                <Separator orientation="vertical" className="h-3 bg-gray-700" />
                                <Clock className="w-3 h-3" />
                                <span>{result.publishTime}</span>
                              </>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 overflow-hidden">{result.snippet}</p>
                        </div>
                        <a href={result.url.trim()} target="_blank" rel="noopener noreferrer" data-x-search="external">
                          <Button variant="ghost" size="icon" className="shrink-0 text-gray-400 hover:text-white hover:bg-gray-800">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {query && isSearching && searchResults.length === 0 && (
              <Card className="tech-card">
                <CardContent className="pt-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-300">
                    <div className="animate-spin w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"></div>
                    正在搜索相关结果...
                  </div>
                </CardContent>
              </Card>
            )}
            
            {query && !isSearching && searchResults.length === 0 && (
              <Card className="tech-card">
                <CardContent className="pt-4 text-center">
                  <p className="text-gray-400">未找到相关搜索结果</p>
                </CardContent>
              </Card>
            )}

            {/* Search Tips */}
            <Card className="tech-card">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-lg text-gray-200">搜索技巧</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs bg-blue-900/30 text-blue-300 border-blue-700">关键词</Badge>
                  <p className="text-sm text-gray-300">使用精确关键词可以获得更准确的结果</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs bg-purple-900/30 text-purple-300 border-purple-700">方式</Badge>
                  <p className="text-sm text-gray-300">尝试使用不同的问题表述方式</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs bg-green-900/30 text-green-300 border-green-700">分解</Badge>
                  <p className="text-sm text-gray-300">复杂问题可以分解为多个简单问题</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
