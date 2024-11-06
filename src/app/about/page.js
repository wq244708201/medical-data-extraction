'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            关于 MediData AI
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            智能医疗数据提取与分析平台
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* 功能特点卡片 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">智能识别</h3>
              <p className="mt-2 text-gray-500">
                采用先进的 AI 技术，自动识别医疗文本中的关键信息。
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">高效处理</h3>
              <p className="mt-2 text-gray-500">
                批量处理大量医疗数据，显著提升工作效率。
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">精准分析</h3>
              <p className="mt-2 text-gray-500">
                提供精确的数据分析结果，支持医疗研究和临床决策。
              </p>
            </div>
          </div>
        </div>

        {/* 开始使用按钮 */}
        <div className="mt-16 text-center">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            免费注册使用
          </Link>
        </div>
      </div>
    </div>
  );
}
