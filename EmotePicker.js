function EmoteSelect(
  element,
  emoteIndex,
  container,
  openBtn,
  path,
  groupsEmote
) {
  this.input = element;
  this.emoteIndex = emoteIndex;
  this.container = container;
  this.openBtn = openBtn;
  this.path = path;
  this.groupEmotes = groupsEmote;
  this.init();
}

EmoteSelect.prototype.init = async function () {
  // init basic layout
  this.emoteElem = document.createElement("div");
  this.emoteElem.classList.add("emotePicker");
  this.container.appendChild(this.emoteElem);
  // shameless plug
  this.comment = document.createComment("Designed and developed by Erickmack");
  this.emoteElem.appendChild(this.comment);
  this.initializeContainers();
  this.emoteList =
    typeof this.emoteIndex === "string"
      ? await fetch(this.emoteIndex).then((res) => res.json())
      : this.emoteIndex;

  this.initializeEmotes();
  this.lastUsed();
  this.openButtonLogic();
};

EmoteSelect.prototype.initializeContainers = function () {
  // create input elem for searching emotes
  this.searchElem = document.createElement("form");
  this.searchElem.classList.add("form-inline", "emoteForm");
  this.emoteElem.appendChild(this.searchElem);
  this.searchBar = document.createElement("input");
  this.searchBar.classList.add("form-control");
  this.searchBar.id = "emoteSearch";
  this.searchBar.addEventListener("input", () => {
    this.searchFunction(this.emoteList);
  });
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
  // Emote groups
  let groups = [];
  this.emoteList.forEach((emote) => {
    let i = groups.findIndex((x) => x === emote["g"]);
    if (i <= -1) {
      groups.push(emote["g"]);
    }
  });
  this.groupList = groups;
  this.createGroups(this.groupList);
};

