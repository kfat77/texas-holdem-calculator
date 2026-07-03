# 🌐 在线部署教程（纯鼠标操作）

> 目标：让你的德州扑克计算器能在任何设备上直接打开使用

---

## 方案一：GitHub Pages（免费，自带HTTPS）

你已经有一个GitHub仓库了，只需要**点几下鼠标**就能开启网站。

### 操作步骤

1. 打开浏览器，访问：
   ```
   https://github.com/kfat77/texas-holdem-calculator/settings/pages
   ```
   （或者打开仓库 → 点击上方 **Settings** → 左侧菜单找 **Pages**）

2. 在 **Build and deployment** 区域：
   - **Source**：选择 `Deploy from a branch`
   - **Branch**：选择 `main`，文件夹选 `/(root)`
   - 点击 **Save**

3. 等待 1~2 分钟（页面会自动刷新）

4. 页面顶部会出现一个绿色提示框，显示你的网址：
   ```
   🟢 Your site is live at https://kfat77.github.io/texas-holdem-calculator/
   ```

**搞定！** 这个链接就是你的在线网站，手机电脑都能打开。

---

## 方案二：Vercel（推荐，国内访问更快）

Vercel 是一个免费的静态网站托管平台，国内访问速度比 GitHub Pages 快很多。

### 操作步骤

#### 第1步：注册/登录 Vercel

1. 打开浏览器，访问：https://vercel.com
2. 点击 **Sign Up**（注册）
3. 选择 **Continue with GitHub**（用GitHub账号登录，最方便）
4. 授权 Vercel 访问你的 GitHub 仓库

#### 第2步：导入项目

1. 登录后，点击页面上的 **Add New...** → **Project**
2. 你会看到GitHub仓库列表，找到并点击 **texas-holdem-calculator**
3. 点击 **Import**（导入）

#### 第3步：配置并部署

1. **Project Name**：可以改也可以不改，比如改成 `texas-holdem-calculator`
2. **Framework Preset**：选 `Other`（因为我们没有使用框架）
3. **Root Directory**：保持默认 `./`
4. 其他设置不用改
5. 点击底部的 **Deploy**（部署）

6. 等待约 30 秒，部署完成！

#### 第4步：获取网址

部署完成后，Vercel 会给你分配一个域名：
```
https://texas-holdem-calculator-你的用户名.vercel.app
```

这个网址就是最终可用的在线地址！

---

## 方案对比

| 方案 | 网址示例 | 国内速度 | 自定义域名 | 推荐度 |
|:---|:---|:---|:---|:---:|
| **GitHub Pages** | `kfat77.github.io/...` | 较慢 | 支持 | ⭐⭐⭐ |
| **Vercel** | `xxx.vercel.app` | 很快 | 支持 | ⭐⭐⭐⭐⭐ |

**建议两个都开**，Vercel 国内速度快，GitHub Pages 作为备用。

---

## 📱 安装到手机桌面（PWA）

部署成功后，你可以把网站"安装"到手机桌面，像原生App一样使用。

### iPhone / iPad（Safari）

1. 用 Safari 打开你的 Vercel 网址
2. 点击底部中间的**分享按钮** ⬆️
3. 往下滑，找到 **「添加到主屏幕」**
4. 点击 **添加**
5. 桌面上会出现一个 ♠ 图标，点开就是全屏App模式！

### Android（Chrome）

1. 用 Chrome 打开你的 Vercel 网址
2. 点击右上角菜单 ⋮
3. 选择 **「添加到主屏幕」** 或 **「安装应用」**
4. 桌面上会出现图标

### 安装后的效果

- ✅ 没有浏览器地址栏，全屏体验
- ✅ 启动更快
- ✅ 支持离线使用（没网也能算概率）
- ✅ 像真正的App一样

---

## 🔗 最终你将拥有这些访问方式

| 方式 | 地址 | 适用场景 |
|:---|:---|:---|
| **Vercel在线版** | `https://xxx.vercel.app` | 手机/电脑浏览器直接打开 |
| **GitHub Pages** | `https://kfat77.github.io/...` | 备用访问地址 |
| **手机桌面App** | 点击图标 | 像原生App一样使用 |
| **离线版** | 已安装的PWA | 没网也能用 |
| **本地文件** | 双击 `index.html` | 没有网络时使用 |

---

## ❓ 常见问题

**Q：部署后页面显示空白？**
> 等1~2分钟再刷新，静态资源需要时间同步。

**Q：手机打开排版错乱？**
> 这是正常的，我已经做了响应式适配。如果还有问题，请告诉我你的手机型号和浏览器。

**Q：Vercel网址打不开？**
> 部分地区可能需要科学上网。GitHub Pages 作为备用方案。

**Q：怎么更新网站内容？**
> 修改代码 → 提交到GitHub → Vercel 会自动重新部署！

---

🎉 **完成以上步骤后，你的德州扑克概率计算器就是一个真正的在线网站了！**
