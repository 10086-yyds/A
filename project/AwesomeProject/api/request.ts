import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 环境区分
const isProd = process.env.NODE_ENV === 'production';
const BASE_URL = isProd ? 'https://api.yourdomain.com' : 'http://198.18.0.1:3000';

// 最大重试次数
const MAX_RETRY = 3;
// 最大并发数
const MAX_CONCURRENT = 5;
// 请求超时时间（毫秒）
const TIMEOUT = 10000;

let concurrentCount = 0;
const queue: (() => void)[] = [];

function next() {
  concurrentCount--;
  if (queue.length > 0 && concurrentCount < MAX_CONCURRENT) {
    const fn = queue.shift();
    if (fn) fn();
  }
}

function requestWithConcurrency<T = unknown>(
  config: AxiosRequestConfig,
  retry = 0,
): Promise<AxiosResponse<T>> {
  return new Promise((resolve, reject) => {
    const exec = () => {
      concurrentCount++;
      axios({
        baseURL: BASE_URL,
        timeout: TIMEOUT,
        ...config,
      })
        .then(res => {
          resolve(res);
        })
        .catch((err: AxiosError) => {
          if (retry < MAX_RETRY) {
            // 重试
            requestWithConcurrency<T>(config, retry + 1)
              .then(resolve)
              .catch(reject);
          } else {
            reject(err);
          }
        })
        .finally(() => {
          next();
        });
    };
    if (concurrentCount < MAX_CONCURRENT) {
      exec();
    } else {
      queue.push(exec);
    }
  });
}

export default requestWithConcurrency;
