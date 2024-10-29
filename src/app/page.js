'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function Home() {
  const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [extractionPrompt, setExtractionPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const containsTestisInfo = (text) => {
    return /(?:睾丸|阴囊).{0,100}\d+\.?\d*cm/.test(text);
  };
  const [currentStep, setCurrentStep] = useState(1); // 当前步骤
  const steps = [
    { id: 1, title: '上传文件' },
    { id: 2, title: '选择数据列' },
    { id: 3, title: '设置规则' },
    { id: 4, title: '处理结果' },
  ];
  const StepNavigation = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex flex-col items-center relative z-10"
          >
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                ${currentStep >= step.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-300'}`}
            >
              {step.id}
            </div>
            <span
              className={`mt-2 text-sm ${
                currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {step.title}
            </span>
          </div>
        ))}
        <div className="absolute top-4 left-0 h-0.5 bg-gray-200 w-full -z-10">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-4">第一步：上传文件</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                选择Excel文件
              </label>
              {file && (
                <p className="mt-2 text-gray-600">已选择文件：{file.name}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-4">第二步：选择数据列</h2>
            {tableData ? (
              <div className="space-y-4">
                <select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                  className="w-full border rounded px-4 py-2"
                >
                  <option value="">请选择要处理的列</option>
                  {columns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">
                    数据预览（前5行）
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border">
                      <thead>
                        <tr>
                          {columns.map((column) => (
                            <th
                              key={column}
                              className="border px-4 py-2 bg-gray-50"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.slice(0, 5).map((row, index) => (
                          <tr key={index}>
                            {columns.map((column) => (
                              <td key={column} className="border px-4 py-2">
                                {row[column]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">请先上传文件</div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-4">第三步：设置提取规则</h2>
            <div className="space-y-6">
              {' '}
              {/* 增加间距 */}
              {/* 修改为提示词编辑区 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  当前提示词
                </label>
                <textarea
                  value={extractionPrompt}
                  onChange={(e) => setExtractionPrompt(e.target.value)}
                  placeholder="选择下方模板或直接编辑提示词"
                  className="w-full border rounded px-4 py-2 h-32" // 增加高度
                  rows={4}
                />
              </div>
              {/* 预设模板选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  选择预设模板
                </label>
                <div className="grid gap-4">
                  {[
                    {
                      title: '基础提取模板',
                      description: '适用于标准格式的检查报告',
                      template: `你是一位超声科主任医师，请从以下超声检查报告中提取左右睾丸的具体尺寸信息。

要求：
1. 仅提取睾丸本身的尺寸数据
2. 每个睾丸的尺寸应包含三个维度（长×前后径×宽）
3. 数据格式示例：3.5cm×2.0cm×2.3cm
4. 如果找不到完整的三维尺寸数据，请回答"未找到完整尺寸信息"

请按以下格式输出：
左侧睾丸：[尺寸数据]
右侧睾丸：[尺寸数据]`,
                    },
                    {
                      title: '严格提取模板',
                      description: '适用于需要严格格式验证的场景',
                      template: `作为超声科医师，请仔细分析以下超声检查报告，专注提取睾丸尺寸信息：

提取要求：
1. 严格筛选，仅提取睾丸本体的尺寸数据
2. 必须包含三维数据：长度×前后径×宽度（单位：cm）
3. 如遇到多组数据，优先选择描述睾丸实质的完整测量值
4. 确保数字和单位的完整性，例如"3.5cm×2.1cm×1.8cm"
5. 如发现数据不完整或可疑，标注"需要复查"

输出格式：
左侧睾丸：[三维尺寸]
右侧睾丸：[三维尺寸]`,
                    },
                    {
                      title: '专业提取模板',
                      description: '适用于复杂或非标准格式的报告',
                      template: `请作为超声科专家，从超声检查报告中精确提取睾丸测量数据：

关键要求：
1. 定位标准：
   - 查找"睾丸"、"双侧睾丸"等关键词
   - 识别相关测量数据段落
2. 数据要求：
   - 提取完整的三维数据（长×前后径×宽）
   - 确保单位为cm
   - 数据格式示例：4.2cm×2.1cm×1.9cm
3. 特殊情况处理：
   - 如遇不完整数据→标注"数据不完整"
   - 发现异常格式→标注"格式异常"
4. 验证步骤：
   - 确认数据完整性
   - 检查单位一致性
   - 核实数值合理性

请按如下格式输出：
左侧睾丸：[尺寸]
右侧睾丸：[尺寸]`,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-all"
                      onClick={() => setExtractionPrompt(item.template)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-blue-600">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.description}
                          </p>
                        </div>
                        <button
                          className="text-blue-600 text-sm hover:text-blue-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            // 打开预览模态框
                            // TODO: 实现模板预览功能
                          }}
                        >
                          预览全文
                        </button>
                      </div>
                      <pre className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                        {item.template.split('\n').slice(0, 3).join('\n') +
                          '\n...'}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
              {/* AI优化按钮 */}
              <div className="flex items-center gap-4">
                <button
                  onClick={async () => {
                    try {
                      if (!extractionPrompt.trim()) {
                        alert('请先选择模板或输入提示词');
                        return;
                      }
                      const optimized = await optimizePrompt(extractionPrompt);
                      setOptimizedPrompt(optimized);
                    } catch (error) {
                      console.error('优化失败:', error);
                      alert(error.message || '优化失败，请重试');
                    }
                  }}
                  disabled={!extractionPrompt || isOptimizing}
                  className={`${
                    isOptimizing || !extractionPrompt
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white px-6 py-2 rounded transition-colors flex-1`}
                >
                  {isOptimizing ? '优化中...' : '使用 AI 优化当前提示词'}
                </button>
              </div>
              {/* 优化后的提示词显示 */}
              {optimizedPrompt && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">AI 优化结果</h3>
                    <button
                      onClick={() => {
                        setExtractionPrompt(optimizedPrompt);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      使用此版本
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-600">
                    {optimizedPrompt}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-4">第四步：处理结果</h2>
            {isProcessing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">处理进度</span>
                  <span className="text-sm text-gray-600">
                    {processedCount}/{tableData.length} (
                    {Math.round((processedCount / tableData.length) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${(processedCount / tableData.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ) : results ? (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    {/* 结果表格内容... */}
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      const ws = XLSX.utils.json_to_sheet(results);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, '提取结果');
                      XLSX.writeFile(wb, '医疗数据提取结果.xlsx');
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    导出结果
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">请先开始处理数据</div>
            )}
          </div>
        );

      default:
        return null;
    }
  };
  const NavigationButtons = () => {
    const canProceed = () => {
      switch (currentStep) {
        case 1:
          return !!file;
        case 2:
          return !!selectedColumn;
        case 3:
          return !!extractionPrompt;
        default:
          return false;
      }
    };

    const handleNext = async () => {
      if (currentStep === 3) {
        await processData();
      }
      setCurrentStep(Math.min(4, currentStep + 1));
    };

    return (
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          className={`px-4 py-2 rounded ${
            currentStep === 1
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
          disabled={currentStep === 1}
        >
          上一步
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed() || currentStep === 4 || isProcessing}
          className={`px-4 py-2 rounded ${
            !canProceed() || currentStep === 4 || isProcessing
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {currentStep === 3
            ? isProcessing
              ? '处理中...'
              : '开始处理'
            : '下一步'}
        </button>
      </div>
    );
  };

  // 辅助函数
  const preprocessText = (text) => {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/：/g, ':')
      .replace(/，/g, ',')
      .replace(/。/g, '.')
      .trim();
  };

  const isCompleteSize = (size) => {
    if (!size) return false;
    const parts = size.split('×');
    return parts.length === 3 && parts.every((part) => part.includes('cm'));
  };

  // 在这里添加环境变量检查代码
  console.log('环境变量检查:', {
    API_KEY: process.env.NEXT_PUBLIC_API_KEY ? '存在' : '不存在',
    ACCESS_KEY_ID: process.env.NEXT_PUBLIC_ACCESS_KEY_ID ? '存在' : '不存在',
    ACCESS_KEY_SECRET: process.env.NEXT_PUBLIC_ACCESS_KEY_SECRET
      ? '存在'
      : '不存在',
  });

  const envCheck = {
    API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    ACCESS_KEY_ID: process.env.NEXT_PUBLIC_ACCESS_KEY_ID,
    ACCESS_KEY_SECRET: process.env.NEXT_PUBLIC_ACCESS_KEY_SECRET,
  };

  console.log('环境变量检查:', {
    API_KEY: envCheck.API_KEY ? '已设置' : '未设置',
    ACCESS_KEY_ID: envCheck.ACCESS_KEY_ID ? '已设置' : '未设置',
    ACCESS_KEY_SECRET: envCheck.ACCESS_KEY_SECRET ? '已设置' : '未设置',
  });

  if (
    !envCheck.API_KEY ||
    !envCheck.ACCESS_KEY_ID ||
    !envCheck.ACCESS_KEY_SECRET
  ) {
    console.error('环境变量未完全设置，请检查 .env.local 文件');
  }

  // API 配置
  const API_CONFIG = {
    url: '/api/v1/services/aigc/text-generation/generation',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      'Content-Type': 'application/json',
      'X-DashScope-AccessKeyId': process.env.NEXT_PUBLIC_ACCESS_KEY_ID,
      'X-DashScope-AccessKeySecret': process.env.NEXT_PUBLIC_ACCESS_KEY_SECRET,
    },
  };

  // 打印完整配置（隐藏敏感信息）
  console.log('API配置:', {
    url: API_CONFIG.url,
    headers: {
      ...API_CONFIG.headers,
      Authorization: API_CONFIG.headers.Authorization.replace(
        /Bearer\s+(.{4}).*(.{4})/,
        'Bearer $1****$2'
      ),
    },
  });

  // Excel文件读取函数
  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Excel文件解析失败'));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  };

  const optimizePrompt = async (userPrompt) => {
    const maxRetries = 3; // 最大重试次数
    let retryCount = 0;

    const makeRequest = async () => {
      try {
        console.log(`尝试调用 API... (第 ${retryCount + 1} 次)`);
        const response = await fetch(API_CONFIG.url, {
          method: 'POST',
          headers: API_CONFIG.headers,
          body: JSON.stringify({
            model: 'qwen-turbo',
            input: {
              prompt: `作为一位 AI 提示词专家，请将以下用户输入的提取规则优化成一个详细的、结构化的提示词。
  这个提示词将用于从超声检查报告中提取睾丸尺寸信息。
  
  用户输入的规则：
  ${userPrompt}
  
  请生成一个包含以下要素的详细提示词：
  1. 明确指出需要提取的具体内容（左右睾丸尺寸）
  2. 指定数据格式要求（如：长×前后径×宽）
  3. 说明如何处理特殊情况（如数据缺失、格式不标准等）
  4. 指定输出格式要求
  
  请按以下格式返回优化后的提示词（不要包含额外解释）：
  ===提示词开始===
  [优化后的提示词内容]
  ===提示词结束===`,
              temperature: 0.1,
            },
          }),
        });

        // 输出响应状态和头信息
        console.log('API响应状态:', response.status);
        console.log(
          'API响应头:',
          Object.fromEntries(response.headers.entries())
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API错误响应:', errorText);
          throw new Error(
            `API调用失败 (${response.status}): ${response.statusText}`
          );
        }

        const result = await response.json();
        console.log('API响应成功:', result);

        if (!result.output?.text) {
          throw new Error('API响应格式不正确');
        }

        return result.output.text;
      } catch (error) {
        console.error(
          `API调用出错 (尝试 ${retryCount + 1}/${maxRetries}):`,
          error
        );
        throw error;
      }
    };

    try {
      setIsOptimizing(true);

      while (retryCount < maxRetries) {
        try {
          const optimizedText = await makeRequest();
          const promptMatch = optimizedText.match(
            /===提示词开始===\n([\s\S]*?)\n===提示词结束===/
          );
          return promptMatch ? promptMatch[1].trim() : optimizedText;
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw error;
          }
          // 递增等待时间
          const waitTime = 1000 * retryCount;
          console.log(`等待 ${waitTime}ms 后重试...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    } catch (error) {
      throw new Error(`提示词优化失败: ${error.message}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  // AI 接口调用函数
  const callAI = async (text, prompt, retryCount = 3) => {
    const processedText = preprocessText(text);

    // 如果文本中没有睾丸相关信息，直接返回需要审核的结果
    if (!containsTestisInfo(processedText)) {
      return {
        leftSize: null,
        rightSize: null,
        needsReview: true,
        reviewReason: '未发现睾丸相关描述',
      };
    }

    // 构建默认的 AI 提示词（如果用户没有提供自定义提示词）
    const defaultPrompt = `
你是一位超声科主任医师，从以下超声检查报告文案中提取左右睾丸的具体尺寸信息。请注意以下几点：
1. 只提取睾丸本身的尺寸，不要提取其他结构（如无回声区）的尺寸。
2. 睾丸尺寸通常包含三个维度（长×宽×高或长×前后径×宽），例如"3.5cm×2.0cm×2.3cm"。
3. 如果报告中同时出现多组尺寸数据，请仔细分析上下文，确保提取的是睾丸本身的尺寸。
4. 尺寸数据应该包含数字和单位（cm），通常以"×"连接。
5. 如果无法找到具体的睾丸尺寸信息，请回答"未找到睾丸尺寸信息"。

请按以下格式回答：
左侧睾丸：[尺寸]
右侧睾丸：[尺寸]
  `.trim();

    const finalPrompt = prompt || defaultPrompt;
    let lastError = null;

    for (let i = 0; i < retryCount; i++) {
      try {
        console.log(`开始第 ${i + 1} 次尝试处理数据...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log('请求超时，正在重试...');
        }, 30000);

        const response = await fetch(API_CONFIG.url, {
          method: 'POST',
          headers: API_CONFIG.headers,
          body: JSON.stringify({
            model: 'qwen-turbo',
            input: {
              prompt: prompt + `\n\n医疗报告：\n${processedText}`,
              temperature: 0.1,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // 详细的响应状态检查
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `API请求失败 (状态码: ${response.status})`;

          try {
            const errorData = JSON.parse(errorText);
            errorMessage += `: ${errorData.message || errorText}`;
          } catch {
            errorMessage += `: ${errorText}`;
          }

          throw new Error(errorMessage);
        }

        const apiResponse = await response.json();

        // 验证 API 响应格式
        if (!apiResponse.output?.text) {
          throw new Error('API响应格式不正确: 缺少必要的输出数据');
        }

        const aiResponse = apiResponse.output.text;

        // 提取尺寸数据并验证格式
        // 提取尺寸数据并验证格式
        const leftMatch = aiResponse.match(/左侧睾丸[：:]\s*([^\n]+)/);
        const rightMatch = aiResponse.match(/右侧睾丸[：:]\s*([^\n]+)/);

        const leftSize = leftMatch
          ? leftMatch[1]
              .trim()
              .replace(/[，,]/g, '')
              .replace(/none|未找到睾丸尺寸信息/i, '')
          : null;
        const rightSize = rightMatch
          ? rightMatch[1]
              .trim()
              .replace(/[，,]/g, '')
              .replace(/none|未找到睾丸尺寸信息/i, '')
          : null;

        // 验证尺寸格式
        const validateSize = (size) => {
          if (!size) return false;
          const parts = size.split('×');
          return (
            parts.length === 3 &&
            parts.every((part) => /^\d+\.?\d*cm$/.test(part.trim()))
          );
        };

        // 添加结果验证日志
        console.log('数据处理结果:', {
          leftSize,
          rightSize,
          hasLeftSize: !!leftSize,
          hasRightSize: !!rightSize,
          leftSizeValid: validateSize(leftSize),
          rightSizeValid: validateSize(rightSize),
        });

        return {
          leftSize: leftSize || null,
          rightSize: rightSize || null,
          needsReview:
            !leftSize ||
            !rightSize ||
            !validateSize(leftSize) ||
            !validateSize(rightSize),
          reviewReason:
            !leftSize || !rightSize
              ? '未完整提取到睾丸尺寸信息'
              : !validateSize(leftSize) || !validateSize(rightSize)
                ? '睾丸尺寸格式不正确'
                : null,
        };
      } catch (error) {
        lastError = error;
        console.error(`第 ${i + 1} 次处理失败:`, error.message);

        // 如果还有重试机会，则等待后重试
        if (i < retryCount - 1) {
          const waitTime = Math.min(2000 * Math.pow(2, i), 10000); // 指数退避，最多等待10秒
          console.log(`等待 ${waitTime}ms 后进行第 ${i + 2} 次尝试...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    // 所有重试都失败后，抛出最后一次的错误
    throw new Error(`处理失败 (已重试${retryCount}次): ${lastError.message}`);
  };

  // 处理文件上传
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      try {
        const data = await readExcelFile(file);
        setTableData(data);
        setColumns(Object.keys(data[0] || {}));
      } catch (error) {
        alert('读取文件出错：' + error.message);
      }
    }
  };

  const processData = async () => {
    setIsProcessing(true);
    setProcessedCount(0);
    const results = [];
    const reviewReasons = {
      尺寸数据不完整: 0,
      处理错误: 0,
    };

    try {
      for (let i = 0; i < tableData.length; i++) {
        const row = tableData[i];
        try {
          const text = row[selectedColumn];
          if (!text) {
            throw new Error('文本内容为空');
          }

          // 更新进度
          setProcessedCount(i);

          // 调用AI进行处理
          const aiResult = await callAI(text, extractionPrompt);

          // 格式化结果
          const formattedResult = {
            ...row,
            左侧睾丸尺寸: aiResult.leftSize || '',
            右侧睾丸尺寸: aiResult.rightSize || '',
            处理状态: aiResult.needsReview ? '需审核' : '成功',
            审核原因: aiResult.reviewReason || '',
            处理时间: new Date().toLocaleString(),
          };

          if (aiResult.needsReview) {
            reviewReasons[aiResult.reviewReason] =
              (reviewReasons[aiResult.reviewReason] || 0) + 1;
          }

          results.push(formattedResult);
        } catch (error) {
          console.error('处理单条数据出错:', error);
          results.push({
            ...row,
            左侧睾丸尺寸: '',
            右侧睾丸尺寸: '',
            处理状态: '失败',
            审核原因: error.message,
            处理时间: new Date().toLocaleString(),
          });
          reviewReasons['处理错误']++;
        }

        // 更新进度
        setProcessedCount(i + 1);

        // 添加处理间隔
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setResults(results);

      // 显示处理统计
      const reviewCount = Object.values(reviewReasons).reduce(
        (a, b) => a + b,
        0
      );
      alert(
        `处理完成！\n` +
          `总数：${results.length} 条\n` +
          `需审核：${reviewCount} 条 (${((reviewCount / results.length) * 100).toFixed(1)}%)\n` +
          `审核原因统计：\n${Object.entries(reviewReasons)
            .filter(([_, count]) => count > 0)
            .map(([reason, count]) => `${reason}: ${count}条`)
            .join('\n')}`
      );
    } catch (error) {
      console.error('批量处理出错:', error);
      alert('处理出错：' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">
            MediData AI
            <span className="ml-2 text-sm text-gray-600">医数智能</span>
          </h1>
          <p className="text-gray-500 mt-2">智能医疗数据提取与分析平台</p>
        </div>

        {/* 步骤导航 */}
        <StepNavigation />

        {/* 步骤内容 */}
        <div className="mt-8">
          <StepContent />
        </div>

        {/* 导航按钮 */}
        <NavigationButtons />
      </div>
    </main>
  );
  {
    /* 文件上传区域 */
  }
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
    <input
      type="file"
      accept=".xlsx,.xls"
      onChange={handleFileUpload}
      className="hidden"
      id="fileInput"
    />
    <label
      htmlFor="fileInput"
      className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      选择Excel文件
    </label>
    {file && <p className="mt-2 text-gray-600">已选择文件：{file.name}</p>}
  </div>;
  {
    /* 数据预览 */
  }
  {
    tableData && (
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">数据预览（前5行）</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column} className="border px-4 py-2 bg-gray-50">
                    {column}
                  </th>
                ))}
                <th className="border px-4 py-2 bg-gray-50">左侧睾丸尺寸</th>
                <th className="border px-4 py-2 bg-gray-50">右侧睾丸尺寸</th>
                <th className="border px-4 py-2 bg-gray-50">处理状态</th>
                <th className="border px-4 py-2 bg-gray-50">审核原因</th>
              </tr>
            </thead>
            <tbody>
              {tableData.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column} className="border px-4 py-2">
                      {row[column]}
                    </td>
                  ))}
                  <td className="border px-4 py-2">{row.左侧睾丸尺寸}</td>
                  <td className="border px-4 py-2">{row.右侧睾丸尺寸}</td>
                  <td className="border px-4 py-2">
                    <span
                      className={`${
                        row.处理状态 === '成功'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {row.处理状态}
                    </span>
                  </td>
                  <td className="border px-4 py-2">{row.审核原因}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  {
    /* 选择处理列 */
  }
  {
    tableData && (
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">选择要处理的列</h2>
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="w-full border rounded px-4 py-2"
        >
          <option value="">请选择</option>
          {columns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>
    );
  }
  {
    /* 提取规则输入 */
  }
  {
    selectedColumn && (
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">设置提取规则</h2>
        <div className="space-y-4">
          {/* 基础规则输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              基础规则描述
            </label>
            <textarea
              value={extractionPrompt}
              onChange={(e) => setExtractionPrompt(e.target.value)}
              placeholder="请简单描述需要提取的信息，例如：提取左右睾丸的尺寸"
              className="w-full border rounded px-4 py-2 h-20"
            />
          </div>

          {/* 提示词模板选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择预设模板
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  setExtractionPrompt(e.target.value);
                }
              }}
              className="w-full border rounded px-4 py-2 mb-4"
            >
              <option value="">选择预设模板</option>
              <option
                value={`你是一位超声科主任医师，请从以下超声检查报告中提取左右睾丸的具体尺寸信息。

要求：
1. 仅提取睾丸本身的尺寸数据
2. 每个睾丸的尺寸应包含三个维度（长×前后径×宽）
3. 数据格式示例：3.5cm×2.0cm×2.3cm
4. 如果找不到完整的三维尺寸数据，请回答"未找到完整尺寸信息"

请按以下格式输出：
左侧睾丸：[尺寸数据]
右侧睾丸：[尺寸数据]`}
              >
                模板1: 基础提取模板
              </option>
              <option
                value={`作为超声科医师，请仔细分析以下超声检查报告，专注提取睾丸尺寸信息：

提取要求：
1. 严格筛选，仅提取睾丸本体的尺寸数据
2. 必须包含三维数据：长度×前后径×宽度（单位：cm）
3. 如遇到多组数据，优先选择描述睾丸实质的完整测量值
4. 确保数字和单位的完整性，例如"3.5cm×2.1cm×1.8cm"
5. 如发现数据不完整或可疑，标注"需要复查"

输出格式：
左侧睾丸：[三维尺寸]
右侧睾丸：[三维尺寸]`}
              >
                模板2: 严格提取模板
              </option>
              <option
                value={`请作为超声科专家，从超声检查报告中精确提取睾丸测量数据：

关键要求：
1. 定位标准：
   - 查找"睾丸"、"双侧睾丸"等关键词
   - 识别相关测量数据段落
2. 数据要求：
   - 提取完整的三维数据（长×前后径×宽）
   - 确保单位为cm
   - 数据格式示例：4.2cm×2.1cm×1.9cm
3. 特殊情况处理：
   - 如遇不完整数据→标注"数据不完整"
   - 发现异常格式→标注"格式异常"
4. 验证步骤：
   - 确认数据完整性
   - 检查单位一致性
   - 核实数值合理性

请按如下格式输出：
左侧睾丸：[尺寸]
右侧睾丸：[尺寸]`}
              >
                模板3: 专业提取模板
              </option>
            </select>
          </div>

          {/* AI优化按钮 */}
          <div className="flex space-x-4">
            <button
              onClick={async () => {
                try {
                  if (!extractionPrompt.trim()) {
                    alert('请先输入基础规则描述或选择模板');
                    return;
                  }
                  const optimized = await optimizePrompt(extractionPrompt);
                  setOptimizedPrompt(optimized);
                } catch (error) {
                  console.error('优化失败:', error);
                  alert(error.message || '优化失败，请重试');
                }
              }}
              disabled={!extractionPrompt || isOptimizing}
              className={`${
                isOptimizing || !extractionPrompt
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white px-4 py-2 rounded transition-colors flex-1`}
            >
              {isOptimizing ? '优化中...' : '优化提取规则'}
            </button>
          </div>

          {/* 优化后的提示词编辑器 */}
          {optimizedPrompt && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  优化后的提取规则（可编辑）
                </label>
                <button
                  onClick={() => {
                    setExtractionPrompt(optimizedPrompt);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  使用此规则
                </button>
              </div>
              <textarea
                value={optimizedPrompt}
                onChange={(e) => setOptimizedPrompt(e.target.value)}
                className="w-full border rounded p-4 text-sm min-h-[200px] font-mono"
                placeholder="优化后的提取规则将显示在这里，您可以直接编辑"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
  {
    /* 优化后的提示词显示 */
  }
  {
    optimizedPrompt && (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            优化后的提取规则
          </label>
          <button
            onClick={() => {
              setExtractionPrompt(optimizedPrompt);
            }}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            使用此规则
          </button>
        </div>
        <div className="bg-gray-50 rounded p-4 text-sm border border-gray-200">
          <pre className="whitespace-pre-wrap">{optimizedPrompt}</pre>
        </div>
      </div>
    );
  }
  {
    /* 开始处理按钮 */
  }
  {
    selectedColumn && extractionPrompt && (
      <div className="mt-4">
        <button
          onClick={processData}
          disabled={isProcessing}
          className={`${
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white px-6 py-2 rounded transition-colors`}
        >
          {isProcessing ? '处理中...' : '开始处理'}
        </button>
        {isProcessing && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">处理进度</span>
              <span className="text-sm text-gray-600">
                {processedCount}/{tableData.length} (
                {Math.round((processedCount / tableData.length) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(processedCount / tableData.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  }
  {
    results && results.length > 0 && (
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            const ws = XLSX.utils.json_to_sheet(results);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, '提取结果');
            XLSX.writeFile(wb, '医疗数据提取结果.xlsx');
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          导出结果
        </button>
      </div>
    );
  }
}
