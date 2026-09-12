import './style.css'

const defaultQuests = {
  "normal-morning": [
    "14:00までにDuolingo",
    "勉強後にテレビ",
    "お菓子は15時台に1つだけ"
  ],

  "normal-afternoon": [
    "8:00までにDuolingo",
    "軽食はサラダチキンかおにぎり",
    "帰宅30分以内に勉強"
  ],

  "holiday-morning": [
    "午前中にDuolingo",
    "午前中に勉強",
    "お菓子は決めた時間に食べる"
  ],

  "holiday-afternoon": [
    "午前中にDuolingo",
    "部活前に勉強",
    "帰宅後30分以内に勉強"
  ]
};


// ==========================
// 日付
// ==========================

function getToday() {
  const now = new Date();

  return (
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0")
  );
}


// ==========================
// クエスト保存・取得
// ==========================

function saveQuests(type, quests) {
  localStorage.setItem(
    "dailyQuest-" + type,
    JSON.stringify(quests)
  );
}


function getQuests(type) {
  const saved = localStorage.getItem(
    "dailyQuest-" + type
  );

  let quests;

  if (saved) {
    quests = JSON.parse(saved);
  } else {
    quests = defaultQuests[type].map(text => ({
      text: text,
      checked: false
    }));
  }

  // この種類のクエストを最後に使った日
  const dateKey = "dailyQuest-date-" + type;
  const savedDate = localStorage.getItem(dateKey);
  const today = getToday();

  // 日付が変わっていたら、この種類だけリセット
  if (savedDate !== today) {
    quests = quests.map(quest => ({
      text: quest.text,
      checked: false
    }));

    saveQuests(type, quests);

    localStorage.setItem(dateKey, today);

    // 今日の達成数もリセット
    localStorage.setItem(
      "dailyQuest-completed-" + type,
      0
    );
  }

  return quests;
}


// ==========================
// ホーム
// ==========================
function showItems() {

  const unlocked =
    JSON.parse(
      localStorage.getItem("dailyQuest-items")
    ) || [];

  const equipped =
    localStorage.getItem(
      "dailyQuest-equippedItem"
    );

  let itemsHTML = "";

  chestItems.forEach(item => {
    let rarityText = "";

if (item.rarity === "normal") {
  rarityText = "🟢 ノーマル";
}

if (item.rarity === "rare") {
  rarityText = "🔵 レア";
}

if (item.rarity === "super") {
  rarityText = "🟣 スーパーレア";
}

if (item.rarity === "legend") {
  rarityText = "🟡 レジェンド";
}

    const isUnlocked =
      unlocked.includes(item.id);

    const isEquipped =
      equipped === item.id;

    itemsHTML += `
     <div class="item-card ${
  isUnlocked
    ? "item-unlocked"
    : "item-locked"
} rarity-${item.rarity}">

        <div class="item-icon">
          ${
            isUnlocked
              ? item.icon
              : "❓"
          }
        </div>

        <div class="item-name">
          ${
            isUnlocked
              ? item.name
              : "？？？"
          }
        </div>
        <div class="item-rarity">
  ${rarityText}
</div>

        <div class="item-status">
          ${
            isUnlocked
              ? (
                isEquipped
                  ? "👑 装備中！"
                  : "✨ GET済み！"
              )
              : "🔒 未発見"
          }
        </div>

        ${
          isUnlocked
            ? `
              <button
                class="equip-button"
                data-item="${item.id}"
              >
                ${
                  isEquipped
                    ? "👑 装備中"
                    : "⚔️ 装備する"
                }
              </button>
            `
            : ""
        }

      </div>
    `;
  });

  document.querySelector("#app").innerHTML = `

    <div class="achievement-container">

      <h1>🎒 アイテム図鑑</h1>

      <p class="achievement-count">
        ${unlocked.length} / ${chestItems.length}
        アイテム発見！
      </p>

      <div class="item-list">
        ${itemsHTML}
      </div>

      <button id="back-items">
        ← 戻る
      </button>

    </div>

  `;

  document
    .querySelectorAll(".equip-button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const itemId =
            button.dataset.item;

          equipItem(itemId);

          showItems();

        }
      );

    });

  document
    .querySelector("#back-items")
    .addEventListener(
      "click",
      showHome
    );
}
function showHome() {
  const totalXP =
    Number(localStorage.getItem("dailyQuest-XP")) || 0;

  let level = 1;
  let xpRequired = 10;
  let remainingXP = totalXP;

  while (remainingXP >= xpRequired) {
    remainingXP -= xpRequired;
    level++;
    xpRequired += 5;
  }
  let chick = "🐣";

if (level >= 5) {
  chick = "🐥";
}

if (level >= 10) {
  chick = "🐔";
}

 const equippedItem =
  localStorage.getItem(
    "dailyQuest-equippedItem"
  );

let equippedIcon = "";

if (equippedItem) {
  const item = chestItems.find(
    item => item.id === equippedItem
  );

  if (item) {
    equippedIcon = item.icon;
  }
}

  const xpPercent = Math.min(
    Math.round(remainingXP / xpRequired * 100),
    100
  );

  const streak =
    Number(localStorage.getItem("dailyQuest-streak")) || 0;

  document.querySelector("#app").innerHTML = `
    <div class="container home-container">

     <div class="home-chick">
 <div class="home-chick">

  <div class="chick-character">

   ${
  equippedIcon
    ? `<div class="equipped-item ${equippedItem}">${equippedIcon}</div>`
    : ""
}

    <div class="chick-body">
      ${chick}
    </div>

  </div>

</div>

</div>
</div>
      <h1>🐥 Daily Quest</h1>

      <p class="message">
        今日も一緒に頑張ろう！
      </p>

      <div class="player-status">

        <div class="level-display">
          🏆 Lv.${level}
        </div>

        <div class="xp-text">
          ⭐ ${remainingXP} / ${xpRequired} XP
        </div>

        <div class="xp-bar">
          <div
            class="xp-fill"
            style="width: ${xpPercent}%"
          ></div>
        </div>

        <div class="streak-display">
          🔥 ${streak}日連続達成！
        </div>

      </div>

      <button class="start-button" id="start">
        🎮 ゲームスタート
      </button>

      <button class="choice-button" id="achievements">
        🏆 実績
      </button>
      <button class="choice-button" id="item-exchange">
  💎 アイテム交換
</button>
<button class="choice-button" id="item-inventory">
  🎒 アイテム
</button>
      <button class="choice-button" id="items">
  🎒 アイテム図鑑
</button>
<button
  class="choice-button"
  id="streak-button"
>
  🔥 連続記録
</button>
      <button class="choice-button" id="settings">
        ⚙️ クエスト設定
      </button>

    </div>
  `;

  document.querySelector("#start")
    .addEventListener("click", () => {
      const app = document.querySelector("#app");

      app.innerHTML = `
        <div class="start-animation">
          <div class="start-chick">🐥</div>
          <h1>🎮 ゲームスタート！</h1>
          <p>今日も一緒に頑張ろう！</p>
        </div>
      `;

      setTimeout(() => {
        showQuest();
      }, 1200);
    });

  document.querySelector("#achievements")
    .addEventListener("click", showAchievements);
    document.querySelector("#item-exchange")
  .addEventListener("click", showItemExchange);
  document.querySelector("#item-inventory")
  .addEventListener(
    "click",
    showItemInventory
  );
    document.querySelector("#items")
  .addEventListener("click", showItems);
  document.querySelector("#streak-button")
  .addEventListener(
    "click",
    showStreak
  );

  document.querySelector("#settings")
    .addEventListener("click", showSettings);
}


