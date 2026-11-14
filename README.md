# Mihrap ve Minber Akademisi

Cami görevleri, sûre ve dua ezberi, sesli prova ve bilgi testleri için Türkçe eğitim sitesi. Ezber rotası Fâtiha’dan başlayıp hatim duasına uzanan dokuz etap içerir.

## Yerel geliştirme

Node.js 22.12 veya üzeri bir sürümle:

```bash
npm ci
npm run dev
```

TypeScript denetimi için `npm run lint`, üretim derlemesi için `npm run build` çalıştırın.

## Cloudflare Pages

Cloudflare’da **Workers & Pages → Create application → Pages → Import an existing Git repository** yolunu izleyin ve bu depoyu seçin.

| Ayar | Değer |
| --- | --- |
| Production branch | Güncel sürümün bulunduğu dal |
| Framework preset | React (Vite) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Deponun kökü |

Pages v3 derleme ortamındaki Node.js 22 bu projeyi destekler. Daha eski bir derleme ortamı kullanıyorsanız `NODE_VERSION` değerini `22` olarak ayarlayın. Uygulama için API anahtarı gerekmez.

İlerleme, ders notları ve ezber kayıtları tarayıcıda site adresine bağlı olarak saklanır. Başka bir adrese geçiyorsanız önce **Yedekleme** bölümünden JSON dosyası indirin ve yeni adreste içe aktarın.

[Cloudflare Pages React kılavuzu](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)

### Kurulu uygulamadan ders bildirimleri

Bildirimler Türkiye saatiyle 08.00’de ders başlangıcı, 12.00’de tekrar ve 20.00’de ders kapanışı için gönderilir. Bildirime dokununca Ezber Rotası açılır. Cloudflare Cron saatleri UTC’dir. Zamanlayıcı önce 05.00, 09.00 ve 17.00 UTC’de çalışır, ardından aynı saat içinde kalan gönderimleri ve geçici hataları tekrar işler.

Pages projesiyle aynı Cloudflare hesabında aşağıdaki adımları uygulayın. Komutları deponun kökünden çalıştırın.

1. `npx wrangler login --device` ile Cloudflare’a giriş yapın.
2. `npx wrangler deploy --config cloudflare/reminders/wrangler.jsonc` komutuyla Worker’ı yayımlayın. Wrangler, `mihrap-bildirimler` D1 veritabanını oluşturup bağlar.
3. `npx wrangler d1 migrations apply mihrap-bildirimler --remote --config cloudflare/reminders/wrangler.jsonc` komutuyla abonelik tablosunu oluşturun.
4. `npx web-push generate-vapid-keys --json` ile bir VAPID anahtar çifti üretin. Worker’ın **Settings → Variables and Secrets** bölümüne `VAPID_PUBLIC_KEY` ve `VAPID_PRIVATE_KEY` değerlerini ekleyin. Özel anahtarı **Secret** olarak kaydedin. `VAPID_SUBJECT` için kendi iletişim adresinizi `mailto:` önekiyle girin. Bu anahtar çiftini güvenli bir yerde saklayın. Anahtarlar değişirse `src/components/ReminderSettings.tsx` içindeki `productionPublicKey` değerini güncelleyin ve Pages’i yeniden yayımlayın. Cihazlarda aboneliği kapatıp yeniden açın.
5. Pages projesinin üretim ayarlarında **Settings → Bindings → Add → Service binding** bölümünde `REMINDERS` adını kullanın ve `mihrap-ders-bildirimleri` Worker’ını seçin. Pages üretim dağıtımını yeniden çalıştırın.
6. Yayımlanan Akademi’yi açıp **Ezber Dersleri → Bildirimleri aç** düğmesine dokunun ve cihaz iznini verin. iPhone veya iPad’de (iOS/iPadOS 16.4 ve üzeri) uygulamayı Ana Ekran’a ekleyip simgesinden açın. Her cihazda izin ayrı verilir.

`/api/notifications/config` adresinin `configured: true` döndürmesi Cloudflare bağlantısının hazır olduğunu gösterir. Gerçek cihaz teslimatını doğrulamak için izin verilen bir cihazda bir sonraki ders saatini kontrol edin.

[Cloudflare Pages servis bağlantıları](https://developers.cloudflare.com/pages/functions/bindings/#service-bindings) · [Cloudflare Cron zamanlayıcıları](https://developers.cloudflare.com/workers/configuration/cron-triggers/) · [Apple Web Push desteği](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
