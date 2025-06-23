// Tailwind 配置
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#1E88E5',
                secondary: '#64B5F6'
            },
            borderRadius: {
                'none': '0px',
                'sm': '2px',
                DEFAULT: '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '20px',
                '3xl': '24px',
                'full': '9999px',
                'button': '4px'
            }
        }
    }
}

// 获取DOM元素
const inputText = document.getElementById('input-text');
const translateBtn = document.getElementById('translate-btn');
const optimizeBtn = document.getElementById('optimize-btn');
const explainBtn = document.getElementById('explain-btn');
const sendBtn = document.getElementById('send-btn');
const languageOptions = document.getElementById('language-options');
const optimizeOptions = document.getElementById('optimize-options');
const copyBtn = document.getElementById('copy-btn'); // 获取复制按钮元素
const resultDiv = document.getElementById('result'); // Add this line
const loadingDiv = document.getElementById('loading');
const insertBtn = document.getElementById('insert-btn');
const ifStream = true; // 这里应该从请求参数或UI选择获取实际值




// 监听滚轮事件
inputText.addEventListener('wheel', function(e) {
    // 阻止默认滚动行为
    e.preventDefault();
    
    // 计算新的滚动位置
    const scrollAmount = e.deltaY > 0 ? 20 : -20;
    this.scrollTop += scrollAmount;
});

// 自动调整高度
// 获取输入框和父容器元素
const inputContainer = inputText.closest('.border');

// 自动调整高度
inputText.addEventListener('input', function() {
    // 设置输入框高度
    this.style.height = 'auto';
    const newHeight = Math.min(Math.max(this.scrollHeight, 45), 85);
    this.style.height = newHeight + 'px';
    
    // 调整父容器高度
    const containerHeight = Math.min(Math.max(newHeight + 30, 80), 120);
    inputContainer.style.height = containerHeight + 'px';
    
    // 更新CSS变量
    document.documentElement.style.setProperty('--input-height', containerHeight + 'px');
});

// 添加窗口大小变化监听
window.addEventListener('resize', function() {
    const inputHeight = inputContainer.offsetHeight;
    document.documentElement.style.setProperty('--input-height', inputHeight + 'px');
});

// 监听滚轮事件
inputText.addEventListener('wheel', function(e) {
    // 阻止默认滚动行为
    e.preventDefault();
    
    // 计算新的滚动位置
    const scrollAmount = e.deltaY > 0 ? 20 : -20;
    this.scrollTop += scrollAmount;
});

// 初始化时隐藏下拉菜单
languageOptions.style.display = 'none';
optimizeOptions.style.display = 'none';

// 点击页面其他地方关闭所有下拉菜单
document.addEventListener('click', function() {
    languageOptions.style.display = 'none';
    optimizeOptions.style.display = 'none';
});

// 添加事件监听器
translateBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    // 只显示当前下拉菜单，隐藏另一个
    languageOptions.style.display = languageOptions.style.display === 'none' ? 'block' : 'none';
    optimizeOptions.style.display = 'none';
});

optimizeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    // 只显示当前下拉菜单，隐藏另一个
    optimizeOptions.style.display = optimizeOptions.style.display === 'none' ? 'block' : 'none';
    languageOptions.style.display = 'none';
});

// 点击下拉菜单选项时阻止冒泡
document.querySelectorAll('.option-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});
// 显示复制按钮 - 确保按钮可见
function showCopyButton() {
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.classList.remove('hidden');
        copyBtn.style.display = 'block'; // 确保使用display属性
        copyBtn.innerHTML = '<i class="fas fa-copy mr-1"></i>复制'; // 重置为复制状态

    }
}

// 隐藏复制按钮
function hideCopyButton() {
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.classList.add('hidden');
        copyBtn.style.display = 'none';
    }
}
// 复制按钮点击事件
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(resultDiv.innerText);
        
        // Safely update button text
        if (copyBtn) {
            copyBtn.innerHTML = '<i class="fas fa-check mr-1"></i>已复制';
        }
        
    } catch (err) {
        console.error('复制失败:', err);
        if (copyBtn) {
            copyBtn.innerHTML = '<i class="fas fa-times mr-1"></i>复制失败';
        }
    }
});


// 显示操作按钮
function showActionButtons() {
    if (insertBtn) {
        insertBtn.classList.remove('hidden');
        insertBtn.style.display = 'block';
        insertBtn.innerHTML = '<i class="fas fa-file-import mr-1"></i>插入'; // 重置为初始状态
    }
    if (copyBtn) {
        copyBtn.classList.remove('hidden');
        copyBtn.style.display = 'block';
    }
}


// 隐藏操作按钮
function hideActionButtons() {
    if (insertBtn) {
        insertBtn.classList.add('hidden');
        insertBtn.style.display = 'none';
    }
    if (copyBtn) {
        copyBtn.classList.add('hidden');
        copyBtn.style.display = 'none';
    }
}


// 插入按钮点击事件
insertBtn.addEventListener('click', async () => {
    try {
        await Word.run(async (context) => {
            // 获取当前选区
            const range = context.document.getSelection();
            // 插入结果文本
            range.insertText(resultDiv.innerText, Word.InsertLocation.replace);
            await context.sync();
        });
        
        // 更新按钮状态
        insertBtn.innerHTML = '<i class="fas fa-check mr-1"></i>已插入';

        
    } catch (err) {
        console.error('插入失败:', err);
        insertBtn.innerHTML = '<i class="fas fa-times mr-1"></i>插入失败';
    }
});


