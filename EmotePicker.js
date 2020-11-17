function EmoteSelect(element, emoteIndex, container, openBtn, path) {
  this.inp = element ? element : document.getElementById("ChatInput");
  this.emoteIndex = emoteIndex ? emoteIndex : "index_v2.json";
  this.container = container
    ? container
    : document.getElementById("chatInputArea");
  this.openBtn = openBtn ? openBtn : document.getElementById("openBtn");
  this.path = path ? path : "null";
  this.emoteElem = document.createElement("div");
  this.emoteElem.classList.add("emotePicker", "container");
  this.container.appendChild(this.emoteElem);

  // shameless plug
  this.comment = document.createComment("Designed and developed by Erickmack");
  this.emoteElem.appendChild(this.comment);

  this.init();
}

EmoteSelect.prototype.init = function () {
  // init basic layout
  this.initializeContainers();
  // add EventListener to emote button
  this.openBtn.addEventListener("click", function (e) {
    console.log("clicked");
    hideElem(this.emoteElem);
  });

  this.initializeEmotes();
};

EmoteSelect.prototype.initializeContainers = function () {
  // create input elem for searching emotes
  this.searchElem = document.createElement("form");
  this.searchElem.classList.add("form-inline");
  this.emoteElem.appendChild(this.searchElem);
  this.searchBar = document.createElement("input");
  this.searchBar.classList.add("form-control");
  this.searchBar.id = "emoteSearch";
  this.searchBar.setAttribute("type", "text");
  this.searchBar.setAttribute("placeholder", "Search Emotes");
  this.searchElem.appendChild(this.searchBar);

  // container for group links and emote wrapper
  this.optionsContainer = document.createElement("div");
  this.optionsContainer.classList.add("optionsContainer");
  this.emoteElem.appendChild(this.optionsContainer);
  // create wrapper divs for emotes and emote groups
  this.emotesWrapper = document.createElement("div");
  this.emotesWrapper.classList.add("emotesWrapper");
  this.optionsContainer.appendChild(this.emotesWrapper);
};

EmoteSelect.prototype.initializeEmotes = function () {
  // Jstris standard emotes
  this.emoteList = {
    thinking: "/svg/e/thinking.svg",
    monkaAngry: "/img/e/monkaAngry.png",
    monkaThink: "/img/e/monkaThink.png",
    monkaSweaT: "/img/e/monkaSweaT.png",
    monkaPogT: "/img/e/monkaPogT.png",
    jstris: "/img/e/jstris.png",
    monkaT: "/img/e/monkaT64.png",
    monkaOMEGA_T: "/img/e/monkaOMEGA_T64.png",
    thinkingmap: "/img/e/thinkingmap.png",
    infSTSD: "/img/e/infSTSD64.gif",
    Tspin: "/img/e/tspin64.gif",
    GG: "/img/e/GG.png",
    F: "/img/e/F.png",
    Badger: "/img/e/badger.png",
    trap: "/img/i/four.png",
    tornado: "/img/i/tornado.png",
    unknown: "/img/i/unknown.png",
    win: "/img/i/win.png",
    invert: "/img/i/invert.png",
    compress: "/img/i/compress.png",
    item: "/tex2.png",
  };

  // Emote groups
  this.groupList = [
    "jstris",
    "smileys-emotion",
    "people-body",
    "component",
    "animals-nature",
    "food-drink",
    "travel-places",
    "activities",
    "objects",
    "symbols",
    "flags",
    "extras-unicode",
    "extras-openmoji",
  ];

  this.createGroups(this.groupList);
};

EmoteSelect.prototype.createGroups = async function (groups) {
  let self = this;
  let emojis = await fetch("/index_v2.json").then((res) => res.json());
  // config for intersection observer
  let observerConfig = {
    root: document.querySelector(".emotesWrapper"),
    rootMargin: "10px",
    threshold: 0,
  };
  // new intersection observer
  let observer = new IntersectionObserver(onView, observerConfig);
  //document fragment
  this.groupsFragment = document.createDocumentFragment();

  groups.forEach((group) => {
    let grouped = emojis.filter((emoji) => emoji["g"] === `${group}`);
    self.groupDiv = document.createElement("div");
    self.groupDiv.classList.add("emotesGroup");
    self.groupDiv.id = `${group}`;
    self.groupDiv.setAttribute("data-groupName", `${group}`);
    observer.observe(self.groupDiv);
    self.groupName = document.createElement("h2");
    self.groupName.id = `${group}`;
    self.groupName.classList.add("groupName");
    self.groupName.innerText = `${group}`;
    self.groupDiv.appendChild(self.groupName);
    self.groupDiv.style.minHeight =
      group === "jstris"
        ? `${Math.ceil(21 / 7) * 40}px`
        : `${Math.ceil(grouped.length / 6) * 40}px`;
    self.groupsFragment.appendChild(self.groupDiv);
  });
  this.emotesWrapper.appendChild(this.groupsFragment);

  // handler function for intersection observer
  function onView(changes, observer) {
    setTimeout(() => {
      changes.forEach((change) => {
        if (change.intersectionRatio > 0) {
          self.createImages(emojis, change.target);
          observer.unobserve(change.target);
        }
      });
    }, 200);
  }

  // create the buttons to select groups
  this.selectGroup();
};

