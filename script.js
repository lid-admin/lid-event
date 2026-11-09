"use strict";

const statuses = { preparing: "受付前", open: "参加受付中", closed: "受付終了" };

// 日本時間の暦日で判定。最終開催日の翌日から開催終了とする。
function todayInJapan() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date());
  const value = type => parts.find(part => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function validDate(value) {
  if (value === null) return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function safeURL(value) {
  if (typeof value !== "string" || !value.trim()) throw new Error("URLが未設定です。");
  const url = new URL(value, document.baseURI);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("URLの形式が不正です。");
  return url.href;
}

function validateEvents(events) {
  if (!Array.isArray(events)) throw new Error("JSONは配列で指定してください。");
  const ids = new Set();
  for (const event of events) {
    if (!event || typeof event !== "object") throw new Error("イベント情報が不正です。");
    for (const key of ["id", "title", "description", "dateText", "venue", "imageAlt"]) {
      if (typeof event[key] !== "string") throw new Error(`${key}は文字列で指定してください。`);
    }
    if (!event.id.trim() || !event.title.trim() || ids.has(event.id)) throw new Error("IDまたはタイトルが不正です。");
    ids.add(event.id);
    if (!validDate(event.startDate) || !validDate(event.endDate)) throw new Error("日付の形式が不正です。");
    if (event.startDate && event.endDate && event.startDate > event.endDate) throw new Error("終了日は開始日以降にしてください。");
    if (!Object.hasOwn(statuses, event.registrationStatus)) throw new Error("受付状況が不正です。");
    safeURL(event.url);
    if (event.image !== null) safeURL(event.image);
  }
  return events;
}

function splitEvents(events, today) {
  const upcoming = [], past = [];
  for (const event of events) {
    // endDate未設定の場合は自動で終了扱いにしない。
    (event.endDate && event.endDate < today ? past : upcoming).push(event);
  }
  upcoming.sort((a, b) => (a.startDate || "9999-12-31").localeCompare(b.startDate || "9999-12-31"));
  past.sort((a, b) => b.endDate.localeCompare(a.endDate));
  return { upcoming, past };
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createCard(event, ended) {
  const card = element("a", "card");
  card.href = safeURL(event.url);
  const thumbnail = element("div", "thumbnail", "はじめての体験を、飯南で。");
  if (event.image) {
    const image = document.createElement("img");
    image.alt = event.imageAlt;
    image.loading = "lazy";
    image.addEventListener("error", () => {
      thumbnail.textContent = "はじめての体験を、飯南で。";
    }, { once: true });
    image.src = safeURL(event.image);
    thumbnail.replaceChildren(image);
  } else thumbnail.setAttribute("aria-hidden", "true");
  const body = element("div", "body");
  body.append(element("span", `badge ${ended ? "closed" : event.registrationStatus}`,
    ended ? "開催終了" : statuses[event.registrationStatus]));
  body.append(element("h3", "", event.title));
  const meta = element("dl");
  for (const [label, value] of [["開催日", event.dateText], ["会場", event.venue]]) {
    const row = element("div");
    row.append(element("dt", "", label), element("dd", "", value));
    meta.append(row);
  }
  body.append(meta, element("p", "description", event.description), element("span", "more", "詳細を見る →"));
  card.append(thumbnail, body);
  return card;
}

async function loadEvents() {
  const message = document.getElementById("message");
  try {
    const response = await fetch("./events.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const groups = splitEvents(validateEvents(await response.json()), todayInJapan());
    for (const name of ["upcoming", "past"]) {
      document.getElementById(name).replaceChildren(...groups[name].map(event => createCard(event, name === "past")));
      document.getElementById(`${name}-empty`).hidden = groups[name].length > 0;
    }
    message.hidden = true;
  } catch (error) {
    message.textContent = location.protocol === "file:"
      ? "JSONの読み込みにはサーバーが必要です。VS CodeのLive Serverなどで開いてください。"
      : "イベント情報を読み込めませんでした。時間をおいて再度お試しください。";
    console.error("イベント情報の読み込みエラー:", error);
  }
}

loadEvents();
