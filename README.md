# 8パス OCTOPUS — Webサイト & 予約システム（デモ）

六本木のパーソナルストレッチ・ボディケア「**8パス（オクトパス）**」の
ホームページ兼・Web予約システムのプロトタイプです。

> コンセプト：社名の「**8**」を横にすると **∞（無限大）**。
> 期限のない回数券＝終わらないケア、というブランドの軸を、デザイン全体の motif にしています。

## 構成（ページ）

| ページ | ファイル | 内容 |
|---|---|---|
| トップ | `index.html` | 理念・メニュー・料金（無期限回数券／紹介割引）・アクセス |
| Web予約 | `reserve.html` | メニュー → 担当 → 日時 → お客様情報 の4ステップ予約 |
| 予約の確認・変更 | `manage.html` | 予約一覧・**日時の変更（組み替え）**・キャンセル |

「LINEで受けた予約をこちらで組み替える」運用の負担を、
**お客様自身がWebで完結**できるようにする、というのが一番の提案ポイントです。

## 見せ方（ローカルでサッと表示）

ビルド不要の静的サイトです。いちばん確実なのはローカルサーバ経由：

```bash
# このフォルダで（Node があれば）
npx serve .
# → 表示された http://localhost:3000 などをブラウザで開く
```

`index.html` をダブルクリックで直接開いてもほぼ動きます
（予約データはブラウザの localStorage に保存されます）。

## 公開（共有リンクを作る場合）

GitHub にアップして **GitHub Pages** で公開するのが手軽です：

```bash
git remote add origin https://github.com/<あなたのID>/octopus-web.git
git push -u origin main
# GitHub の Settings → Pages → Branch: main / root を選択 → 公開URLが発行されます
```

Netlify / Vercel にこのフォルダをドラッグ＆ドロップしても即公開できます。

## デモの仕様メモ

- 予約データは **localStorage**（ブラウザ内）に保存される簡易実装です。
  実運用ではサーバ／予約API／LINE連携などに置き換える想定。
- `manage.html` は初回表示時にサンプル予約を1件自動投入します
  （変更・キャンセルの動きをその場でお見せできます）。

## あとで差し替える箇所（◯◯になっている部分）

- 住所・最寄駅からの分数・営業時間・定休日（`index.html` のアクセス欄）
- トレーナー名（`assets/js/store.js` の `STAFF`）
- メニュー名・料金（`assets/js/store.js` の `MENUS` と `index.html`）
- LINE / Instagram のリンク（フッター）

---

Fonts: Fraunces / Shippori Mincho / Zen Kaku Gothic New（Google Fonts）