EmoteSelect.prototype.createImages = async function (emotes, target) {
  let self = this;
  // document fragment to append emotes
  this.emotesFragment = document.createDocumentFragment();
  let group = target.getAttribute("data-groupName");
  let grouped =
    group === "jstris"
      ? this.emoteList
      : emotes.filter((emote) => emote["g"] === `${group}`);

  if (group === "jstris") {
    for (let key in grouped) {
      if (grouped.hasOwnProperty(key)) {
        self.emoteImg = document.createElement("img");
        self.emoteImg.classList.add("emoteImg", "loadingEmote");
        self.emoteImg.onload = function (e) {
          e.target.classList.remove("loadingEmote");
        };
        self.emoteImg.setAttribute("loading", "lazy");
        self.emoteImg.setAttribute("data-emoteName", `${key}`);
        self.emoteImg.setAttribute(
          "src",
          `https://s.jezevec10.com/res${grouped[key]}`
        );
        self.emoteImg.addEventListener("click", (e) => {
          this.chatEmote(e.target);
        });
        self.emoteImg.addEventListener("mouseover", (e) => {
          this.showName(e.target);
        });
        self.emotesFragment.appendChild(self.emoteImg);
      }
    }
  } else {
    for (let i = 0; i < grouped.length; i++) {
      self.emoteImg = document.createElement("img");
      self.emoteImg.classList.add("emoteImg", "loadingEmote");
      self.emoteImg.onload = function (e) {
        e.target.classList.remove("loadingEmote");
      };
      self.emoteImg.setAttribute("loading", "lazy");
      self.emoteImg.setAttribute("data-emoteName", `${grouped[i]["n"]}`);
      self.emoteImg.setAttribute("src", `/out/${grouped[i]["n"]}-2.svg`);
      self.emoteImg.addEventListener("click", (e) => {
        this.chatEmote(e.target);
      });
      self.emoteImg.addEventListener("mouseover", (e) => {
        this.showName(e.target);
      });
      self.emotesFragment.appendChild(self.emoteImg);
    }
  }

  target.appendChild(this.emotesFragment);
};

EmoteSelect.prototype.selectGroup = function () {
  this.groupEmote = [
    "https://s.jezevec10.com/res/img/e/jstris.png",
    "grinning_face",
    "waving_hand",
    "red_hair",
    "monkey_face",
    "red_apple",
    "compass",
    "jack-o-lantern",
    "crown",
    "warning",
    "triangular_flag",
    "hacker_cat",
    "narwhal",
  ];
  this.selectionDiv = document.createElement("div");
  this.selectionDiv.classList.add("selectionDiv");
  for (let i = 0; i < this.groupList.length; i++) {
    this.groupImage = document.createElement("img");
    this.groupImage.classList.add("groupLink");
    this.groupImage.setAttribute("data-groupName", `${this.groupList[i]}`);
    // scrolling action
    this.groupImage.addEventListener("click", (e) => {
      let group = e.target.getAttribute("data-groupname");
      let elem = document.getElementById(group);
      let topPos = elem.offsetTop - 37;
      this.emotesWrapper.scrollTop = topPos
    });
    // attributes
    this.groupImage.setAttribute("title", `${this.groupList[i]}`);
    if (this.groupList[i] === "jstris") {
      this.groupImage.setAttribute("src", `${this.groupEmote[i]}`);
    } else {
      this.groupImage.setAttribute("src", `/out/${this.groupEmote[i]}-2.svg`);
    }
    this.selectionDiv.appendChild(this.groupImage);
  }
  this.optionsContainer.appendChild(this.selectionDiv);
};

EmoteSelect.prototype.chatEmote = function (target) {
  let emoteName = target.getAttribute("data-emoteName");
  let chat = document.getElementById("chatInput");

  chat.value += `:${emoteName}: `;
};

EmoteSelect.prototype.showName = function (target) {
  let emoteName = target.getAttribute("data-emoteName");
  let searchBar = document.getElementById("emoteSearch");
  searchBar.setAttribute("placeholder", `:${emoteName}:`);
};

setTimeout(() => {
  let elem = new EmoteSelect();
}, 1000);
