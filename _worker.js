export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 如果是前端发来的海报反代请求
    if (url.pathname === '/img-proxy') {
      const targetUrl = url.searchParams.get('url');
      if (!targetUrl) {
        return new Response('Missing URL parameter', { status: 400 });
      }

      try {
        // 利用你自己的 Cloudflare Pages 服务器去请求豆瓣，并伪造合法的 Referer 头
        const response = await fetch(targetUrl, {
          headers: {
            'Referer': 'https://movie.douban.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        // 构造新的响应，允许跨域访问并原样返回图片流
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        return newResponse;

      } catch (e) {
        return new Response('Proxy Error: ' + e.message, { status: 500 });
      }
    }

    // 其他所有普通请求（比如 index.html、js、css 资源），直接放行交给 Pages 静态托管处理
    return env.ASSETS.fetch(request);
  }
};
