import { NextResponse } from 'next/server';

// 移除认证相关的导入，简化处理逻辑
export async function POST(req) {
  try {
    // 获取请求数据
    const body = await req.json();

    if (!body?.messages) {
      return NextResponse.json({ error: '无效的请求数据' }, { status: 400 });
    }

    console.log('Request body:', body);

    // 获取 API 密钥
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    if (!apiKey) {
      console.error('Missing API key');
      return NextResponse.json({ error: '服务器配置错误' }, { status: 500 });
    }

    // 调用 AI 服务
    const response = await fetch(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    // 处理 AI 服务响应
    if (!response.ok) {
      const errorData = await response.text();
      console.error('AI API Error:', {
        status: response.status,
        error: errorData,
      });

      return NextResponse.json(
        { error: '服务调用失败', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Request failed:', error);

    return NextResponse.json(
      {
        error: '服务器内部错误',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