// ==========================
// 設定
// ==========================

function showSettings() {
  document.querySelector("#app").innerHTML = `
    <div class="container">
      <h1>⚙️ クエスト設定</h1>

      <div class="quest-card">
        <h2>設定するスケジュールを選んでね</h2>

        <button class="choice-button" id="normal">
          🌱 普通の日
        </button>

        <button class="choice-button" id="holiday">
          🏖️ 長期休み
        </button>

        <button class="choice-button" id="back">
          ← 戻る
        </button>
      </div>
    </div>
  `;

  document.querySelector("#normal")
    .addEventListener("click", () => {
      showSettingsSchedule("normal");
    });

  document.querySelector("#holiday")
    .addEventListener("click", () => {
      showSettingsSchedule("holiday");
    });

  document.querySelector("#back")
    .addEventListener("click", showHome);
}


function showSettingsSchedule(type) {
  const title =
    type === "normal"
      ? "🌱 普通の日"
      : "🏖️ 長期休み";

  document.querySelector("#app").innerHTML = `
    <div class="container">
      <h1>⚙️ クエスト設定</h1>

      <div class="quest-card">
        <h2>${title}</h2>

        <button class="choice-button" id="morning">
          🌞 午前部活
        </button>

        <button class="choice-button" id="afternoon">
          🌙 午後部活
        </button>

        <button class="choice-button" id="back">
          ← 戻る
        </button>
      </div>
    </div>
  `;

  document.querySelector("#morning")
    .addEventListener("click", () => {
      showSettingsQuests(type + "-morning");
    });

  document.querySelector("#afternoon")
    .addEventListener("click", () => {
      showSettingsQuests(type + "-afternoon");
    });

  document.querySelector("#back")
    .addEventListener("click", showSettings);
}


function showSettingsQuests(type) {
  const quests = getQuests(type);

  document.querySelector("#app").innerHTML = `
    <div class="container">
      <h1>⚙️ クエスト設定</h1>

      <div class="quest-card">
        <h2>クエストを編集</h2>

        <div id="settings-list"></div>

        <div class="add-quest-area">
          <input
            type="text"
            id="new-setting-quest"
            placeholder="新しいクエスト"
          >

          <button id="add-setting-quest">
            ＋追加
          </button>
        </div>

        <button class="choice-button" id="back">
          ← 戻る
        </button>
      </div>
    </div>
  `;

  const settingsList =
    document.querySelector("#settings-list");


  function renderSettings() {
    settingsList.innerHTML = "";

    quests.forEach((quest, index) => {
      const item = document.createElement("div");

      item.innerHTML = `
        <span>${quest.text}</span>
        <button class="edit-button">✏️</button>
        <button class="delete-button">🗑</button>
      `;

      settingsList.appendChild(item);

      item.querySelector(".edit-button")
        .addEventListener("click", () => {
          const span = item.querySelector("span");

          const input =
            document.createElement("input");

          input.type = "text";
          input.value = quest.text;

          span.replaceWith(input);
          input.focus();

          const editButton =
            item.querySelector(".edit-button");

          editButton.textContent = "💾";

          editButton.onclick = () => {
            const newText =
              input.value.trim();

            if (newText === "") {
              return;
            }

            quest.text = newText;

            saveQuests(type, quests);

            renderSettings();
          };
        });


      item.querySelector(".delete-button")
        .addEventListener("click", () => {

          quests.splice(index, 1);

          saveQuests(type, quests);

          renderSettings();
        });
    });
  }


  document.querySelector("#add-setting-quest")
    .addEventListener("click", () => {

      const input =
        document.querySelector(
          "#new-setting-quest"
        );

      const text =
        input.value.trim();

      if (text === "") {
        return;
      }

      quests.push({
        text: text,
        checked: false
      });

      saveQuests(type, quests);

      input.value = "";

      renderSettings();
    });


  document.querySelector("#back")
    .addEventListener("click", () => {

      showSettingsSchedule(
        type.startsWith("normal")
          ? "normal"
          : "holiday"
      );
    });


  renderSettings();
}


// ==========================
// クエスト開始
// ==========================

