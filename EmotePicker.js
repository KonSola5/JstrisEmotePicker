function EmoteSelect(element, emoteIndex, container, openBtn, path) {
  this.inp = element ? element : document.getElementById("ChatInput");
  this.emoteIndex = emoteIndex ? emoteIndex : '/index_v3.json'
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

EmoteSelect.prototype.init = async function () {
  // init basic layout
  this.initializeContainers();
  // add EventListener to emote button
  this.openBtn.addEventListener("click", function (e) {
    hideElem(this.emoteElem);
  });

  this.emoteList =  await fetch(this.emoteIndex).then((res) => res.json());

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
  this.searchBar.addEventListener("input", ()=>{
    this.searchFunction(this.emoteList)
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
  this.groupList = this.emoteList.length > 22 ? [
    "Jstris",
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
  ] : ['Jstris']

  this.createGroups(this.groupList);
};

EmoteSelect.prototype.createGroups = async function (groups) {
  let self = this;
  this.emojis = this.emoteList
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
    self.groupDiv.style.minHeight = `${Math.ceil(grouped.length / 6) * 40}px`;
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
      let source = grouped[i]['u'] ? `https://s.jezevec10.com/${grouped[i]['u']}` : `/out/${grouped[i]["n"]}-2.svg`;
      self.emoteImg.classList.add("emoteImg", "loadingEmote");
      self.emoteImg.onload = function (e) {
        e.target.classList.remove("loadingEmote");
      };
      observer.observe(self.emoteImg)
      self.emoteImg.setAttribute("loading", "lazy");
      self.emoteImg.setAttribute("data-emoteName", `${grouped[i]["n"]}`);
      self.emoteImg.setAttribute("data-source", source);
      self.emoteImg.addEventListener("click", (e) => {
        chatEmote(e.target);
      });
      self.emoteImg.addEventListener("mouseover", (e) => {
        this.showName(e.target);
      });
      self.emotesFragment.appendChild(self.emoteImg);
    }

  target.appendChild(this.emotesFragment);

  function onView(changes,observer){
    setSource(changes,observer)
  }
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
      this.emotesWrapper.scrollTop = topPos;
    });
    // attributes
    this.groupImage.setAttribute("title", `${this.groupList[i]}`);
    if (this.groupList[i] === "Jstris") {
      this.groupImage.setAttribute("src", `${this.groupEmote[i]}`);
    } else {
      this.groupImage.setAttribute("src", `/out/${this.groupEmote[i]}-2.svg`);
    }
    this.selectionDiv.appendChild(this.groupImage);
  }
  this.optionsContainer.appendChild(this.selectionDiv);
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
    keys: ["n","t"],
  };
  let pattern = document.getElementById("emoteSearch").value;

  let searchResults = document.getElementById("searchResults");

  if(!pattern){
    searchResults.parentNode.removeChild(searchResults)
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
    searchResults = document.getElementById('searchResults')
  } else if(searchResults) {
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
    let result = results[i]['item']
    let source = result['u'] ? `https://s.jezevec10.com/${result['u']}` : `/out/${result['n']}-2.svg`
    self.emoteResult = document.createElement("img");
    self.emoteResult.classList.add("emoteImg", "loadingEmote");
    self.emoteResult.setAttribute('data-source',source)
    self.emoteResult.onload = function (e) {
          e.target.classList.remove("loadingEmote");
        };
    self.emoteResult.setAttribute('title',result['n'])
    self.emoteResult.setAttribute('data-emoteName',result['n'])
    self.emoteResult.addEventListener("click", (e) => {
          chatEmote(e.target);
        });
    observer.observe(this.emoteResult)
    self.resultsFragment.appendChild(this.emoteResult);
  }
  // append document fragment to search results div
  searchResults.appendChild(this.resultsFragment);


  function onView(changes,observer){
    setSource(changes,observer)
  }

};

function setSource(changes,observer){
  changes.forEach((change) => {
        if (change.isIntersecting) {
          let source = change.target.getAttribute('data-source')
          change.target.setAttribute('src',source)
          observer.unobserve(change.target);
        }
      });
}

function chatEmote (target) {
  let emoteName = target.getAttribute("data-emoteName");
  let chat = document.getElementById("chatInput");

  chat.value += `:${emoteName}: `;
};

setTimeout(() => {
  let elem = new EmoteSelect();
}, 1000);
