# OpenCode Zen Bridge - 24/7 Cloud Docker Deployment

এই ফোল্ডারের ফাইলগুলো দিয়ে আপনি সম্পূর্ণ ফ্রিতে **Koyeb** বা **Render.com**-এ OpenCode Zen Bridge হোস্ট করতে পারবেন, যাতে আপনার পার্সোনাল পিসি বন্ধ থাকলেও C-Link ২৪/৭ ওপেনকোড জেনের ফ্রি মডেলগুলো ব্যবহার করতে পারে।

---

## ডিপ্লয়মেন্ট পদ্ধতি (৩টি সহজ ধাপ)

### ধাপ ১: আপনার OpenCode Auth Token বের করুন
আপনার টার্মিনালে এই কমান্ডটি রান করুন:
```bash
./deploy/opencode-bridge/generate-auth-b64.sh
```
এটি একটি বেস৬৪ টেক্সট স্ট্রিং প্রিন্ট করবে। পুরো স্ট্রিংটি কপি করে নিন।

---

### ধাপ ২: Koyeb অথবা Render-এ ডিপ্লয় করুন

#### অপশন A: Koyeb (সবচেয়ে সহজ ও দ্রুত)
1. [koyeb.com](https://app.koyeb.com)-এ ফ্রি অ্যাকাউন্ট খুলে লগইন করুন।
2. **Create App** ক্লিক করুন এবং **GitHub** সিলেক্ট করে আপনার `clink` রিপোজিটরি পছন্দ করুন।
3. **Build settings**:
   - Type: `Dockerfile`
   - Dockerfile location: `deploy/opencode-bridge/Dockerfile`
4. **Environment Variables**:
   - `OPENCODE_AUTH_B64`: (ধাপ ১ এ কপি করা স্ট্রিংটি পেস্ট করুন)
   - `PORT`: `8000`
   - `DEFAULT_MODEL`: `opencode/ling-3.0-flash-fin-free`
   - *(ঐচ্ছিক)* `BRIDGE_API_KEY`: আপনার পছন্দের একটি সিক্রেট পাসওয়ার্ড (যেমন: `my-super-secret-key`)
5. **Deploy** বাটনে ক্লিক করুন। ২ মিনিটের মধ্যে Koyeb আপনাকে একটি লাইভ লিঙ্ক দেবে, যেমন:
   `https://opencode-bridge-yourname.koyeb.app`

---

#### অপশন B: Render.com
1. [render.com](https://dashboard.render.com)-এ ফ্রি অ্যাকাউন্ট খুলে লগইন করুন।
2. **New +** -> **Web Service** সিলেক্ট করুন।
3. আপনার GitHub রিপোজিটরি কানেক্ট করুন।
4. **Environment**: `Docker`
5. **Dockerfile Path**: `./deploy/opencode-bridge/Dockerfile`
6. **Environment Variables**:
   - `OPENCODE_AUTH_B64`: (ধাপ ১ এ কপি করা স্ট্রিংটি পেস্ট করুন)
   - `DEFAULT_MODEL`: `opencode/ling-3.0-flash-fin-free`
   - *(ঐচ্ছিক)* `BRIDGE_API_KEY`: `my-super-secret-key`
7. **Create Web Service** ক্লিক করুন। Render আপনাকে একটি ফ্রি লিঙ্ক দেবে, যেমন:
   `https://opencode-zen-bridge.onrender.com`

---

### ধাপ ৩: C-Link-এ ক্লাউড URL সেট করুন

ডিপ্লয়মেন্ট সফল হলে C-Link-এর `.dev.vars` (বা Cloudflare Workers Environment Variables)-এ নিচের মানগুলো বসিয়ে দিন:

```env
KILO_BASE_URL=https://opencode-bridge-yourname.koyeb.app/v1
KILO_MODEL=opencode/ling-3.0-flash-fin-free
KILO_API_KEY=my-super-secret-key
```

এখন আপনার পিসি বন্ধ থাকলেও C-Link সরাসরি ক্লাউড থেকে ২৪/৭ ফ্রি ওপেনকোড জেন দিয়ে কাজ করবে!
