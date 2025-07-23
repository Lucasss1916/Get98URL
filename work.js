export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const password = url.searchParams.get("password");

    // 密码验证YOUR_PASSWORD修改为你自己想要的
    const correctPassword = "YOUR_PASSWORD";
    if (password !== correctPassword) {
      return new Response("❌ Password incorrect", { status: 401 });
    }

    // 登录第一步
    const loginResp = await fetch("https://98kjc.top/api/v1/passport/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: env.EMAIL,
        password: env.PASSWORD
      })
    });

    const loginJson = await loginResp.json();
    const token = loginJson?.data?.auth_data;

    if (!token) {
      return new Response("❌ 登录失败", { status: 500 });
    }

    // 第二步：获取订阅链接
    const timestamp = Date.now();
    const subscribeResp = await fetch(`https://98kjc.top/api/v1/user/getSubscribe?t=${timestamp}`, {
      method: "GET",
      headers: {
        "Authorization": token,
        "Referer": "https://98kjc.top/",
        "User-Agent": "Mozilla/5.0"
      }
    });

    const subJson = await subscribeResp.json();
    const subscribeUrl = subJson?.data?.subscribe_url;

    if (!subscribeUrl) {
      return new Response("❌ 获取订阅链接失败", { status: 500 });
    }

    // 第三步：访问订阅链接内容
    const contentResp = await fetch(subscribeUrl);
    const content = await contentResp.text(); // 可改为 .json() 若返回 JSON

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain"
      }
    });
  }
};