function showQuest() {

  function showSchedule(type) {

    const title =
      type === "normal"
        ? "🌱 普通の日"
        : "🏖️ 長期休み";

    document.querySelector("#app").innerHTML = `
      <div class="container">
        <h1>${title}</h1>

        <div class="quest-card">
          <h2>部活の時間は？</h2>

          <button class="choice-button" id="morning">
            🌞 午前部活
          </button>

          <button class="choice-button" id="afternoon">
            🌙 午後部活
          </button>
                    <button class="choice-button" id="back-home">
            🏠 ホームへ
          </button>
        </div>
      </div>
    `;

    document.querySelector("#morning")
      .addEventListener("click", () => {
        showQuestList(type + "-morning");
      });

    document.querySelector("#afternoon")
      .addEventListener("click", () => {
        showQuestList(type + "-afternoon");
      });
          document.querySelector("#back-home")
      .addEventListener("click", showHome);
  }


  document.querySelector("#app").innerHTML = `
    <div class="container">
      <h1>📋 今日のクエスト</h1>

      <div class="quest-card">
        <h2>今日はどっち？</h2>

        <button class="choice-button" id="normal">
          🌱 普通の日
        </button>

        <button class="choice-button" id="holiday">
          🏖️ 長期休み
        </button>
                <button class="choice-button" id="back-home">
          🏠 ホームへ
        </button>
      </div>
    </div>
  `;


  document.querySelector("#normal")
    .addEventListener("click", () => {
      showSchedule("normal");
    });

  document.querySelector("#holiday")
    .addEventListener("click", () => {
      showSchedule("holiday");
    });
      document.querySelector("#back-home")
    .addEventListener("click", showHome);
}


