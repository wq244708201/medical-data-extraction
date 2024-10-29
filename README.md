# medical-data-extraction
A web application for extracting and analyzing medical data from ultrasound examination reports, built with Next.js and Aliyun Qwen AI model.

# MediData AI 医数智能

智能医疗数据提取与分析平台

## 项目简介
本项目是一个基于 Next.js 和通义千问AI模型开发的医疗数据提取工具，主要用于从超声检查报告中提取结构化数据。

## 主要功能
- Excel 文件上传和预览
- 智能数据提取
- 提取规则自定义
- 批量数据处理
- 结果导出

## 技术栈
- Next.js
- React
- Tailwind CSS
- XLSX
- 通义千问 API

## 安装与使用

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装步骤
1. 克隆项目
```bash
git clone https://github.com/你的用户名/medical-data-extraction.git

##安装依赖
cd medical-data-extraction
npm install

##环境配置 创建 .env.local 文件并添加以下配置：
NEXT_PUBLIC_API_KEY=your_api_key
NEXT_PUBLIC_ACCESS_KEY_ID=your_access_key_id
NEXT_PUBLIC_ACCESS_KEY_SECRET=your_access_key_secret

##启动开发服务器
npm run dev

#使用说明
1、上传 Excel 文件
2、选择需要处理的数据列
3、设置数据提取规则
4、开始处理并等待结果
5、导出处理后的数据
