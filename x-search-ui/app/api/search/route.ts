import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // 调用提供的搜索API
    const response = await fetch(`http://localhost:8888/api/search?query=${encodeURIComponent(query)}`, {
      headers: {
        'x-search': 'enabled' // 添加x-search元素到请求头
      }
    });
    
    if (!response.ok) {
      throw new Error(`Search API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: '搜索服务暂时不可用，请稍后再试' },
      { status: 500 }
    );
  }
}