// ==========================
// クエスト一覧
// ==========================
function showXPPopup(text) {
  const popup = document.createElement("div");

  popup.className = "xp-popup";
  popup.textContent = text;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("show");
  }, 10);

  setTimeout(() => {
    popup.remove();
  }, 1000);
}
function showLoginBonus() {
  const popup = document.createElement("div");

  popup.className = "login-bonus-popup";

  popup.innerHTML = `
    <div class="login-bonus-content">

      <div class="login-bonus-icon">
        🌅
      </div>

      <h2>
        GOOD MORNING!
      </h2>

      <p>
        今日も一緒に頑張ろう！
      </p>

      <div class="login-bonus-xp">
        ⭐ LOGIN BONUS +5 XP！
      </div>

    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("show");
  }, 10);

  setTimeout(() => {
    popup.classList.remove("show");

    setTimeout(() => {
      popup.remove();
    }, 300);

  }, 2200);
}
function checkLoginBonus() {
  const today = getToday();

  const loginBonusDate =
    localStorage.getItem(
      "dailyQuest-loginBonusDate"
    );

  // 今日すでにもらっていたら何もしない
  if (loginBonusDate === today) {
    return;
  }

  // XPを5追加
  let totalXP =
    Number(
      localStorage.getItem(
        "dailyQuest-XP"
      )
    ) || 0;

  totalXP += 5;

  localStorage.setItem(
    "dailyQuest-XP",
    totalXP
  );

  // 今日受け取ったことを記録
  localStorage.setItem(
    "dailyQuest-loginBonusDate",
    today
  );

  // 演出
  showLoginBonus();
}
function giveStreakBonus(streak) {
  const bonuses = {
    3: 5,
    7: 10,
    14: 15,
    30: 30
  };

  const bonusXP = bonuses[streak];

  // ボーナス対象ではない
  if (!bonusXP) {
    return;
  }

  const bonusKey =
    "dailyQuest-streakBonus-" + streak;

  // すでにもらっていたら何もしない
  if (localStorage.getItem(bonusKey) === "true") {
    return;
  }

  let totalXP =
    Number(
      localStorage.getItem("dailyQuest-XP")
    ) || 0;

  totalXP += bonusXP;

  localStorage.setItem(
    "dailyQuest-XP",
    totalXP
  );

  localStorage.setItem(
    bonusKey,
    "true"
  );

  showStreakBonus(streak, bonusXP);
}
function showStreakBonus(streak, bonusXP) {
  const popup = document.createElement("div");

  popup.className = "streak-bonus-popup";

  let icon = "🔥";

  if (streak >= 30) {
    icon = "👑";
  } else if (streak >= 14) {
    icon = "🏆";
  } else if (streak >= 7) {
    icon = "🎉";
  }

  popup.innerHTML = `
    <div class="streak-bonus-content">

      <div class="streak-bonus-icon">
        ${icon}
      </div>

      <h2>
        ${streak} DAYS STREAK!
      </h2>

      <p>
        ${streak}日連続達成！
      </p>

      <div class="streak-bonus-xp">
        ⭐ STREAK BONUS +${bonusXP} XP！
      </div>

    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("show");
  }, 10);

  setTimeout(() => {
    popup.classList.remove("show");

    setTimeout(() => {
      popup.remove();
    }, 300);

  }, 2500);
}
function showCompleteBonus() {
  const popup = document.createElement("div");

  popup.className = "complete-popup";

  popup.innerHTML = `
    <div class="complete-popup-content">
      <div class="complete-popup-icon">🐥</div>
      <h2>ALL QUEST COMPLETE!</h2>
      <div class="complete-celebration">🎉🎉🎉</div>
      <p>今日のクエストを全部達成したよ！</p>
      <div class="complete-bonus">⭐ BONUS +20 XP！</div>
    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("show");
  }, 10);

  setTimeout(() => {
    popup.classList.remove("show");

    setTimeout(() => {
      popup.remove();
    }, 300);

  }, 2200);
}
function showDailyChest() {
  const popup = document.createElement("div");

  popup.className = "chest-popup";

  popup.innerHTML = `
    <div class="chest-content">

      <div class="chest-title">
        🎁 DAILY CHEST
      </div>

      <div class="chest-message">
        今日のクエストを全部達成した！
      </div>

      <button class="chest-button">
        🎁 宝箱を開ける！
      </button>

    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("show");
  }, 10);

  const button =
    popup.querySelector(".chest-button");

  button.addEventListener("click", () => {

    openDailyChest(popup);

  });
}
function openDailyChest(popup) {

  const random = Math.random();

  // 🎁 20%の確率でアイテム
  if (random < 0.20) {

    // 🎲 レア度抽選
const rarityRandom = Math.random();

let selectedRarity;

if (rarityRandom < 0.60) {
  selectedRarity = "normal";

} else if (rarityRandom < 0.85) {
  selectedRarity = "rare";

} else if (rarityRandom < 0.97) {
  selectedRarity = "super";

} else {
  selectedRarity = "legend";
}

// 🎁 選ばれたレア度のアイテムだけ取り出す
const rarityItems =
  chestItems.filter(
    item => item.rarity === selectedRarity
  );

// 🎲 そのレア度の中からランダム選択
const randomIndex =
  Math.floor(
    Math.random() * rarityItems.length
  );

const item =
  rarityItems[randomIndex];
    const isNew = saveItem(item.id);

let duplicateMessage = "";

if (!isNew) {
  let shards =
    Number(
      localStorage.getItem("dailyQuest-shards")
    ) || 0;

  shards++;

  localStorage.setItem(
    "dailyQuest-shards",
    shards
  );

  duplicateMessage =
    `💎 アイテムかけら +1！<br>` +
    `現在のかけら：${shards}`;
}
      let rarityClass = "";
let rarityText = "";

if (item.rarity === "normal") {
  rarityClass = "chest-normal";
  rarityText = "🟢 ノーマル";
}

if (item.rarity === "rare") {
  rarityClass = "chest-rare";
  rarityText = "🔵 レア";
}

if (item.rarity === "super") {
  rarityClass = "chest-super";
  rarityText = "🟣 スーパーレア";
}

if (item.rarity === "legend") {
  rarityClass = "chest-legend";
  rarityText = "🟡 レジェンド";
}

   const isLegend = item.rarity === "legend";

popup.querySelector(".chest-content").innerHTML = `

  <div class="chest-open ${rarityClass}">
    ${item.icon}
  </div>

  <h2>
    ${isLegend
      ? "👑✨ LEGENDARY!! ✨👑"
      : "🎉 ITEM GET!"}
  </h2>

  <p>
  ${isLegend
    ? "超レアアイテムを発見！！"
    : isNew
      ? "新しいアイテムを発見！"
      : "持っているアイテムが出た！"}
</p>

${duplicateMessage
  ? `<div class="duplicate-shard">${duplicateMessage}</div>`
  : ""}

  <div class="rarity-result">
    ${rarityText}
  </div>

  <div class="chest-reward">
    ${item.icon} ${item.name}
  </div>

`;
if (isLegend) {
  popup.classList.add("legend-chest");
}

  } else {

    // ⭐ 80%の確率でXP
    const xpRewards = [5, 10, 20];

    const bonusXP =
      xpRewards[
        Math.floor(
          Math.random() * xpRewards.length
        )
      ];

    let totalXP =
      Number(
        localStorage.getItem(
          "dailyQuest-XP"
        )
      ) || 0;

    totalXP += bonusXP;

    localStorage.setItem(
      "dailyQuest-XP",
      totalXP
    );

    popup.querySelector(".chest-content").innerHTML = `

      <div class="chest-open">
        ⭐
      </div>

      <h2>
        🎉 CHEST OPEN!
      </h2>

      <p>
        宝箱からXPを発見！
      </p>

      <div class="chest-reward">
        ⭐ +${bonusXP} XP！
      </div>

    `;
  }

  setTimeout(() => {

    popup.classList.remove("show");

    setTimeout(() => {
      popup.remove();
    }, 300);

  }, 1800);
}
function showQuestList(type) {

  const title =
    type.endsWith("-morning")
      ? "🌞 午前部活"
      : "🌙 午後部活";

  const quests = getQuests(type);

  document.querySelector("#app").innerHTML = `
    <div class="container">
      <h1>${title}</h1>

      <div class="quest-card">
        <h2>今日のクエスト</h2>

        <div id="quest-list"></div>

        <p id="progress">0%</p>

        <div class="add-quest-area">

          <input
            type="text"
            id="new-quest"
            placeholder="新しいクエストを入力"
          >

          <button id="save-quest">
            ＋追加
          </button>

        </div>

        <button id="back">
          ← 戻る
        </button>

      </div>
    </div>
  `;


  const questList =
    document.querySelector("#quest-list");


  function renderQuests() {

    questList.innerHTML = "";


    quests.forEach((quest, index) => {

      const label =
        document.createElement("label");

      label.className = "quest-item";

      label.innerHTML = `
        <input
          type="checkbox"
          class="quest"
          ${quest.checked ? "checked" : ""}
        >

        <span>${quest.text}</span>

        <button
          class="edit-button"
          type="button"
        >
          ✏️
        </button>

        <button
          class="delete-button"
          type="button"
        >
          🗑
        </button>
      `;


      questList.appendChild(label);


      const checkbox =
        label.querySelector(".quest");


      checkbox.addEventListener("change", () => {

  quest.checked = checkbox.checked;

  saveQuests(type, quests);

  // XP演出
  showXPPopup(
    checkbox.checked ? "+10 XP！" : "-10 XP"
  );

  updateProgress();

  // 全クエスト達成チェック
  if (
    checkbox.checked &&
    quests.length > 0 &&
    quests.every(quest => quest.checked)
  ) {

    const today = getToday();

    const bonusDate =
      localStorage.getItem(
        "dailyQuest-completeBonusDate"
      );

    const isFirstCompleteToday = bonusDate !== today;

if (isFirstCompleteToday) {

  let totalXP =
    Number(
      localStorage.getItem("dailyQuest-XP")
    ) || 0;

  totalXP += 20;

  localStorage.setItem(
    "dailyQuest-XP",
    totalXP
  );

  localStorage.setItem(
    "dailyQuest-completeBonusDate",
    today
  );
}

setTimeout(() => {

  if (isFirstCompleteToday) {
    showCompleteBonus();
  }

  const streakDelay =
    isFirstCompleteToday ? 2500 : 0;

  setTimeout(() => {

    showStreak();

    const chestDate =
      localStorage.getItem(
        "dailyQuest-chestDate"
      );

    if (chestDate !== today) {

      localStorage.setItem(
        "dailyQuest-chestDate",
        today
      );

      setTimeout(() => {
        showDailyChest();
      }, 2500);
    }

  }, streakDelay);

}, 300);
  }

});

      label.querySelector(".edit-button")
        .addEventListener("click", () => {

          const span =
            label.querySelector("span");

          const input =
            document.createElement("input");

          input.type = "text";
          input.value = span.textContent;

          span.replaceWith(input);

          input.focus();


          const editButton =
            label.querySelector(
              ".edit-button"
            );

          editButton.textContent = "💾";


          editButton.onclick = () => {

            const newText =
              input.value.trim();

            if (newText === "") {
              return;
            }

            quest.text = newText;

            saveQuests(type, quests);

            renderQuests();
          };
        });


      label.querySelector(".delete-button")
        .addEventListener("click", () => {

          quests.splice(index, 1);

          saveQuests(type, quests);

          renderQuests();
        });

    });


    updateProgress();
  }


  // ==========================
  // 進捗更新
  // ==========================

  function updateProgress() {

    const progress =
      document.querySelector("#progress");


    if (quests.length === 0) {

      progress.textContent =
        "達成率：0%";

      return;
    }


    const completed =
      quests.filter(
        quest => quest.checked
      ).length;


    // ==========================
    // 実績
    // ==========================

    if (completed > 0) {
      unlockAchievement("firstQuest");
    }


    const percent =
      Math.round(
        completed / quests.length * 100
      );


    const xp =
      completed * 10;


    // ==========================
    // 累積XP
    // ==========================

    let totalXP =
      Number(
        localStorage.getItem(
          "dailyQuest-XP"
        )
      ) || 0;


    const oldCompleted =
      Number(
        localStorage.getItem(
          "dailyQuest-completed-" + type
        )
      ) || 0;


    const xpChange =
      (completed - oldCompleted) * 10;


    totalXP += xpChange;


    if (totalXP < 0) {
      totalXP = 0;
    }


    localStorage.setItem(
      "dailyQuest-XP",
      totalXP
    );


    localStorage.setItem(
      "dailyQuest-completed-" + type,
      completed
    );


    // ==========================
    // 全クエスト達成
    // ==========================

    if (percent === 100) {

      const today =
        getToday();
        // 📅 毎日の達成履歴を保存
let streakHistory =
  JSON.parse(
    localStorage.getItem(
      "dailyQuest-streakHistory"
    )
  ) || [];

if (!streakHistory.includes(today)) {

  streakHistory.push(today);

  localStorage.setItem(
    "dailyQuest-streakHistory",
    JSON.stringify(streakHistory)
  );
}

      const streakCompletedDate =
        localStorage.getItem(
          "dailyQuest-streakCompletedDate"
        );


      let streak =
        Number(
          localStorage.getItem(
            "dailyQuest-streak"
          )
        ) || 0;


      if (streakCompletedDate !== today) {

        const yesterdayDate =
          new Date();

        yesterdayDate.setDate(
          yesterdayDate.getDate() - 1
        );


        const yesterday =
          yesterdayDate.getFullYear() +
          "-" +
          String(
            yesterdayDate.getMonth() + 1
          ).padStart(2, "0") +
          "-" +
          String(
            yesterdayDate.getDate()
          ).padStart(2, "0");


        if (
          streakCompletedDate ===
          yesterday
        ) {
          streak++;
        } else {
          streak = 1;
        }


        localStorage.setItem(
          "dailyQuest-streak",
          streak
        );


        localStorage.setItem(
          "dailyQuest-streakCompletedDate",
          today
        );
// 🏆 自己最高記録を保存
const bestStreak =
  Number(
    localStorage.getItem(
      "dailyQuest-bestStreak"
    )
  ) || 0;

if (streak > bestStreak) {

  localStorage.setItem(
    "dailyQuest-bestStreak",
    streak
  );

}

       if (streak === 3) {
  unlockAchievement("streak3");
}

if (streak === 7) {
  unlockAchievement("streak7");

  alert(
    "🎉🎉 7 DAYS COMPLETE! 🎉🎉\n\n" +
    "🐥 1週間連続達成！"
  );
}

giveStreakBonus(streak);
      }
    }


    // ==========================
    // レベル計算
    // ==========================

    let level = 1;

    if (totalXP >= 100) {
      unlockAchievement("xp100");
    }


    let xpRequired = 10;

    let remainingXP = totalXP;


    while (
      remainingXP >= xpRequired
    ) {

      remainingXP -= xpRequired;

      level++;

      xpRequired += 5;
    }


    // ==========================
    // レベルアップ
    // ==========================

    const previousLevel =
      Number(
        localStorage.getItem(
          "dailyQuest-level"
        )
      ) || 1;


    if (level > previousLevel) {

      localStorage.setItem(
        "dailyQuest-level",
        level
      );


      let levelUpMessage = "";


      if (level === 5) {

        levelUpMessage =
          "🐥 ひよこが成長したよ！";

      } else if (level === 10) {

        levelUpMessage =
          "🐔 ひよこがさらに成長したよ！";

      } else {

        levelUpMessage =
          "✨ もっと強くなったよ！";
      }


      alert(
        `🎉 LEVEL UP! 🎉\n\n` +
        `🏆 Lv.${level}になったよ！\n\n` +
        levelUpMessage
      );
    }


    // ==========================
    // ひよこ
    // ==========================

    let chick = "🐣";


    if (level >= 5) {
      chick = "🐥";
    }


    if (level >= 10) {
      chick = "🐔";
    }


    // ==========================
    // streakメッセージ
    // ==========================

    const streak =
      Number(
        localStorage.getItem(
          "dailyQuest-streak"
        )
      ) || 0;


    let streakMessage =
      "まずは1日達成！🐥";


    if (streak >= 3) {
      streakMessage =
        "いい調子！🔥";
    }


    if (streak >= 7) {
      streakMessage =
        "🎉 1週間連続達成！すごい！";
    }


    if (streak >= 14) {
      streakMessage =
        "🏆 2週間連続達成！習慣になってきたね！";
    }


    if (streak >= 30) {
      streakMessage =
        "👑 30日連続達成！最強の習慣だ！";
    }


    // ==========================
    // XPゲージ
    // ==========================

    const xpInLevel =
      remainingXP;

    const xpNeeded =
      xpRequired;


    const xpPercent =
      Math.min(
        Math.round(
          xpInLevel /
          xpNeeded *
          100
        ),
        100
      );


    progress.innerHTML = `

      <div class="chick">
        ${chick}
      </div>

      <div>
        達成率：${percent}%
      </div>

      <div>
        ⭐ 今日のXP：${xp}
      </div>

      <div>
        🏆 Lv.${level}
      </div>

      <div class="xp-text">
        🌟 ${xpInLevel} / ${xpNeeded} XP
      </div>

      <div class="xp-bar">

        <div
          class="xp-fill"
          style="width: ${xpPercent}%"
        ></div>

      </div>

      <div>
        次のレベルまであと
        ${xpNeeded - xpInLevel} XP！
      </div>

      <div>
        🔥 連続達成：${streak}日
      </div>

      <div>
        ${streakMessage}
      </div>

    `;
  }


  // ==========================
  // クエスト追加
  // ==========================

  document.querySelector("#save-quest")
    .addEventListener("click", () => {

      const input =
        document.querySelector("#new-quest");

      const text =
        input.value.trim();


      if (text === "") {
        return;
      }


      quests.push({
        text: text,
        checked: false
      });


      saveQuests(type, quests);


      input.value = "";


      renderQuests();
    });


  // ==========================
  // 戻る
  // ==========================

  document.querySelector("#back")
    .addEventListener(
      "click",
      showQuest
    );


  renderQuests();
}


