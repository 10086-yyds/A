import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';

// {{ AURA-X: Add - 敲敲云AI聊天WebView组件. Approval: 第三方AI服务集成需求. }}
interface AiChatWebViewProps {
    appId: string;
    iconPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'hidden';
    onMessage?: (message: any) => void;
    style?: any;
}

const AiChatWebView: React.FC<AiChatWebViewProps> = ({
    appId,
    iconPosition = 'bottom-right',
    onMessage,
    style,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const webViewRef = useRef<WebView>(null);

    // {{ AURA-X: Modify - 简化生成HTML页面，直接使用iframe. Approval: 用户建议使用更简单的iframe方式. }}
    const generateHTML = () => {
        // 如果是隐藏模式，直接显示iframe；否则使用原来的方式
        if (iconPosition === 'hidden') {
            return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
          <title>AI智能助手</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background-color: #F8FAFE;
                  height: 100vh;
                  overflow: hidden;
                  position: fixed;
                  width: 100%;
                  top: 0;
                  left: 0;
              }
              .container {
                  width: 100%;
                  height: 100vh;
                  position: relative;
                  display: flex;
                  flex-direction: column;
              }
              .ai-iframe {
                  width: 100%;
                  height: 100%;
                  border: none;
                  background-color: #F8FAFE;
                  flex: 1;
                  min-height: 0;
              }
              .loading {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  text-align: center;
                  color: #2E86C1;
                  z-index: 10;
              }
              .loading.hidden {
                  display: none;
              }
              
                             /* 确保iframe内容适配移动端 */
               @media screen and (max-width: 768px) {
                   body {
                       position: fixed;
                       top: 0;
                       left: 0;
                       right: 0;
                       bottom: 0;
                   }
                   .ai-iframe {
                       position: absolute;
                       top: 0;
                       left: 0;
                       right: 0;
                       bottom: 0;
                   }
               }
               
               /* 修复敲敲云AI的移动端布局问题 */
               .container::after {
                   content: '';
                   position: absolute;
                   top: 0;
                   left: 0;
                   right: 0;
                   bottom: 0;
                   pointer-events: none;
                   z-index: 1;
               }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="loading" id="loading">
                  <div>🤖</div>
                  <div>连接AI助手中...</div>
              </div>
                             <iframe 
                   id="aiFrame"
                   class="ai-iframe"
                   src="https://app.qiaoqiaoyun.com/ai/app/chat/${appId}?mobile=1&viewport=fit"
                   title="敲敲云AI助手"
                   allowfullscreen
                   allow="microphone; camera; autoplay; clipboard-read; clipboard-write"
                   scrolling="no"
                   frameborder="0"
                   style="border: none; width: 100%; height: 100%; display: block;">
               </iframe>
          </div>
          
          <script>
              try {
                  const iframe = document.getElementById('aiFrame');
                  const loading = document.getElementById('loading');
                  
                                     // iframe加载完成后隐藏loading
                   iframe.onload = function() {
       
                       if (loading) {
                           loading.classList.add('hidden');
                       }
                       
                       // 尝试修复iframe内部的移动端布局
                       setTimeout(() => {
                           try {
                               const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                               if (iframeDoc) {
                                   // 注入移动端修复CSS
                                   const style = iframeDoc.createElement('style');
                                   style.textContent = 
                                       '* { box-sizing: border-box !important; }' +
                                       'body { overflow-x: hidden !important; width: 100vw !important; max-width: 100vw !important; }' +
                                       'input, textarea { max-width: calc(100vw - 40px) !important; width: 100% !important; box-sizing: border-box !important; }' +
                                       '.chat-input, [class*="input"], [id*="input"] { max-width: calc(100vw - 40px) !important; width: 100% !important; box-sizing: border-box !important; }' +
                                       '[style*="width"] { max-width: 100vw !important; }';
                                   iframeDoc.head.appendChild(style);
                                   console.log('📱 已注入移动端修复CSS');
                               }
                           } catch (error) {
                               console.log('⚠️ 无法访问iframe内容，跨域限制:', error);
                           }
                       }, 2000);
                       
                       // 通知React Native
                       if (window.ReactNativeWebView) {
                           window.ReactNativeWebView.postMessage(JSON.stringify({
                               type: 'chat_opened',
                               timestamp: new Date().toISOString()
                           }));
                       }
                   };
                  
                  // iframe加载错误处理
                  iframe.onerror = function() {
                      console.error('❌ AI助手加载失败');
                      if (window.ReactNativeWebView) {
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'error',
                              message: 'AI助手加载失败，请检查网络连接'
                          }));
                      }
                  };
                  
                  // 页面加载完成通知
                  window.addEventListener('load', function() {
                      if (window.ReactNativeWebView) {
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'page_loaded',
                              timestamp: new Date().toISOString()
                          }));
                      }
                  });
                  
                                     // 超时处理
                   setTimeout(() => {
                       if (loading && !loading.classList.contains('hidden')) {
                           loading.classList.add('hidden');
           
                       }
                   }, 10000);
                   
                   // 监听键盘显示/隐藏，调整iframe高度
                   let initialViewportHeight = window.innerHeight;
                   window.addEventListener('resize', function() {
                       const currentHeight = window.innerHeight;
                       const iframe = document.getElementById('aiFrame');
                       
                       if (iframe) {
                           // 键盘显示时调整iframe高度
                           if (currentHeight < initialViewportHeight * 0.75) {
                               iframe.style.height = currentHeight + 'px';
               
                           } else {
                               iframe.style.height = '100%';
               
                           }
                       }
                   });
                  
              } catch (error) {
                  console.error('初始化失败:', error);
                  if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'error',
                          message: error.message
                      }));
                  }
              }
          </script>
      </body>
      </html>
      `;
        }

        // 原来的方式（带图标）
        return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <title>AI智能助手</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background-color: #F8FAFE;
                height: 100vh;
                overflow: hidden;
            }
            .container {
                width: 100%;
                height: 100vh;
                position: relative;
            }
            .loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: #2E86C1;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="loading" id="loading">
                <div>🤖</div>
                <div>AI助手加载中...</div>
            </div>
        </div>
        
        <!-- 敲敲云AI聊天脚本 -->
        <script src="https://app.qiaoqiaoyun.com/chat/chat.js" id="e7e007dd52f67fe36365eff636bbffbd"></script>
        <script>
            try {
                createAiChat({
                    appId: "${appId}",
                    iconPosition: "${iconPosition}"
                });
                
                // 隐藏加载提示
                setTimeout(() => {
                    const loading = document.getElementById('loading');
                    if (loading) {
                        loading.style.display = 'none';
                    }
                }, 3000);
                
                // 页面加载完成通知
                window.addEventListener('load', function() {
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'page_loaded',
                            timestamp: new Date().toISOString()
                        }));
                    }
                });
                
            } catch (error) {
                console.error('AI聊天初始化失败:', error);
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'error',
                        message: error.message
                    }));
                }
            }
        </script>
    </body>
    </html>
    `;
    };

    // {{ AURA-X: Add - 处理WebView消息. Approval: WebView与RN通信需求. }}
    const handleMessage = (event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);

            switch (message.type) {
                case 'page_loaded':
                    console.log('✅ AI聊天页面加载完成');
                    setIsLoading(false);
                    break;
                case 'ai_chat_event':
                    console.log('🤖 AI聊天事件:', message.data);
                    onMessage?.(message.data);
                    break;
                case 'error':
                    console.error('❌ AI聊天错误:', message.message);
                    Alert.alert('AI服务错误', message.message);
                    setIsLoading(false);
                    break;
                default:
                    console.log('📨 未知消息类型:', message);
            }
        } catch (error) {
            console.error('消息解析失败:', error);
        }
    };

    // {{ AURA-X: Add - 处理加载错误. Approval: 错误处理需求. }}
    const handleError = (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent;
        console.error('WebView加载错误:', nativeEvent);
        Alert.alert(
            'AI服务连接失败',
            '请检查网络连接后重试',
            [{ text: '确定', onPress: () => setIsLoading(false) }]
        );
    };

    return (
        <View style={[styles.container, style]}>
            <WebView
                ref={webViewRef}
                source={{ html: generateHTML() }}
                style={styles.webview}
                onMessage={handleMessage}
                onError={handleError}
                onHttpError={handleError}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                bounces={false}
                scrollEnabled={false}
                mixedContentMode="compatibility"
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                automaticallyAdjustContentInsets={false}
                contentInset={{ top: 0, left: 0, bottom: 0, right: 0 }}
                keyboardDisplayRequiresUserAction={false}
                hideKeyboardAccessoryView={true}
                allowsBackForwardNavigationGestures={false}
            />

            {/* {{ AURA-X: Add - 加载指示器. Approval: 用户体验需求. }} */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#2E86C1" />
                    <View style={styles.loadingText}>
                        <Text style={styles.aiIcon}>🤖</Text>
                        <Text style={styles.loadingTitle}>连接AI助手中...</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

// {{ AURA-X: Add - 样式定义. Approval: 与医疗主题保持一致. }}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFE',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#F8FAFE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        alignItems: 'center',
        marginTop: 16,
    },
    aiIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    loadingTitle: {
        fontSize: 16,
        color: '#2E86C1',
        fontWeight: '500',
    },
});

export default AiChatWebView; 