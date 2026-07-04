# 🚀 Vercel 部署教程（纯鼠标，3分钟搞定）

> 目标：把项目部署到 Vercel，获得一个国内访问速度快的在线地址

---

## 为什么需要 Vercel？

| 对比 | GitHub Pages | Vercel |
|:---|:---|:---|
| 国内速度 | 较慢，有时打不开 | ✅ 很快 |
| HTTPS | ✅ 自带 | ✅ 自带 |
| 缓存更新 | 慢（5~10分钟） | ✅ 秒级 |
| 自定义域名 | 支持 | ✅ 支持 |

---

## 部署步骤（只用鼠标，不用敲命令）

### 第1步：打开 Vercel 网站

打开浏览器，访问 👉 **https://vercel.com**

### 第2步：注册/登录

1. 点击页面上的 **「Sign Up」** 按钮
2. 选择 **「Continue with GitHub」**（用 GitHub 账号登录，最方便）
3. 授权 Vercel 访问你的 GitHub 仓库

```
┌─────────────────────────────┐
│                             │
│    Sign Up to Vercel        │
│                             │
│  [Continue with GitHub]     │  ← 点这个！
│                             │
│  [Continue with GitLab]     │
│  [Continue with Bitbucket]  │
│                             │
└─────────────────────────────┘
```

### 第3步：导入项目

登录后，你会看到 Vercel 控制台：

1. 点击 **「Add New...」** 按钮
2. 选择 **「Project」**
3. 在仓库列表中找到 **「texas-holdem-calculator」**
4. 点击它右边的 **「Import」** 按钮

```
┌─────────────────────────────────────┐
│  Add New... ▼                       │
│     Project                         │  ← 选这个
│     Domain                          │
└─────────────────────────────────────┘

Import Git Repository

[🔍 Search...]

kfat77/texas-holdem-calculator    [Import]  ← 点 Import
other-repo                        [Import]
...
```

### 第4步：配置项目

进入配置页面，填写以下信息：

| 配置项 | 填写内容 |
|:---|:---|
| **Project Name** | `texas-holdem-calculator`（可以改） |
| **Framework Preset** | `Other` |
| **Root Directory** | `./`（默认，不要改） |
| **Build Command** | 留空 |
| **Output Directory** | 留空 |

⚠️ **重要**：Framework Preset 一定要选 `Other`，因为我们没有使用 React/Vue 等框架。

### 第5步：部署

1. 确认配置无误后，点击页面底部的 **「Deploy」** 按钮
2. 等待约 30 秒，Vercel 会自动构建和部署
3. 看到 🎉 **Congratulations!** 页面就是成功了！

### 第6步：获取你的网址

部署成功后，Vercel 会给你分配一个域名，格式类似：

```
https://texas-holdem-calculator-你的用户名.vercel.app
```

例如：
```
https://texas-holdem-calculator-kfat77.vercel.app
```

点击 **「Visit」** 按钮，或者复制这个地址到浏览器打开，就能用了！

---

## 🔗 关于你提到的域名

你说的是这个地址：
```
https://texas-holdem-calculator.vercel.app/
```

⚠️ **注意**：Vercel 默认分配的域名格式是 **「项目名-用户名.vercel.app」**，不是「项目名.vercel.app」。

如果你想要 `texas-holdem-calculator.vercel.app` 这个短域名，需要：
1. 先完成上面的部署
2. 在 Vercel 项目设置里手动配置域名（需要你有这个域名的所有权）

---

## 🔄 后续更新

以后代码更新后，Vercel 会**自动重新部署**！

只需要：
1. 修改代码 → 提交到 GitHub
2. Vercel 会自动检测到更新并重新部署（约 30 秒）

---

## ❓ 常见问题

**Q：部署后页面是空白的？**
> 等 1 分钟再刷新。Vercel 部署需要一点时间同步静态文件。

**Q：点击 Import 后提示 "No repositories found"？**
> 说明 Vercel 还没有权限访问你的 GitHub 仓库。返回第 2 步，重新授权。

**Q：怎么把 Vercel 域名改成我想要的？**
> 进入 Vercel 项目 → Settings → Domains → 添加自定义域名。

**Q：部署后 CSS/JS 没加载？**
> 检查 index.html 里的路径是否是相对路径（如 `./css/style.css`）。不要写成绝对路径 `/css/style.css`。

---

## ✅ 完成以上步骤后

把 Vercel 分配给你的实际网址发给我，我帮你验证是否一切正常！🚀
