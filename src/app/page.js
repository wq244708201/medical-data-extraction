'use client';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                MediData AI
              </span>
              <span className="ml-2 text-sm text-gray-500">医数智能</span>
            </div>
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  进入控制台
                </button>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    href="/auth/sign-in"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                  >
                    登录
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    免费注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <div className="relative overflow-hidden">
        <div className="pt-16 pb-80 sm:pt-24 sm:pb-40 lg:pt-40 lg:pb-48">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:static">
            <div className="sm:max-w-lg">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
                医疗数据
                <span className="block text-blue-600">智能提取平台</span>
              </h1>
              <p className="mt-4 text-xl text-gray-500">
                基于先进的AI技术，自动识别和提取医疗文本中的关键数据，
                让数据处理更简单，让分析更高效。
              </p>
              <div className="mt-10 space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
                {!isSignedIn && (
                  <>
                    <Link
                      href="/auth/sign-up"
                      className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                    >
                      立即开始
                    </Link>
                    <Link
                      href="/about"
                      className="flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                    >
                      了解更多
                    </Link>
                  </>
                )}
                {isSignedIn && (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    进入控制台
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 特性展示区域 */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
              核心优势
            </h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              为什么选择我们？
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: '智能提取',
                  description:
                    '运用先进的AI技术，自动识别和提取医疗文本中的关键数据信息',
                },
                {
                  title: '批量处理',
                  description: '支持批量处理大量医疗文档，大幅提升工作效率',
                },
                {
                  title: '准确可靠',
                  description: '采用智能算法，确保数据提取的准确性和可靠性',
                },
                {
                  title: '成本效益',
                  description: '显著降低人工处理成本，提高数据处理效率',
                },
                {
                  title: '便捷导出',
                  description: '支持多种格式导出，方便后续数据分析和使用',
                },
                {
                  title: '安全可控',
                  description: '严格的数据安全保护机制，确保医疗数据安全',
                },
              ].map((feature, index) => (
                <div key={index} className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          {/* 可以在这里添加图标 */}
                          <svg
                            className="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
