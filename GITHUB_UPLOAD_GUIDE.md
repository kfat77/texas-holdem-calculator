# 🚀 GitHub 上传手把手教程（只用鼠标 + 复制粘贴）

> 目标：把 `texas-holdem-calculator` 项目上传到 GitHub，让所有人都能访问和使用。

---

## 📋 前置检查清单

在开始之前，请确认：

- [ ] 你有一个 **GitHub 账号**（没有的话，看下面的步骤 1）
- [ ] 你的电脑上 **已安装 Git**（已确认安装: `git version 2.54.0`）
- [ ] 你的项目文件夹在：`C:\Users\22617\Documents\kimi\workspace\texas-holdem-calculator`

---

## 步骤 1：注册/登录 GitHub（已有账号可跳过）

**打开浏览器**，访问：https://github.com

1. 点击页面右上角的 **Sign up**（注册）或 **Sign in**（登录）
2. 按提示完成注册（需要邮箱验证）
3. 注册完成后登录进入 GitHub 首页

---

## 步骤 2：在 GitHub 上创建远程仓库（空仓库）

1. 登录 GitHub 后，点击页面右上角的 **+** 号，选择 **New repository**

```
┌─────────────────────────────────┐
│  +  ▼                           │  ← 点这里
│     New repository              │  ← 选这个
└─────────────────────────────────┘
```

2. 填写仓库信息：

| 字段 | 填写内容 | 说明 |
|:---|:---|:---|
| **Repository name** | `texas-holdem-calculator` | 仓库名称，建议和项目文件夹同名 |
| **Description** | `德州扑克概率计算器 - 纯前端，双击即用` | 简短描述 |
| **Public / Private** | 选 **Public** | 公开仓库，别人才能访问 |
| **Add a README** | ❌ **不要勾选** | 因为我们本地已有 README.md |
| **Add .gitignore** | ❌ **不要勾选** | 不需要 |
| **Choose a license** | ❌ **不要勾选** | 可选，暂时不选 |

3. 点击页面底部的绿色按钮 **Create repository**

4. 创建成功后，你会看到一个页面，其中有一段代码，找到这一行（类似下面这样）：

```
https://github.com/你的用户名/texas-holdem-calculator.git
```

**把这个网址复制下来**（选中 → 右键 → 复制），后面会用到。

---

## 步骤 3：配置 Git 用户信息（只需做一次）

> ⚠️ 这一步需要在命令行中操作。如果下面的命令看不懂，直接把命令发给我，我帮你执行。

打开 **Git Bash**（在开始菜单搜索 "Git Bash"）或 **CMD**，运行下面两条命令：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的GitHub注册邮箱"
```

**示例**：
```bash
git config --global user.name "张三"
git config --global user.email "zhangsan@example.com"
```

---

## 步骤 4：初始化本地 Git 仓库并提交代码

> ⚠️ 这一步我已经帮你完成了！你可以跳过。

如果你想知道我做了什么，下面是执行的命令：

```bash
cd texas-holdem-calculator
git init
git add .
git commit -m "feat: 德州扑克概率计算器 - 初始版本"
```

---

## 步骤 5：连接 GitHub 远程仓库并推送

> ⚠️ 这一步需要你在命令行中操作。

### 5.1 打开命令行

方法A：在项目文件夹内，按住 **Shift** 键，同时**右键点击空白处**，选择 **"在此处打开 PowerShell 窗口"** 或 **"Git Bash Here"**

方法B：打开 CMD，输入：
```bash
cd C:\Users\22617\Documents\kimi\workspace\texas-holdem-calculator
```

### 5.2 添加远程仓库地址

把下面命令中的 `YOUR_URL` 替换成你在步骤2复制的 GitHub 仓库地址：

```bash
git remote add origin YOUR_URL
```

**示例**：
```bash
git remote add origin https://github.com/zhangsan/texas-holdem-calculator.git
```

### 5.3 推送代码到 GitHub

```bash
git branch -M main
git push -u origin main
```

第一次推送时，会弹出一个窗口让你**登录 GitHub**，按提示操作即可。

推送成功后，你会看到类似这样的输出：
```
Enumerating objects: 12, done.
Counting objects: 100% (12/12), done.
Delta compression using up to 8 threads
Compressing objects: 100% (10/10), done.
Writing objects: 100% (12/12), 15.23 KiB | 7.61 MiB/s, done.
Total 12 (delta 1), reused 0 (delta 0), pack-reused 0
To https://github.com/你的用户名/texas-holdem-calculator.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

---

## 步骤 6：验证上传成功

1. 回到浏览器，刷新你的 GitHub 仓库页面
2. 你应该能看到所有文件：
   - `index.html`
   - `css/style.css`
   - `js/poker-engine.js`
   - `README.md`
   - 等等

3. 点击 `README.md`，看看内容是否正确显示

🎉 **恭喜你！项目已成功上传到 GitHub！**

---

## 🎁 额外设置：开启 GitHub Pages（让别人直接打开用）

上传完成后，你可以开启 GitHub Pages，这样别人**直接访问一个网址**就能用你的计算器，不需要下载！

### 开启步骤：

1. 进入你的 GitHub 仓库页面
2. 点击页面上方的 **Settings**（设置）标签
3. 左侧菜单往下滑，找到并点击 **Pages**
4. 在 **Source** 部分：
   - Branch: 选择 `main`
   - Folder: 选择 `/(root)`
   - 点击 **Save**

5. 等待约 1~2 分钟，然后刷新页面
6. 页面顶部会出现一个绿色提示框，里面有一个网址，类似：
   ```
   https://你的用户名.github.io/texas-holdem-calculator/
   ```

**把这个网址发给任何人，他们打开就能直接用！** 🎉

---

## 🔧 如果推送遇到问题

### 问题1："fatal: not a git repository"

说明你不在 git 仓库目录下。解决：
```bash
cd C:\Users\22617\Documents\kimi\workspace\texas-holdem-calculator
git init
```

### 问题2："fatal: Authentication failed"

说明你登录失败了。解决：
- 如果是弹窗登录失败，重新打开弹窗
- 或者使用 Token 方式（较复杂，建议发给我帮你解决）

### 问题3："fatal: refusing to merge unrelated histories"

解决：
```bash
git push -u origin main --force
```

---

## 📌 总结流程图

```
注册GitHub账号 → 创建空仓库 → 复制仓库地址
                                    ↓
配置Git用户名/邮箱 → 初始化本地仓库 → 添加远程地址 → 推送
                                    ↓
                         刷新GitHub页面验证 → 开启Pages
```

---

祝上传顺利！有问题随时问我 💪
