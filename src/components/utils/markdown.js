/**
 * 处理 Markdown 自定义块
 * 支持 Diff 图像对比块和 Alert 提示块
 */

/**
 * 处理 Diff 类型的图像对比块
 * @param {string} html - 原始 HTML 内容
 * @returns {string} - 处理后的 HTML
 */
export const processDiffBlocks = (html) => {
  const diffBlockRegex =
    /:::Diff(?:{([^}]*)})?(?:{([^}]*)})?(?:{([^}]*)})?[\r\n]?([\s\S]*?):::/gi;

  return html.replace(
    diffBlockRegex,
    (match, variant1, variant2, variant3, content) => {
      // 解析内容，提取两个图片地址
      const parts = content.split("vs").map((part) => part.trim());

      if (parts.length !== 2) {
        return `<div class="alert alert-error">Diff格式错误: 需要使用 "vs" 分隔两个图片地址</div>`;
      }

      // 处理每个部分，提取URL和描述
      const extractImageInfo = (part) => {
        // 尝试匹配 Markdown 图像语法 ![alt](url)
        const mdImageRegex = /!\[(.*?)\]\(([^)]+)\)/;
        const mdMatch = part.match(mdImageRegex);

        // 尝试匹配 HTML img 标签
        const htmlImageRegex = /<img.*?src=["'](.*?)["'].*?>/i;
        const htmlMatch = part.match(htmlImageRegex);

        // 尝试匹配直接 URL (以 http:// 或 https:// 开头)
        const urlRegex = /(https?:\/\/[^\s"']+)/i;
        const urlMatch = part.match(urlRegex);

        if (mdMatch) {
          return {
            url: mdMatch[2].trim(),
            alt: mdMatch[1].trim() || "对比图",
          };
        } else if (htmlMatch) {
          return {
            url: htmlMatch[1],
            alt: "对比图",
          };
        } else if (urlMatch) {
          return {
            url: urlMatch[0],
            alt: "对比图",
          };
        } else {
          console.warn("无法识别图像格式:", part);
          return {
            url: "#",
            alt: "图像无效",
          };
        }
      };

      const image1 = extractImageInfo(parts[0]);
      const image2 = extractImageInfo(parts[1]);

      // 处理可选的样式参数
      let aspectRatio = "16/9"; // 默认比例

      if (variant1 && variant1.includes("aspect-")) {
        aspectRatio = variant1.replace("aspect-", "");
      } else if (variant2 && variant2.includes("aspect-")) {
        aspectRatio = variant2.replace("aspect-", "");
      } else if (variant3 && variant3.includes("aspect-")) {
        aspectRatio = variant3.replace("aspect-", "");
      }

      // 生成图像对比组件的HTML
      return `<figure class="diff aspect-${aspectRatio} rounded-lg overflow-hidden" tabindex="0">
        <div class="diff-item-1" role="img">
          <img class="rounded-lg" alt="${image1.alt}" src="${image1.url}" />
        </div>
        <div class="diff-item-2" role="img" tabindex="0">
          <img class="rounded-lg" alt="${image2.alt}" src="${image2.url}" />
        </div>
        <div class="diff-resizer"></div>
      </figure>`;
    }
  );
};

/**
 * 处理 Alert 类型的自定义块
 * @param {string} html - 原始 HTML 内容
 * @returns {string} - 处理后的 HTML
 */
export const processAlertBlocks = (html) => {
  const alertBlockRegex =
    /:::(info|warning|success|error)(?:{([^}]*)})?(?:{([^}]*)})?(?:{([^}]*)})?[\r\n]?([\s\S]*?):::/gi;

  return html.replace(
    alertBlockRegex,
    (match, type, variant1, variant2, variant3, content) => {
      // 转换类型为小写并标准化
      let blockType = type.toLowerCase();

      // 将类型映射到 DaisyUI 的 alert 类型
      const typeMap = {
        info: "info",
        warning: "warning",
        success: "success",
        error: "error",
      };

      const daisyType = typeMap[blockType] || "info"; // 默认使用info类型

      // 处理内容 - 保留HTML标记以支持更丰富的格式
      const cleanContent = content.trim();

      // 处理样式变体 (soft, outline, dash)
      let styleVariant = "";
      if ([variant1, variant2, variant3].includes("soft")) {
        styleVariant = " alert-soft";
      } else if ([variant1, variant2, variant3].includes("outline")) {
        styleVariant = " alert-outline";
      } else if ([variant1, variant2, variant3].includes("dash")) {
        styleVariant = " alert-dash";
      }

      // 处理是否显示图标
      const noIcon = [variant1, variant2, variant3].includes("noicon");

      // 根据不同类型选择不同的SVG图标
      let svgIcon = "";

      // 根据官方示例调整 SVG 类名
      let strokeClass = "";
      if (daisyType === "info") {
        strokeClass = "stroke-current"; // 默认 alert-info 用 stroke-current
      } else if (daisyType === "success") {
        strokeClass = "stroke-current"; // 默认 alert-success 用 stroke-current
      } else if (daisyType === "warning") {
        strokeClass = "stroke-current"; // 默认 alert-warning 用 stroke-current
      } else if (daisyType === "error") {
        strokeClass = "stroke-current"; // 默认 alert-error 用 stroke-current
      }

      if (!noIcon) {
        switch (daisyType) {
          case "info":
            svgIcon =
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
            break;
          case "warning":
            svgIcon =
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>';
            break;
          case "success":
            svgIcon =
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
            break;
          case "error":
            svgIcon =
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
            break;
        }
      }

      // 完全按照官方示例生成 Alert 组件 HTML
      return `<div role="alert" class="alert alert-${daisyType}${styleVariant}">
      ${
        !noIcon
          ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="${strokeClass} h-6 w-6 shrink-0">
        ${svgIcon}
      </svg>`
          : ""
      }
      <span>${cleanContent}</span>
    </div>`;
    }
  );
};
/**
 * 处理所有自定义块
 * @param {string} html - 原始 HTML 内容
 * @returns {string} - 处理后的 HTML
 */
export const processCustomBlocks = (html) => {
  // 先处理 Diff 块
  html = processDiffBlocks(html);

  // 再处理 Alert 块
  html = processAlertBlocks(html);

  // 这里可以添加更多自定义块处理

  return html;
};