EmoteSelect.prototype.createGroups = async function (groups) {
  let self = this;
  this.emojis = this.emoteList;
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
    let grouped = this.emojis.filter((emoji) => emoji["g"] === `${group}`);
    self.groupDiv = document.createElement("div");
    self.groupDiv.classList.add("emotesGroup");
    self.groupDiv.id = `${group}`;
    self.groupDiv.setAttribute("data-groupName", `${group}`);
    observer.observe(self.groupDiv);
    self.groupName = document.createElement("h3");
    self.groupName.id = `${group}`;
    self.groupName.classList.add("groupName");
    self.groupName.innerText = `${group.toUpperCase()}`;
    self.groupDiv.appendChild(self.groupName);
    let height = Math.ceil(grouped.length / 6) * 45 + 35.4;
    self.groupDiv.style.minHeight = `${height}px`;
    self.groupsFragment.appendChild(self.groupDiv);
  });
  this.emotesWrapper.appendChild(this.groupsFragment);

  // handler function for intersection observer
  function onView(changes, observer) {
    setTimeout(() => {
      changes.forEach((change) => {
        if (change.isIntersecting) {
          self.createImages(self.emojis, change.target);
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

  // intersection observer for source
  let observerConfig = {
    root: document.getElementById("searchResults"),
    rootMargin: "10px",
    threshold: 0,
  };
  // new intersection observer
  let observer = new IntersectionObserver(onView, observerConfig);

  // document fragment to append emotes
  this.emotesFragment = document.createDocumentFragment();
  let group = target.getAttribute("data-groupName");
  let grouped = emotes.filter((emote) => emote["g"] === `${group}`);
  for (let i = 0; i < grouped.length; i++) {
    self.emoteImg = document.createElement("img");
    let source;
    if (grouped[i]["p"]) {
      source = grouped[i]["p"];
    } else if (grouped[i]["u"]) {
      source = grouped[i]["u"];
    } else {
      source = `${this.path}${grouped[i]["n"]}.svg`;
    }
    self.emoteImg.classList.add("emoteImg", "loadingEmote");
    if (grouped[i]["u"]) {
      self.emoteImg.classList.add("jstrisEmote");
    }
    self.emoteImg.onload = function (e) {
      e.target.classList.remove("loadingEmote");
    };
    observer.observe(self.emoteImg);
    self.emoteImg.setAttribute("data-emoteName", `${grouped[i]["n"]}`);
    self.emoteImg.setAttribute("data-source", source);
    self.emoteImg.addEventListener("click", (e) => {
      this.chatEmote(e.target);
      this.setStoredEmotes(e.target);
      this.hideElem();
    });
    self.emoteImg.addEventListener("mouseover", (e) => {
      this.showName(e.target);
    });
    self.emotesFragment.appendChild(self.emoteImg);
  }

  target.appendChild(this.emotesFragment);

  function onView(changes, observer) {
    self.setSource(changes, observer);
  }
};

EmoteSelect.prototype.selectGroup = function () {
  this.selectionDiv = document.createElement("div");
  this.selectionDiv.id = "selectionDiv";
  this.groupList.forEach((group) => {
    this.groupImage = document.createElement("img");
    this.groupImage.classList.add("groupLink");
    this.groupImage.setAttribute("data-groupName", `${group}`);
    // scrolling action
    this.groupImage.addEventListener("click", (e) => {
      let groupName = e.target.getAttribute("data-groupname");
      let elem = document.getElementById(groupName);
      let offsetHeight = this.searchElem.clientHeight;
      let topPos = elem.offsetTop - offsetHeight;
      this.emotesWrapper.scrollTop = topPos;
    });
    // attributes
    this.groupImage.setAttribute("title", `${group}`);
    this.groupImage.setAttribute("data-toggle", "tooltip");
    this.groupImage.setAttribute("data-placement", "right");
    let filtered = this.emoteList.filter(
      (emote) => emote["n"] === this.groupEmotes[group]
    );
    if (filtered.length <= 0) {
      this.groupImage.setAttribute("src", `${this.groupEmotes[group]}`);
      this.groupImage.classList.add("jstrisSelector");
    } else if (!filtered["u"]) {
      this.groupImage.setAttribute(
        "src",
        `${this.path}${this.groupEmotes[group]}.svg`
      );
    }
    this.selectionDiv.appendChild(this.groupImage);
  });
  this.optionsContainer.appendChild(this.selectionDiv);
  $('[data-toggle="tooltip"]').tooltip();
};

EmoteSelect.prototype.showName = function (target) {
  let emoteName = target.getAttribute("data-emoteName");
  let searchBar = document.getElementById("emoteSearch");
  searchBar.setAttribute("placeholder", `:${emoteName}:`);
};

EmoteSelect.prototype.searchFunction = function (list) {
  let self = this;
  let options = {
    threshold: 0.3,
    keys: [
      {
        name: "n",
        weight: 2,
      },
      {
        name: "t",
        weight: 1,
      },
    ],
  };
  let pattern = document.getElementById("emoteSearch").value;
  let searchResults = document.getElementById("searchResults");

  if (!pattern && searchResults != null) {
    searchResults.parentNode.removeChild(searchResults);
  }
  const fuse = new Fuse(list, options);
  let results = fuse.search(pattern);

  // check if div doesn't exist
  if (!searchResults) {
    this.searchResults = document.createElement("div");
    this.searchResults.id = "searchResults";
    document
      .getElementsByClassName("emotePicker")[0]
      .appendChild(this.searchResults);
    searchResults = document.getElementById("searchResults");
  } else if (searchResults) {
    searchResults.innerHTML = "";
  }

  let observerConfig = {
    root: document.getElementById("searchResults"),
    rootMargin: "10px",
    threshold: 0,
  };
  // new intersection observer
  let observer = new IntersectionObserver(onView, observerConfig);

  // create document fragment
  self.resultsFragment = document.createDocumentFragment();
  for (let i = 0; i < results.length; i++) {
    let result = results[i]["item"];
    let source = result["u"]
      ? `${result["u"]}`
      : `${this.path}${result["n"]}.svg`;
    self.emoteResult = document.createElement("img");
    self.emoteResult.classList.add("emoteImg", "loadingEmote", "resultImg");
    self.emoteResult.setAttribute("data-source", source);
    self.emoteResult.onload = function (e) {
      e.target.classList.remove("loadingEmote");
    };
    self.emoteResult.setAttribute("title", result["n"]);
    self.emoteResult.setAttribute("data-emoteName", result["n"]);
    self.emoteResult.addEventListener("click", (e) => {
      this.chatEmote(e.target);
      this.setStoredEmotes(e.target);
      this.hideElem();
    });
    observer.observe(this.emoteResult);
    self.resultsFragment.appendChild(this.emoteResult);
  }
  // append document fragment to search results div
  searchResults.appendChild(this.resultsFragment);
  function onView(changes, observer) {
    self.setSource(changes, observer);
  }
};

EmoteSelect.prototype.setSource = function (changes, observer) {
  setTimeout(() => {
    changes.forEach((change) => {
      if (change.isIntersecting) {
        let source = change.target.getAttribute("data-source");
        change.target.setAttribute("src", source);
        observer.unobserve(change.target);
      }
    });
  }, 400);
};

EmoteSelect.prototype.chatEmote = function (target) {
  let emoteName = target.getAttribute("data-emoteName");
  let origText = this.input.value;
  let pos = this.getCaretPosition();
  this.input.value =
    origText.substring(0, pos) +
    `:${emoteName}: ` +
    origText.substring(pos, origText.length);
  this.input.focus();
  this.setCaretPosition(pos + emoteName.length + 3);
};

EmoteSelect.prototype.getCaretPosition = function () {
  if (this.input.selectionStart || this.input.selectionStart == "0") {
    return this.input.selectionStart;
  } else {
    return this.input.value.length; // No support
  }
};

EmoteSelect.prototype.setCaretPosition = function (pos) {
  pos = Math.max(Math.min(pos, this.input.value.length), 0);
  if (this.input.setSelectionRange) {
    this.input.setSelectionRange(pos, pos);
  }
};

EmoteSelect.prototype.lastUsed = function () {
  // localstorage logic
  if (typeof Storage !== "undefined") {
    if (!localStorage.lastUsed) {
      let date = Math.floor(Date.now() / 1000);
      let emotes = [{ Badger: date }, { jstris: date }];
      localStorage.setItem("lastUsed", JSON.stringify(emotes));
    }
  }
  // create and add recently used div
  // get divs
  let parent = this.emotesWrapper;
  let jstris = document.getElementById("Jstris");
  // create recently used div
  this.recent = document.createElement("div");
  this.recent.classList.add("emotesGroup");
  this.groupName = document.createElement("h3");
  this.groupName.classList.add("groupName");
  this.lastUsedWrapper = document.createElement("div");
  this.lastUsedWrapper.id = "usedWrapper";
  this.groupName.id = "recently-used";
  this.groupName.innerText = "RECENTLY USED";
  this.recent.appendChild(this.groupName);
  this.recent.appendChild(this.lastUsedWrapper);
  // insert div before other groups
  parent.insertBefore(this.recent, jstris);
  // create and add recently used group link
  //get divs
  let select = this.selectionDiv;
  let link = document.getElementsByClassName("groupLink")[0];
  // create group link
  this.groupLink = document.createElement("img");
  this.groupLink.classList.add("groupLink");
  this.groupLink.setAttribute("data-groupName", "recently-used");
  this.groupLink.setAttribute("title", "Recently used");
  this.groupLink.setAttribute("data-toggle", "tooltip");
  this.groupLink.setAttribute("data-placement", "right");
  this.groupLink.setAttribute("src", `${this.path}three_oclock.svg`);
  // add event listener
  this.groupLink.addEventListener("click", (e) => {
    let group = e.target.getAttribute("data-groupname");
    let elem = document.getElementById(group);
    let topPos = elem.offsetTop - 60;
    this.emotesWrapper.scrollTop = topPos;
  });
  // add group link
  select.insertBefore(this.groupLink, link);
  $('[data-toggle="tooltip"]').tooltip();
};

EmoteSelect.prototype.updateLastUsed = function () {
  // clear images
  let emotesContainer = document.getElementById("usedWrapper");
  emotesContainer.innerHTML = "";
  // get emote list and emotes in local storage
  let emoteList = this.emoteList;
  let used = JSON.parse(localStorage.getItem("lastUsed"));
  // create fragment to append images
  let usedFragment = document.createDocumentFragment();
  // loop through stored emotes
  let pattern;
  let source;
  used.forEach((emote) => {
    pattern = Object.keys(emote)[0];
    let result = emoteList.filter((emote) => {
      return emote["n"] === pattern;
    })[0];
    if (result) {
      if (result.p) {
        source = result.p;
      } else if (result.u) {
        source = result.u;
      } else {
        source = `${this.path}${result["n"]}.svg`;
      }
      this.usedImage = document.createElement("img");
      this.usedImage.setAttribute("src", source);
      this.usedImage.setAttribute("data-emoteName", result["n"]);
      this.usedImage.classList.add("emoteImg");
      if (result["u"]) {
        this.usedImage.classList.add("jstrisEmote");
      }
      this.usedImage.addEventListener("click", (e) => {
        this.chatEmote(e.target);
        this.setStoredEmotes(e.target);
        this.hideElem();
      });
      this.usedImage.addEventListener("mouseover", (e) => {
        this.showName(e.target);
      });
      usedFragment.appendChild(this.usedImage);
    }
  });
  emotesContainer.appendChild(usedFragment);
};

EmoteSelect.prototype.setStoredEmotes = function (target) {
  const MAX_LENGTH_EMOTES = 30;
  let emotes = JSON.parse(localStorage.getItem("lastUsed"));
  let updatedEmotes;
  let emoteName = target.getAttribute("data-emoteName");
  if (emotes.length === MAX_LENGTH_EMOTES) {
    // check if emote exists
    let exists = false;
    let i = 0;
    for (let emote of emotes) {
      i += 1;
      if (emoteName in emote) {
        updatedEmotes = emotes.filter((emote) => emote[emoteName] === emotes[i][emoteName])
        let newestEmote = { [emoteName]: Math.floor(Date.now() / 1000) };
        updatedEmotes.push(newestEmote)
        exists = true;
        break;
      }
    }
    if (!exists) {
      let oldestTime = emotes[0][Object.keys(emotes[0])[0]];
      let oldestEmote = emotes[0];
      for (let emote of emotes) {
        let key = Object.keys(emote)[0];
        if (emote[key] < oldestTime) {
          oldestTime = emote[key];
          oldestEmote = emote;
        }
      }
      updatedEmotes = emotes.filter((emote) => emote !== oldestEmote);
      let newestEmote = { [emoteName]: Math.floor(Date.now() / 1000) };
      updatedEmotes.push(newestEmote);
    }
  } else if (emotes.length < 30) {
    // check if emote exists
    let exists = false;
    let i = 0;
    for (let emote of emotes) {
      if (emoteName in emote) {
        updatedEmotes = emotes.filter((emote) => emote[emoteName] !== emotes[i][emoteName])
        let newestEmote = { [emoteName]: Math.floor(Date.now() / 1000) };
        updatedEmotes.push(newestEmote)
        exists = true;
        break;
      }
      i += 1;
    }
    if (!exists) {
      let newestEmote = { [emoteName]: Math.floor(Date.now() / 1000) };
      updatedEmotes = emotes;
      updatedEmotes.push(newestEmote);
    }
  }
  // sort emotes and set them to local storage
    let sortedEmotes = updatedEmotes.sort((a, b) => {
      return b[Object.keys(b)[0]] - a[Object.keys(a)[0]];
    });
    //console.log(emotes)
    localStorage.lastUsed = JSON.stringify(sortedEmotes);
};

EmoteSelect.prototype.hideElem = function () {
  this.emotesWrapper.scrollTo(0, 0);
  this.selectionDiv.scrollTo(0, 0);
 // this.emoteElem.classList.toggle("open");
};

EmoteSelect.prototype.openButtonLogic = function () {
  let searchBar = document.getElementById("emoteSearch");
  this.openBtn.addEventListener("click", () => {
    searchBar.value = "";
    let searchDiv = document.getElementById("searchResults");
    if (searchDiv !== null) {
      searchDiv.parentNode.removeChild(searchDiv);
    }
    this.emotesWrapper.scrollTo(0, 0);
    this.selectionDiv.scrollTo(0, 0);
    this.updateLastUsed();
    this.emoteElem.classList.toggle("open");
  });
  if (!document.getElementById("fuseScript")) {
    let script = document.createElement("script");
    script.id = "fuseScript";
    script.src = "https://cdn.jsdelivr.net/npm/fuse.js@6.4.3";
    document.head.appendChild(script);
  }
};