// 显示加载状态
function showLoading() {
    loadingDiv.classList.remove('hidden');
    hideCopyButton();
}

// 隐藏加载状态
function hideLoading() {
    loadingDiv.classList.add('hidden');
}
//流式数据处理
async function handleStreamResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let buffer = '';
    let firstCharReceived = false;
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const parts = buffer.split('\n');
        buffer = parts.pop() || '';
        
        for (const part of parts) {
            if (!part.trim()) continue;
            try {
                const jsonData = JSON.parse(part.replace('data: ', ''));
                if (jsonData.result) {
                    result += jsonData.result;
                    resultDiv.innerHTML = marked.parse(result);
                    // 使用requestAnimationFrame确保滚动平滑
                    requestAnimationFrame(() => {
                        resultDiv.scrollTop = resultDiv.scrollHeight;
                    });
                    
                    if (!firstCharReceived && result.length > 0) {
                        firstCharReceived = true;
                        hideLoading();
                    }
                }
            } catch (e) {
                console.error('解析JSON出错:', e);
            }
        }
    }
    return result;
}

// 普通响应处理函数
async function handleNormalResponse(response) {
    const data = await response.json();
    resultDiv.innerHTML = marked.parse(data.result);
    // 确保内容加载后滚动到底部
    requestAnimationFrame(() => {
        resultDiv.scrollTop = resultDiv.scrollHeight;
    });
    hideLoading();
    return data.result;
}


// 翻译选项
document.querySelectorAll('#language-options .option-item').forEach(item => {
    item.addEventListener('click', async function() {
        const lang = this.getAttribute('data-value');
        if (!inputText.value.trim()) return;
        languageOptions.style.display = 'none';

        showLoading();
        hideActionButtons();
        resultDiv.innerHTML = '';
        
        try {
            const response = await fetch('https://aicopilot.csvw.com:5678/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_input: inputText.value,
                    lang: lang,
                    stream: ifStream
                })
            });
            
            if (!response.ok) throw new Error('翻译失败');
            
            // 根据流式选择处理响应
            if (ifStream) {
                await handleStreamResponse(response);
            } else {
                await handleNormalResponse(response);
            }
            showCopyButton()
            showActionButtons();
            
        } catch (error) {
            console.error('翻译出错:', error);
            resultDiv.textContent = '翻译时出现错误，请稍后重试。';
            hideLoading();
        }
    });
});

// 修改优化选项点击事件
document.querySelectorAll('#optimize-options .option-item').forEach(item => {
    item.addEventListener('click', async function() {
        const optType = this.getAttribute('data-value');
        if (!inputText.value.trim()) return;
        optimizeOptions.style.display = 'none';

        showLoading();
        hideActionButtons();
        resultDiv.innerHTML = '';
        
        try {
            const response = await fetch('https://aicopilot.csvw.com:5678/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_input: inputText.value,
                    optimize_type: optType,
                    stream: ifStream
                })
            });
            
            if (!response.ok) throw new Error('优化失败');
            
            // 根据流式选择处理响应
            if (ifStream) {
                await handleStreamResponse(response);
            } else {
                await handleNormalResponse(response);
            }
            showCopyButton()
            showActionButtons();
            
        } catch (error) {
            console.error('优化出错:', error);
            resultDiv.textContent = '优化时出现错误，请稍后重试。';
            hideLoading();
        }
    });
});


// 修改解释按钮点击事件
explainBtn.addEventListener('click', async function() {
    if (!inputText.value.trim()) return;
    
    showLoading();
    hideActionButtons();
    resultDiv.innerHTML = '';
    
    try {
        const response = await fetch('https://aicopilot.csvw.com:5678/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_input: inputText.value,
                stream: ifStream
            })
        });
        
        if (!response.ok) throw new Error('解释失败');
        
        // 根据流式选择处理响应
        if (ifStream) {
            await handleStreamResponse(response);
        } else {
            await handleNormalResponse(response);
        }
        showCopyButton()
        showActionButtons();
        
    } catch (error) {
        console.error('解释出错:', error);
        resultDiv.textContent = '解释时出现错误，请稍后重试。';
        hideLoading();
    }
});

// 添加发送按钮点击事件
// 流式响应处理函数


// 修改发送按钮点击事件
sendBtn.addEventListener('click', async function() {
    if (!inputText.value.trim()) return;
    
    showLoading();
    hideActionButtons();
    resultDiv.innerHTML = '';
    
    try {
        const response = await fetch('https://aicopilot.csvw.com:5678/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_input: inputText.value,
                stream: ifStream // 这里可以改为从UI获取的值
            })
        });
        
        if (!response.ok) throw new Error('发送失败');
                   
        // 根据stream参数选择处理方式
        if (ifStream) {
            await handleStreamResponse(response);
        } else {
            await handleNormalResponse(response);
        }
        showCopyButton()
        showActionButtons();
        
    } catch (error) {
        console.error('发送出错:', error);
        resultDiv.textContent = '发送时出现错误，请稍后重试。';
        hideLoading();
    }
});

// 添加发送按钮悬浮效果
sendBtn.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.2)';
    this.querySelector('i').style.fontSize = '18px';
});

sendBtn.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
    this.querySelector('i').style.fontSize = '16px';
});

// 添加输入框键盘事件监听
inputText.addEventListener('keydown', function(e) {
    // Shift+Enter 换行
    if (e.key === 'Enter' && e.shiftKey) {
        return; // 允许默认行为（换行）
    }
    // 普通Enter键发送
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click(); // 触发发送按钮点击事件
    }
});