// ==========================
// 実績
// ==========================

const achievements = {

  firstQuest: {
    name: "🌱 はじめの一歩",
    description: "初めてクエストを達成"
  },

  streak3: {
    name: "🔥 3日連続",
    description: "3日連続で全クエスト達成",
    target: 3
  },

  streak7: {
    name: "🎉 1週間達成",
    description: "7日連続で全クエスト達成",
    target: 7
  },

  xp100: {
    name: "⭐ XPハンター",
    description: "累積100 XPを獲得",
    target: 100
  }
};
const chestItems = [
  {
    id: "flower",
    name: "お花",
    icon: "🌸",
    rarity: "normal"
  },

  {
    id: "ribbon",
    name: "リボン",
    icon: "🎀",
    rarity: "rare"
  },

  {
    id: "hat",
    name: "帽子",
    icon: "👒",
    rarity: "super"
  },

  {
    id: "sunglasses",
    name: "サングラス",
    icon: "🕶️",
    rarity: "legend"
  }
];
function saveItem(itemId) {
  const items =
    JSON.parse(
      localStorage.getItem("dailyQuest-items")
    ) || [];

  if (!items.includes(itemId)) {
    items.push(itemId);

    localStorage.setItem(
      "dailyQuest-items",
      JSON.stringify(items)
    );

    return true;
  }

  return false;
}
function equipItem(itemId) {

  localStorage.setItem(
    "dailyQuest-equippedItem",
    itemId
  );

}


