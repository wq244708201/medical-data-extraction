'use client';
import { useAuth, RedirectToSignIn } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { XCircle } from 'lucide-react';
import { useToast } from './contexts/ToastContext';
import { UserButton } from '@/components/auth/UserButton';

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const { showToast } = useToast();
  const [file, setFile] = useState(null);

  // 添加身份验证检查
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return <RedirectToSignIn />;
  }
  const [tableData, setTableData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [extractionPrompt, setExtractionPrompt] = useState('');
  const [processingStats, setProcessingStats] = useState({
    successCount: 0,
    reviewCount: 0,
    errorCount: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [displayColumns] = useState([
    '左侧睾丸尺寸',
    '右侧睾丸尺寸',
    '处理状态',
    '审核原因',
    '处理时间',
  ]);
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [controller, setController] = useState(null);
  const [success, setSuccess] = useState('');
  useEffect(() => {
    if (isCancelled) {
      console.log('处理被取消');
    }
  }, [isCancelled]);
  const containsTestisInfo = text => {
    if (!text) return false;
    try {
      return /(?:睾丸|阴囊).{0,100}\d+\.?\d*cm/.test(text);
    } catch (error) {
      console.error('正则匹配错误:', error);
      return false;
    }
  };
  const [currentStep, setCurrentStep] = useState(1); // 当前步骤
  const steps = [
    {
      id: 1,
      title: '上传文件',
      description: '支持.xlsx,.xls格式，最大10MB',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
    },
    {
      id: 2,
      title: '选择数据列',
      description: '选择需要提取的数据列',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
          />
        </svg>
      ),
    },
    {
      id: 3,
      title: '设置规则',
      description: '配置数据提取规则',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: 4,
      title: '处理结果',
      description: '查看和导出处理结果',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];
  const StepNavigation = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* 背景连接线 */}
        <div className="absolute top-7 left-0 w-full h-0.5 bg-gray-200 -z-10" />
        {/* 进度连接线 */}
        <div
          className="absolute top-7 left-0 h-0.5 bg-blue-600 transition-all duration-700 -z-10"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map(step => (
          <div
            key={step.id}
            className="flex flex-col items-center relative z-10 group"
            onClick={() => {
              if (step.id < currentStep) {
                setCurrentStep(step.id);
              }
            }}
          >
            <div
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center
              transition-all duration-300 cursor-pointer
              ${
                currentStep >= step.id
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 text-gray-300'
              } 
              ${currentStep === step.id ? 'ring-4 ring-blue-100' : ''}
              ${step.id < currentStep ? 'hover:bg-blue-700' : ''}`}
            >
              {step.icon}
            </div>
            <div className="mt-3 flex flex-col items-center">
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {step.title}
              </span>
              <span className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 -bottom-8 w-40 text-center">
                {step.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-6">第一步：上传文件</h2>
            <div className="max-w-2xl mx-auto">
              {!file ? (
                // 未上传状态的上传区域
                <div
                  className={`border-2 border-dashed rounded-lg transition-all duration-300 ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                  onDragOver={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isDragActive) setIsDragActive(true);
                  }}
                  onDragEnter={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isDragActive) setIsDragActive(true);
                  }}
                  onDragLeave={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isDragActive) setIsDragActive(false);
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragActive(false);

                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                      const file = files[0];
                      const validTypes = [
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'application/vnd.ms-excel',
                      ];
                      if (!validTypes.includes(file.type)) {
                        alert('只支持 Excel 文件（.xlsx, .xls）');
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        alert('文件大小不能超过10MB');
                        return;
                      }
                      handleFileUpload({ target: { files: [file] } });
                    }
                  }}
                >
                  <div className="space-y-6 text-center p-8">
                    <div className="flex flex-col items-center">
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                      ) : (
                        <>
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex flex-col items-center text-sm text-gray-600 mt-4">
                            <span>将文件拖放到此处，或</span>
                            <label
                              htmlFor="fileInput"
                              className="relative cursor-pointer hover:text-blue-600 mt-2"
                            >
                              <span className="text-blue-500 hover:text-blue-700 font-medium">
                                点击选择文件
                              </span>
                              <input
                                id="fileInput"
                                type="file"
                                className="hidden"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                              />
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // 已上传状态的文件信息卡片
                <div className="bg-white border rounded-lg shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-8 w-8 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            已上传文件
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {file.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {/* 重新上传按钮 */}
                        <label
                          htmlFor="fileInput"
                          className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                        >
                          重新上传
                          <input
                            id="fileInput"
                            type="file"
                            className="hidden"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                          />
                        </label>
                        {/* 删除按钮 */}
                        <button
                          onClick={() => {
                            setFile(null);
                            setTableData(null);
                            setColumns([]);
                            setSuccess('');
                            setError(null);
                          }}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          删除文件
                        </button>
                      </div>
                    </div>

                    {/* 文件详细信息 */}
                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          文件大小
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          上传时间
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date().toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          数据行数
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {tableData ? tableData.length : '计算中...'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          数据列数
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {columns ? columns.length : '计算中...'}
                        </p>
                      </div>
                    </div>

                    {/* 成功提示 */}
                    {success && (
                      <div className="mt-4 bg-green-50 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                              {success}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 文件要求说明 */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  使用说明
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>请确保文件包含需要处理的医疗数据列</li>
                  <li>建议先使用小批量数据测试</li>
                  <li>支持格式：.xlsx, .xls（最大10MB）</li>
                </ul>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">上传出错</h3>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-4">第二步：选择数据列</h2>
            {tableData ? (
              <div className="flex flex-col h-[calc(100vh-300px)] max-h-[800px]">
                {/* 固定在顶部的选择框 */}
                <div className="bg-white p-4 border-b shadow-sm sticky top-0 z-10">
                  <div className="max-w-2xl mx-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      选择需要处理的数据列
                    </label>
                    <div className="flex gap-4 items-start">
                      <select
                        value={selectedColumn}
                        onChange={e => setSelectedColumn(e.target.value)}
                        className="flex-1 border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">请选择要处理的列</option>
                        {columns.map(column => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>

                      {/* 添加快速预览按钮 */}
                      {selectedColumn && (
                        <button
                          onClick={() => {
                            // 找到预览表格中选中列的单元格，并高亮显示
                            const cells = document.querySelectorAll(
                              `.column-${selectedColumn}`
                            );
                            cells.forEach(cell => {
                              cell.classList.add('bg-blue-50');
                              setTimeout(
                                () => cell.classList.remove('bg-blue-50'),
                                2000
                              );
                            });
                          }}
                          className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          预览选中列
                        </button>
                      )}
                    </div>

                    {selectedColumn && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            已选择：{selectedColumn}
                          </span>
                          <span className="text-sm text-gray-600">
                            共 {tableData.length} 条数据
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 使用分栏布局显示预览数据 */}
                <div className="flex-1 overflow-hidden mt-4">
                  <div className="grid grid-cols-2 gap-6 h-full">
                    {/* 左侧：原始数据预览 */}
                    <div className="overflow-auto border rounded-lg bg-white">
                      <div className="sticky top-0 bg-white border-b p-3">
                        <h3 className="font-medium text-gray-900">
                          原始数据预览
                        </h3>
                        <p className="text-sm text-gray-500">
                          显示所有列的前5行数据
                        </p>
                      </div>
                      <div className="p-4">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {columns.map(column => (
                                <th
                                  key={column}
                                  className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                    column === selectedColumn
                                      ? 'bg-blue-50'
                                      : ''
                                  }`}
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {tableData.slice(0, 5).map((row, index) => (
                              <tr key={index}>
                                {columns.map(column => (
                                  <td
                                    key={column}
                                    className={`px-3 py-2 text-sm text-gray-900 max-w-xs truncate column-${column} ${
                                      column === selectedColumn
                                        ? 'bg-blue-50'
                                        : ''
                                    }`}
                                    title={row[column]} // 添加悬停提示
                                  >
                                    {row[column]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 右侧：选中列数据预览 */}
                    <div className="overflow-auto border rounded-lg bg-white">
                      <div className="sticky top-0 bg-white border-b p-3">
                        <h3 className="font-medium text-gray-900">
                          选中列数据预览
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedColumn
                            ? `"${selectedColumn}" 列的详细内容`
                            : '请先选择要处理的数据列'}
                        </p>
                      </div>
                      <div className="p-4">
                        {selectedColumn ? (
                          <div className="space-y-4">
                            {tableData.slice(0, 5).map((row, index) => (
                              <div
                                key={index}
                                className="p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="text-sm text-gray-500 mb-1">
                                  数据 #{index + 1}
                                </div>
                                <div className="text-sm text-gray-900 whitespace-pre-wrap">
                                  {row[selectedColumn]}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                              />
                            </svg>
                            <p className="mt-2">请在左侧选择要处理的数据列</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 数据统计信息 */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-500">
                        总行数
                      </div>
                      <div className="text-xl font-semibold text-gray-900">
                        {tableData.length}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-500">
                        总列数
                      </div>
                      <div className="text-xl font-semibold text-gray-900">
                        {columns.length}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-500">
                        预览行数
                      </div>
                      <div className="text-xl font-semibold text-gray-900">
                        5
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  暂无数据
                </h3>
                <p className="mt-1 text-sm text-gray-500">请先上传文件</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-6">第三步：设置提取规则</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* 左侧：模板选择区域 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  选择预设模板
                </h3>
                <div className="space-y-4">
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
                  ].map((template, index) => (
                    <div
                      key={index}
                      onClick={() => setExtractionPrompt(template.template)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        extractionPrompt === template.template
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-blue-600">
                            {template.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {template.description}
                          </p>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            // 显示模板预览弹窗
                            setPreviewTemplate(template);
                            setShowPreview(true);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          预览全文
                        </button>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md max-h-24 overflow-y-auto">
                        {template.template.split('\n').slice(0, 3).join('\n')}
                        ...
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 右侧：当前提示词和优化区域 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  当前提示词
                  {extractionPrompt && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (可编辑)
                    </span>
                  )}
                </h3>
                <div className="rounded-lg border border-gray-200">
                  <textarea
                    value={extractionPrompt}
                    onChange={e => setExtractionPrompt(e.target.value)}
                    placeholder="请从左侧选择模板或直接编辑提示词"
                    className="w-full h-64 p-4 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* AI优化按钮 */}
                {extractionPrompt && (
                  <button
                    onClick={async () => {
                      try {
                        if (!extractionPrompt.trim()) {
                          showToast('请先选择模板或输入提示词', 'warning');
                          return;
                        }
                        const optimized =
                          await optimizePrompt(extractionPrompt);
                        setOptimizedPrompt(optimized);
                      } catch (error) {
                        console.error('优化失败:', error);
                        showToast(error.message || '优化失败，请重试', 'error');
                      }
                    }}
                    disabled={!extractionPrompt || isOptimizing}
                    className={`w-full p-3 rounded-lg transition-colors ${
                      isOptimizing || !extractionPrompt
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isOptimizing ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        正在优化提示词...
                      </span>
                    ) : (
                      'AI 优化提示词'
                    )}
                  </button>
                )}

                {/* AI优化结果 */}
                {optimizedPrompt && (
                  <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-blue-900">AI 优化结果</h4>
                      <button
                        onClick={() => {
                          setExtractionPrompt(optimizedPrompt);
                          showToast('已应用优化后的提示词', 'success');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        应用此版本
                      </button>
                    </div>
                    <div className="bg-white rounded-md p-3 text-sm text-gray-600">
                      <pre className="whitespace-pre-wrap">
                        {optimizedPrompt}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 模板预览弹窗 */}
            {showPreview && previewTemplate && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-medium text-gray-900">
                      {previewTemplate.title}
                    </h3>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-4 overflow-y-auto flex-1">
                    <pre className="whitespace-pre-wrap text-sm text-gray-600">
                      {previewTemplate.template}
                    </pre>
                  </div>
                  <div className="border-t p-4 flex justify-end bg-gray-50">
                    <button
                      onClick={() => {
                        setExtractionPrompt(previewTemplate.template);
                        setShowPreview(false);
                        showToast('已选择模板', 'success');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      使用此模板
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-6">第四步：处理结果</h2>
            {isProcessing ? (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  {/* 标题与取消按钮 */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          正在处理数据
                        </h3>
                        <p className="text-sm text-gray-500">
                          请耐心等待，处理完成后可查看结果
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (
                          confirm('确定要取消处理吗？已处理的数据将被保留。')
                        ) {
                          if (controller) {
                            controller.abort(); // 取消所有正在进行的请求
                            setIsCancelled(true);
                          }
                        }
                      }}
                      className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      取消处理
                    </button>
                  </div>

                  {/* 进度条部分 */}
                  <div className="space-y-4 border-t border-b py-6">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        处理进度
                      </span>
                      <span className="text-blue-600 font-medium">
                        {processedCount}/{tableData.length}
                        <span className="text-gray-500 ml-2">
                          (
                          {Math.round(
                            (processedCount / tableData.length) * 100
                          )}
                          %)
                        </span>
                      </span>
                    </div>

                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                        <div
                          className="transition-all duration-300 ease-out shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                          style={{
                            width: `${(processedCount / tableData.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <div>
                        预计剩余时间：
                        {Math.ceil(
                          (tableData.length - processedCount) * 1.5
                        )}{' '}
                        秒
                      </div>
                      <div>
                        当前速度：
                        {(
                          (processedCount / (processedCount * 1.5)) *
                          60
                        ).toFixed(1)}{' '}
                        条/分钟
                      </div>
                    </div>
                  </div>

                  {/* 实时处理结果预览 */}
                  {results && results.length > 0 && (
                    <div className="mt-6 bg-white rounded-lg border">
                      <div className="p-4 border-b">
                        <h4 className="text-sm font-medium text-gray-900">
                          最新处理结果（实时预览）
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          显示最新处理的5条数据
                        </p>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                              {displayColumns.map(column => (
                                <th
                                  key={column}
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {results.slice(-5).map((row, index) => (
                              <tr
                                key={index}
                                className={
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }
                              >
                                {displayColumns.map(column => (
                                  <td
                                    key={column}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                  >
                                    {row[column]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : results ? (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        处理完成
                      </h3>
                      <p className="text-sm text-gray-500">
                        共处理 {results.length} 条数据，
                        <span className="text-green-600">
                          {results.filter(r => r.处理状态 === '成功').length}{' '}
                          条成功
                        </span>
                        ，
                        <span className="text-yellow-600">
                          {results.filter(r => r.处理状态 === '需审核').length}{' '}
                          条需要审核
                        </span>
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          try {
                            const ws = XLSX.utils.json_to_sheet(results);
                            const wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, '提取结果');

                            const timestamp = new Date()
                              .toISOString()
                              .replace(/[:.]/g, '-');
                            const fileName = `医疗数据提取结果_${timestamp}.xlsx`;

                            XLSX.writeFile(wb, fileName);
                          } catch (error) {
                            console.error('导出失败:', error);
                            alert('导出失败：' + error.message);
                          }
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
                      >
                        <svg
                          className="-ml-1 mr-2 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        导出 Excel
                      </button>
                    </div>
                  </div>

                  {/* 数据统计卡片 */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="font-medium text-green-800">成功处理</div>
                      <div className="text-2xl font-bold text-green-600">
                        {results.filter(r => r.处理状态 === '成功').length}
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="font-medium text-yellow-800">
                        需要审核
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {results.filter(r => r.处理状态 === '需审核').length}
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="font-medium text-red-800">处理失败</div>
                      <div className="text-2xl font-bold text-red-600">
                        {results.filter(r => r.处理状态 === '失败').length}
                      </div>
                    </div>
                  </div>

                  {/* 结果预览表格 */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">
                      数据预览（前5条）
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(results[0] || {}).map(column => (
                              <th
                                key={column}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {results.slice(0, 5).map((row, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }
                            >
                              {Object.keys(row).map(column => (
                                <td
                                  key={column}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                  {row[column]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {results.length > 5 && (
                      <p className="text-gray-500 text-sm mt-4">
                        仅显示前 5 条记录，完整数据请导出查看
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  暂无数据
                </h3>
                <p className="mt-1 text-sm text-gray-500">请先开始处理数据</p>
              </div>
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
          return !!extractionPrompt && !isOptimizing;
        default:
          return false;
      }
    };

    const handleNext = async () => {
      if (currentStep === 3) {
        setCurrentStep(4); // 先跳转到第4步
        processData(); // 然后开始处理
      } else {
        setCurrentStep(Math.min(4, currentStep + 1));
      }
    };

    return (
      <div className="flex justify-between mt-8">
        {/* 上一步按钮 */}
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          className={`px-4 py-2 rounded ${
            currentStep === 1 || isProcessing
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
          disabled={currentStep === 1 || isProcessing}
        >
          上一步
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed() || currentStep === 4 || isProcessing}
          className={`px-4 py-2 rounded ${
            !canProceed() || currentStep === 4 || isProcessing || isOptimizing
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {currentStep === 3 ? '开始处理' : '下一步'}
        </button>
      </div>
    );
  };

  // 辅助函数
  const preprocessText = text => {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/：/g, ':')
      .replace(/，/g, ',')
      .replace(/。/g, '.')
      .trim();
  };

  const isCompleteSize = size => {
    if (!size) return false;
    const parts = size.split('×');
    return parts.length === 3 && parts.every(part => part.includes('cm'));
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
  const readExcelFile = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
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

  const optimizePrompt = async userPrompt => {
    const maxRetries = 3; // 最大重试次数
    let retryCount = 0;

    try {
      setIsOptimizing(true); // 新增：开始优化时设置状态

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
          const waitTime = 1000 * retryCount;
          console.log(`等待 ${waitTime}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    } catch (error) {
      throw new Error(`提示词优化失败: ${error.message}`);
    } finally {
      setIsOptimizing(false); // 新增：完成时重置状态
    }
  };

  // AI 接口调用函数
  const callAI = async (text, prompt, retryCount = 3, signal) => {
    const processedText = preprocessText(text);

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
        // 检查是否已取消
        if (signal?.aborted) {
          throw new Error('操作已取消');
        }

        console.log(`开始第 ${i + 1} 次尝试处理数据...`);

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
          signal, // 确保传入 signal
        });

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
        const validateSize = size => {
          if (!size) return false;
          const parts = size.split('×');
          return (
            parts.length === 3 &&
            parts.every(part => /^\d+\.?\d*cm$/.test(part.trim()))
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
        if (signal?.aborted) {
          throw new Error('操作已取消');
        }

        lastError = error;
        console.error(`第 ${i + 1} 次处理失败:`, error.message);

        if (i < retryCount - 1) {
          const waitTime = Math.min(2000 * Math.pow(2, i), 10000);
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, waitTime);
            signal?.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('操作已取消'));
            });
          });
        }
      }
    }

    throw lastError;
  };

  // 处理文件上传
  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (file) {
      setError(null);
      setSuccess('');
      setIsLoading(true);

      try {
        // 文件类型检查
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls'].includes(fileExt)) {
          throw new Error('只支持.xlsx和.xls格式的Excel文件');
        }

        // 文件大小检查（10MB限制）
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('文件大小不能超过10MB');
        }

        setFile(file);
        const data = await readExcelFile(file);

        if (data.length === 0) {
          throw new Error('Excel文件不能为空');
        }

        setTableData(data);
        setColumns(Object.keys(data[0] || {}));

        // 设置成功提示
        setSuccess(`成功读取 ${data.length} 条数据`);
      } catch (error) {
        setError(error.message);
        setFile(null);
        setTableData(null);
        setColumns([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const processData = async () => {
    if (!tableData || tableData.length === 0) {
      showToast('请先上传数据文件', 'warning');
      return;
    }
    if (!selectedColumn) {
      showToast('请选择要处理的数据列', 'warning');
      return;
    }
    if (!extractionPrompt) {
      showToast('请设置提取规则', 'warning');
      return;
    }

    // 创建新的 AbortController
    const newController = new AbortController();
    setController(newController);
    setIsCancelled(false);
    setIsProcessing(true);
    setProcessedCount(0);
    let results = [];

    try {
      for (let i = 0; i < tableData.length; i++) {
        // 每次循环开始检查是否已取消
        if (newController.signal.aborted) {
          console.log('处理已被取消');
          break;
        }

        const row = tableData[i];
        try {
          const text = row[selectedColumn];
          if (!text) {
            throw new Error('文本内容为空');
          }

          setProcessedCount(i);

          const aiResult = await callAI(
            text,
            extractionPrompt,
            3,
            newController.signal
          );

          // 添加取消检查
          if (newController.signal.aborted) break;

          const formattedResult = {
            ...row,
            左侧睾丸尺寸: aiResult.leftSize || '',
            右侧睾丸尺寸: aiResult.rightSize || '',
            处理状态: aiResult.needsReview ? '需审核' : '成功',
            审核原因: aiResult.reviewReason || '',
            处理时间: new Date().toLocaleString(),
          };

          results.push(formattedResult);

          if (!newController.signal.aborted) {
            setResults([...results]);
            setProcessedCount(i + 1);

            // 使用可取消的延时
            await new Promise((resolve, reject) => {
              const timeoutId = setTimeout(resolve, 1000);
              newController.signal.addEventListener('abort', () => {
                clearTimeout(timeoutId);
                reject(new Error('已取消'));
              });
            });
          }
        } catch (error) {
          if (newController.signal.aborted) break;

          console.error('处理单条数据出错:', error);
          results.push({
            ...row,
            左侧睾丸尺寸: '',
            右侧睾丸尺寸: '',
            处理状态: '失败',
            审核原因: error.message,
            处理时间: new Date().toLocaleString(),
          });

          if (!newController.signal.aborted) {
            setResults([...results]);
          }
        }
      }
    } catch (error) {
      console.error('批量处理出错:', error);
      if (!newController.signal.aborted) {
        showToast('处理出错：' + error.message, 'error');
      }
    } finally {
      setIsProcessing(false);
      if (newController.signal.aborted) {
        showToast('已取消处理', 'warning');
        setProcessedCount(results.length);
      } else {
        showToast('处理完成', 'success');
      }
      setIsCancelled(false);
      setController(null);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="absolute top-4 right-4">
        <UserButton />
      </div>
      <div className="max-w-6xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-lg shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-4 text-left">
              <h1 className="text-3xl font-bold text-gray-900">
                MediData AI
                <span className="ml-2 text-sm font-normal text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  医数智能 v1.2.0
                </span>
              </h1>
              <p className="text-gray-600 mt-1">智能医疗数据提取与分析平台</p>
            </div>
          </div>

          {/* 功能特点卡片 */}
          <div className="mt-6 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-blue-600 font-medium mb-2">智能提取</div>
              <div className="text-sm text-gray-600">
                自动识别并提取医疗报告中的关键数据
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-green-600 font-medium mb-2">批量处理</div>
              <div className="text-sm text-gray-600">
                支持大量数据的高效批量处理
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-purple-600 font-medium mb-2">导出分析</div>
              <div className="text-sm text-gray-600">
                灵活导出格式，支持后续分析
              </div>
            </div>
          </div>
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
}
