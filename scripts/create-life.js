import fs from "fs";
import path from "path";

// 获取命令行参数
const articleName = process.argv[2];

if (!articleName) {
  console.error("请提供文章名称!");
  console.log("用法: pnpm life 文章名称");
  process.exit(1);
}

// 创建 life 目录（如果不存在）
const lifeDir = path.resolve("./src/life");
if (!fs.existsSync(lifeDir)) {
  fs.mkdirSync(lifeDir, { recursive: true });
}

// 生成文件名
const fileName = `${articleName}.md`;
const filePath = path.join(lifeDir, fileName);

// 检查文件是否已存在
if (fs.existsSync(filePath)) {
  console.error(`文件 ${fileName} 已存在!`);
  process.exit(1);
}

// 获取当前日期和时间
const now = new Date();
const publishedDate = now.toISOString().split("T")[0];

// 创建文章模板
const template = `---
title: ${articleName}
published: ${publishedDate}
image: ""
tags: []
---

`;

// 写入文件
fs.writeFileSync(filePath, template);

console.log(`已创建生活文章: ${filePath}`);