// ==========================
// 実績解除
// ==========================

function unlockAchievement(id) {

  const unlocked =
    JSON.parse(
      localStorage.getItem(
        "dailyQuest-achievements"
      )
    ) || [];


  if (unlocked.includes(id)) {
    return;
  }


  unlocked.push(id);


  localStorage.setItem(
    "dailyQuest-achievements",
    JSON.stringify(unlocked)
  );


  const achievementDates =
    JSON.parse(
      localStorage.getItem(
        "dailyQuest-achievement-dates"
      )
    ) || {};


  const today =
    getToday();


  achievementDates[id] =
    today;


  localStorage.setItem(
    "dailyQuest-achievement-dates",
    JSON.stringify(
      achievementDates
    )
  );


  const achievement =
    achievements[id];


  const popup =
    document.createElement("div");


  popup.className =
    "achievement-popup";


  popup.innerHTML = `

    <div class="achievement-popup-content">

      <div class="achievement-popup-icon">
        🏆
      </div>

      <h2>
        🎉 実績解除！
      </h2>

      <h3>
        ${achievement.name}
      </h3>

      <p>
        ${achievement.description}
      </p>

    </div>

  `;


  document.body.appendChild(
    popup
  );


  setTimeout(() => {
    popup.classList.add("show");
  }, 50);


  setTimeout(() => {

    popup.classList.remove("show");


    setTimeout(() => {
      popup.remove();
    }, 300);

  }, 2500);
}


// ==========================
// 実績画面
// ==========================

