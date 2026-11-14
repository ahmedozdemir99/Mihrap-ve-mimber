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
