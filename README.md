# イベント一覧ページの使い方

## 設置
このフォルダの index.html / style.css / script.js / events.json を、既存の events フォルダや .git フォルダと同じ階層へ配置します。README.md は説明用です。既存のファイルと名前が同じ場合は、内容を確認してから置き換えてください。詳細ページ側のファイルは変更不要です。

## 表示確認
JSONをfetchで読み込むため、index.htmlのダブルクリックでは表示できません。VS CodeのLive ServerなどのHTTPサーバーで開くか、GitHub Pagesに公開して確認してください。新たなライブラリやビルド処理は不要です。

## イベントの追加
1. events/2026/イベント名/ に自由なデザインで詳細ページを作ります。
2. events.json の既存の { ... } をコピーし、配列の中に追加します。各イベントの間には半角カンマが必要です。最後のイベントの後にはカンマを付けません。
3. id はイベントごとに重複しない値にします。

| 項目 | 記入方法 |
| --- | --- |
| id | 重複しない識別名。例：scratch-2026 |
| title | カードのイベント名 |
| description | 短い紹介文 |
| startDate | 初回開催日。例："2026-12-01"。未定は null |
| endDate | 最終開催日。例："2027-02-28"。未定は null |
| dateText | 表示用の文章。例："12月〜2月・全10回" |
| venue | 会場名 |
| registrationStatus | "preparing"（受付前）、"open"（参加受付中）、"closed"（受付終了） |
| image | 画像パス。例："./events/2026/scratch-event/images/card.jpg"。未設定は null |
| imageAlt | 画像の説明。装飾画像の場合は空文字 "" |
| url | 詳細ページのパス |

画像・リンクのパスは一覧ページのindex.htmlを基準に指定してください。実際の画像ファイル名に合わせます。画像なし・画像読み込み失敗時は文字入りの仮サムネイルを表示します。会社ロゴは同梱していません。

## 自動表示のルール
- 日本時間で最終開催日の翌日から「開催終了」へ移動します。
- 1日だけのイベントも startDate と endDate の両方に同じ日付を設定してください。
- endDate が null の場合、開催終了には自動移動しません。
- 開催予定は初回開催日の近い順、日程未定は末尾です。
- 開催終了は最終開催日の新しい順です。
- 受付終了と開催終了は別です。受付だけ終了した場合は registrationStatus を closed にします。
- 日付の切り替えはページを開く・再読み込みする際に反映されます。
- JSONのコメントや末尾カンマは使用できません。不正な設定があればエラーメッセージを表示します。

## 登録例（コピー用・実際の情報に置き換える）
```json
{
  "id": "new-event-2026",
  "title": "イベント名",
  "description": "イベントの紹介文。",
  "startDate": null,
  "endDate": null,
  "dateText": "日程調整中",
  "venue": "会場調整中",
  "registrationStatus": "preparing",
  "image": null,
  "imageAlt": "",
  "url": "./events/2026/new-event/index.html"
}
```

Scratch教室の名称・日程・会場・受付状況は仮登録です。公開前に実際の情報に変更してください。詳細ページ自体は同梱していません。