function showAchievements() {

  const unlocked =
    JSON.parse(
      localStorage.getItem(
        "dailyQuest-achievements"
      )
    ) || [];


  const achievementDates =
    JSON.parse(
      localStorage.getItem(
        "dailyQuest-achievement-dates"
      )
    ) || {};


  let unlockedHTML = "";
  let lockedHTML = "";


  for (
    const id in achievements
  ) {

    const achievement =
      achievements[id];

    const isUnlocked =
      unlocked.includes(id);


    let progressText = "";


    if (isUnlocked) {

      const unlockedDate =
        achievementDates[id];


      if (unlockedDate) {

        progressText =
          `✨ 達成済み！<br>` +
          `📅 ${unlockedDate} 達成`;

      } else {

        progressText =
          "✨ 達成済み！";
      }


    } else if (
      id === "firstQuest"
    ) {

      progressText =
        "🔒 クエストを1つ達成しよう！";


    } else if (
      id === "streak3"
    ) {

      const currentStreak =
        Number(
          localStorage.getItem(
            "dailyQuest-streak"
          )
        ) || 0;


      progressText =
        currentStreak >= 3
          ? "🔒 条件達成！"
          : `🔒 あと ${3 - currentStreak}日！`;


    } else if (
      id === "streak7"
    ) {

      const currentStreak =
        Number(
          localStorage.getItem(
            "dailyQuest-streak"
          )
        ) || 0;


      progressText =
        currentStreak >= 7
          ? "🔒 条件達成！"
          : `🔒 あと ${7 - currentStreak}日！`;


    } else if (
      id === "xp100"
    ) {

      const currentXP =
        Number(
          localStorage.getItem(
            "dailyQuest-XP"
          )
        ) || 0;


      progressText =
        `🔒 あと ${
          Math.max(
            100 - currentXP,
            0
          )
        } XP！`;
    }


    const card = `

      <div
        class="achievement ${
          isUnlocked
            ? "unlocked"
            : "locked"
        }"
      >

        <div>
          ${
            isUnlocked
              ? "🏆"
              : "🔒"
          }

          ${achievement.name}
        </div>

        <small>
          ${achievement.description}
        </small>

        <p class="achievement-progress">
          ${progressText}
        </p>

      </div>

    `;


    if (isUnlocked) {
      unlockedHTML += card;
    } else {
      lockedHTML += card;
    }
  }


  let html = `

    <div class="achievement-container">

      <h1>
        🏆 実績
      </h1>

      <p class="achievement-count">
        ${unlocked.length} /
        ${Object.keys(achievements).length}
        実績解除！
      </p>

  `;


  if (unlockedHTML !== "") {

    html += `

      <h2>
        ✨ 達成済み
      </h2>

      <div class="achievement-list">
        ${unlockedHTML}
      </div>

    `;
  }


  if (lockedHTML !== "") {

    html += `

      <h2>
        🔒 未達成
      </h2>

      <div class="achievement-list">
        ${lockedHTML}
      </div>

    `;
  }


  html += `

      <button id="back-achievements">
        ← 戻る
      </button>

    </div>

  `;


  document.querySelector(
    "#app"
  ).innerHTML = html;


  document.querySelector(
    "#back-achievements"
  )
    .addEventListener(
      "click",
      showHome
    );
}
function showItemExchange() {
  const shards =
    Number(
      localStorage.getItem("dailyQuest-shards")
    ) || 0;

  document.querySelector("#app").innerHTML = `
    <div class="container">

      <h1>💎 アイテム交換</h1>

      <div class="quest-card">

        <h2>💎 所持かけら：${shards}</h2>

        <p>
          かけらを集めてアイテムと交換しよう！
        </p>

        <button
          class="choice-button"
          id="exchange-normal"
        >
          🌸 ノーマルアイテム<br>
          💎 5個
        </button>

        <button
          class="choice-button"
          id="exchange-rare"
        >
          🎀 レアアイテム<br>
          💎 10個
        </button>

        <button
          class="choice-button"
          id="exchange-super"
        >
          👒 スーパーレア<br>
          💎 20個
        </button>

        <button
          class="choice-button"
          id="back-exchange"
        >
          ← 戻る
        </button>

      </div>
    </div>
  `;

 document.querySelector("#exchange-normal")
  .addEventListener("click", () => {

    let shards =
      Number(
        localStorage.getItem("dailyQuest-shards")
      ) || 0;

    if (shards < 5) {
      alert("💎 かけらが足りないよ！");
      return;
    }

    const normalItems =
      chestItems.filter(
        item => item.rarity === "normal"
      );

    const randomIndex =
      Math.floor(
        Math.random() * normalItems.length
      );

    const item =
      normalItems[randomIndex];

    shards -= 5;

    localStorage.setItem(
      "dailyQuest-shards",
      shards
    );

    saveItem(item.id);

    alert(
      `🎉 アイテム交換成功！\n\n` +
      `${item.icon} ${item.name} をゲット！\n\n` +
      `💎 残りのかけら：${shards}`
    );

    showItemExchange();
  });
  document.querySelector("#exchange-rare")
  .addEventListener("click", () => {

    let shards =
      Number(
        localStorage.getItem("dailyQuest-shards")
      ) || 0;

    if (shards < 10) {
      alert("💎 かけらが足りないよ！");
      return;
    }

    const rareItems =
      chestItems.filter(
        item => item.rarity === "rare"
      );

    const randomIndex =
      Math.floor(
        Math.random() * rareItems.length
      );

    const item =
      rareItems[randomIndex];

    shards -= 10;

    localStorage.setItem(
      "dailyQuest-shards",
      shards
    );

    saveItem(item.id);

    alert(
      `🎉 アイテム交換成功！\n\n` +
      `${item.icon} ${item.name} をゲット！\n\n` +
      `💎 残りのかけら：${shards}`
    );

    showItemExchange();
  });
  document.querySelector("#exchange-super")
  .addEventListener("click", () => {

    let shards =
      Number(
        localStorage.getItem("dailyQuest-shards")
      ) || 0;

    if (shards < 20) {
      alert("💎 かけらが足りないよ！");
      return;
    }

    const superItems =
      chestItems.filter(
        item => item.rarity === "super"
      );

    const randomIndex =
      Math.floor(
        Math.random() * superItems.length
      );

    const item =
      superItems[randomIndex];

    shards -= 20;

    localStorage.setItem(
      "dailyQuest-shards",
      shards
    );

    saveItem(item.id);

    alert(
      `🎉 アイテム交換成功！\n\n` +
      `${item.icon} ${item.name} をゲット！\n\n` +
      `💎 残りのかけら：${shards}`
    );

    showItemExchange();
  });
  document.querySelector("#back-exchange")
    .addEventListener("click", showHome);
}
function showItemInventory() {

  const items =
    JSON.parse(
      localStorage.getItem("dailyQuest-items")
    ) || [];

  const ownedItems =
    chestItems.filter(
      item => items.includes(item.id)
    );

  let itemsHTML = "";

  if (ownedItems.length === 0) {

    itemsHTML = `
      <p>🎒 まだアイテムを持っていないよ！</p>
    `;

  } else {

    ownedItems.forEach(item => {

  itemsHTML += `
    <div class="inventory-item">

      <div class="inventory-icon">
        ${item.icon}
      </div>

      <div class="inventory-name">
        ${item.name}
      </div>

      <div class="inventory-rarity">
        ${item.rarity}
      </div>

      <button
        class="equip-button"
        data-item-id="${item.id}"
      >
        装備する
      </button>

    </div>
  `;
});
  }

  document.querySelector("#app").innerHTML = `

    <div class="container">

      <h1>🎒 アイテム</h1>

      <div class="quest-card">

        <h2>
          🎒 所持アイテム：${ownedItems.length}
        </h2>

        <div class="inventory-list">
          ${itemsHTML}
        </div>

        <button
          class="choice-button"
          id="back-inventory"
        >
          ← 戻る
        </button>

      </div>

    </div>

  `;

  document.querySelector("#back-inventory")
    .addEventListener(
      "click",
      showHome
    );
    document.querySelectorAll(".equip-button")
  .forEach(button => {

    button.addEventListener("click", () => {

      const itemId =
        button.dataset.itemId;

      localStorage.setItem(
        "dailyQuest-equippedItem",
        itemId
      );

      showItemInventory();
    });

  });
}
function showStreak() {

  const streak =
    Number(
      localStorage.getItem("dailyQuest-streak")
    ) || 0;
const bestStreak =
  Number(
    localStorage.getItem("dailyQuest-bestStreak")
  ) || 0;
  // 🎯 次のストリーク目標
let nextGoal = 3;

if (streak >= 3) {
  nextGoal = 7;
}

if (streak >= 7) {
  nextGoal = 14;
}

if (streak >= 14) {
  nextGoal = 30;
}

if (streak >= 30) {
  nextGoal = 50;
}

const daysLeft =
  nextGoal - streak;
  // 🎯 次の目標までの進捗率
const previousGoal =
  nextGoal === 3 ? 0 :
  nextGoal === 7 ? 3 :
  nextGoal === 14 ? 7 :
  nextGoal === 30 ? 14 :
  30;

const goalProgress =
  Math.min(
    Math.round(
      (streak - previousGoal) /
      (nextGoal - previousGoal) *
      100
    ),
    100
  );
  // 🏆 ストリークマイルストーン
const milestones = [3, 7, 14, 30];

let milestoneHTML = "";

milestones.forEach(goal => {

  const achieved = streak >= goal;

  milestoneHTML += `
    <div class="milestone-item">

      <div class="milestone-number">
        🔥 ${goal} DAYS
      </div>

      <div class="milestone-status">
        ${
          achieved
            ? "✅ 達成！"
            : `🔒 あと ${goal - streak} 日`
        }
      </div>

    </div>
  `;
});
  const history =
    JSON.parse(
      localStorage.getItem(
        "dailyQuest-streakHistory"
      )
    ) || [];
    let weekCompleted = 0;

  const today =
    new Date();

  let weekHTML = "";

  const weekNames =
    ["日", "月", "火", "水", "木", "金", "土"];

  for (let i = 6; i >= 0; i--) {

    const date =
      new Date(today);

    date.setDate(
      today.getDate() - i
    );

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    const dateString =
      `${year}-${month}-${day}`;

    const completed =
      history.includes(dateString);
      if (completed) {
  weekCompleted++;
}

    const isToday =
      i === 0;

    weekHTML += `

      <div
        class="
          streak-day
          ${completed ? "completed" : ""}
          ${isToday ? "today" : ""}
        "
      >

        <div class="weekday">
          ${weekNames[date.getDay()]}
        </div>

        <div class="day-icon">
          ${completed ? "🔥" : "○"}
        </div>

        <div class="day-number">
          ${date.getDate()}
        </div>

      </div>

    `;
  }

  document.querySelector("#app").innerHTML = `

    <div class="container streak-container">

      <h1>🔥 連続記録</h1>

      <div class="streak-card">

        <div class="streak-fire">
          🔥
        </div>

        <div class="streak-number">
          ${streak}
        </div>

        <div class="streak-label">
          日連続達成中！
        </div>

        <div class="streak-message">
          ${
            streak === 0
              ? "まずは今日から始めよう！🐥"
              : streak < 3
                ? "いいスタート！✨"
                : streak < 7
                  ? "この調子で続けよう！🔥"
                  : "すごい！習慣になってきたね！🏆"
          }
        </div>

        <h2>
          📅 過去7日間
        </h2>
<div class="best-streak">

  <div class="best-streak-title">
    🏆 自己最高記録
  </div>

  <div class="best-streak-number">
    ${bestStreak}日
  </div>

</div>
        <div class="streak-week">
          ${weekHTML}
        </div>
        <div class="week-progress">
  🔥 ${weekCompleted} / 7 日達成！
</div>
<div class="next-goal">
<div class="milestones">

  <div class="milestones-title">
    🏆 STREAK MILESTONES
  </div>

  ${milestoneHTML}

</div>

  <div class="next-goal-title">
    🎯 NEXT GOAL
  </div>

  <div class="next-goal-number">
    🔥 ${nextGoal} DAYS
  </div>
<div class="goal-progress-bar">

  <div
    class="goal-progress-fill"
    style="width: ${goalProgress}%"
  ></div>

</div>

<div class="goal-progress-percent">
  ${goalProgress}%
</div>
  <div class="next-goal-message">
    あと ${daysLeft} 日続けよう！
  </div>

</div>
        <button
          class="choice-button"
          id="back-streak"
        >
          ← ホームへ
        </button>

      </div>

    </div>

  `;

  document.querySelector("#back-streak")
    .addEventListener(
      "click",
      showHome
    );
}

// ==========================
// 起動
// ==========================

checkLoginBonus();

showHome();
