import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function POST(req) {
  try {
    // 验证用户身份
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const body = await req.json();

    // 基本的输入验证
    if (!body || !body.messages) {
      return NextResponse.json({ error: '无效的请求数据' }, { status: 400 });
    }

    // 添加重试逻辑
    let retries = 3;
    let response;

    while (retries > 0) {
      try {
        response = await fetch(
          'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
      } catch (error) {
        retries -= 1;
        if (retries === 0) {
          throw error;
        }
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('API Error:', error);

    // 更详细的错误处理
    const errorMessage =
      error.response?.data?.error || error.message || '服务器内部错误';
    const statusCode = error.response?.status || 500;

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(7),
      },
      { status: statusCode }
    );
  }
}
