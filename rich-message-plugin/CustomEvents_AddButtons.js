/**
 * Last edited: 18.03.2022 12h
 */
(function (window) {
  if (!window.embedded_svc || !window.embedded_svc.liveAgentAPI) {
    return;
  }

  var viewPortTag = document.createElement("meta");
  viewPortTag.name = "viewport";
  viewPortTag.content =
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
  document.getElementsByTagName("head")[0].appendChild(viewPortTag);

  // set timer and check if message list rendered and find loader in last element and hide
  let messageWrapperTimerId = setInterval(() => {
    const messageWrapper = document.querySelectorAll(
      ".messageWrapper li.chatMessage.agent"
    );

    if (messageWrapper.length) {
      const lastElement = messageWrapper[messageWrapper.length - 1];
      const loaderElement = lastElement.querySelector(".loader");

      loaderElement?.classList.add("hidden");
      lastElement.classList.add("visible");
      clearInterval(messageWrapperTimerId);
    }
  }, 1000);

  var IS_VERSION_1 = "isVersion1";
  var IS_VERSION_2 = "isVersion2";
  var IS_VERSION_3 = "isVersion3";
  var IS_WEBVIEW_VERSION = "isWebviewVersion";

  var VERSION_1_KEY = "&&version1&&";
  var VERSION_2_KEY = "&&version2&&";
  var VERSION_3_KEY = "&&version3&&";

  var PENDING_BUTTONS_KEY = "ultimate_pending_buttons";
  var PENDING_CAROUSELS_KEY = "ultimate_pending_carousels";
  var PENDING_CAROUSEL_TITLE = "ultimate_pending_title";
  var PENDING_MESSAGE = "ultimate_pending_agent_message";
  var PENDING_MESSAGES_COUNT = "ultimate_pending_messages_count";
  var MESSAGES_COUNT = 0;

  var ADD_BUTTONS_EVENT = "add_buttons";
  var BUTTON_CLICK_EVENT = "button_click";
  var ADD_CAROUSEL_EVENT = "add_carousel";
  var TYPE_BUTTONS = "AddButtons";
  var TYPE_CAROUSEL = "AddCarousel";
  var TYPE_CARD = "AddCard";
  var CUSTOM_ELEMENTS_EVENT = "custom_elements_event";
  var CUSTOM_ELEMENTS_KEY = "ultimate_custom_elements";
  var CUSTOM_ELEMENTS_DATA = {};
  var DEBOUNCE_TIME_STAMP = 0;
  var TAB_ID = String(Date.now());

  var slideWidth = 220 + 12; // slider cards (width + margin)

  // set timer and check if message list rendered and find loader in last element and hide

  // Polyfill Element.closest()
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
  }
  if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
      var el = this;
      do {
        if (Element.prototype.matches.call(el, s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }

  function getVersion(message) {
    var value = "";
    let webviewPattern = /&&webview:https?:\/\/[^&]*&&/;

    if (message.includes(VERSION_1_KEY)) {
      value = IS_VERSION_1;
    } else if (message.includes(VERSION_2_KEY)) {
      value = IS_VERSION_2;
    } else if (message.includes(VERSION_3_KEY)) {
      value = IS_VERSION_3;
    } else if (webviewPattern.test(message)) {
      value = IS_WEBVIEW_VERSION;
    }
    return value;
  }

  function getElementIndex(el) {
    var index = 0;
    while ((el = el.previousElementSibling)) {
      index++;
    }
    return index;
  }

  (function setupCustomButtonSnapIn(liveAgentAPI) {
    function createCustomButtonElements(
      initialData,
      wrapper,
      rating,
      container
    ) {
      if (rating) {
        var lastButtonElement = initialData.pop();
        var starsBlock = createEl("div", { class: "starsBlock" }, rating);
        createEl(
          "input",
          {
            class: "rating__input rating__input--none",
            name: "rating3",
            id: "rating3-none",
            value: "0",
            type: "radio",
            disabled: "disabled",
            checked: "checked"
          },
          starsBlock
        );

        initialData.forEach(({ text }, index) => {
          var specialId = Date.now();
          var starLabel = createEl(
            "label",
            {
              class: "rating__label",
              ariaLabel: ` ${index + specialId}star`,
              for: `rating${index + specialId}`
            },
            starsBlock
          );

          const starIcon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          const starPath = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );

          starIcon.setAttribute("fill", "none");
          starIcon.setAttribute("width", "36");
          starIcon.setAttribute("height", "33");
          starIcon.setAttribute("viewBox", "0 0 36 33");

          starPath.setAttribute(
            "d",
            "M18 0L22.0413 12.4377H35.119L24.5389 20.1246L28.5801 32.5623L18 24.8754L7.41987 32.5623L11.4611 20.1246L0.880983 12.4377H13.9587L18 0Z"
          );
          starPath.setAttribute("fill", "#000000");
          starIcon.appendChild(starPath);

          starLabel.appendChild(starIcon);

          createEl(
            "input",
            {
              class: "rating__input",
              name: "rating3",
              id: `rating${index + specialId}`,
              type: "radio",
              value: "1"
            },
            starsBlock
          );

          starLabel.addEventListener("click", () =>
            customOnButtonClick(container, "", text)
          );
        });

        var buttonElement = createEl(
          "button",
          { class: "btn-version3" },
          wrapper
        );
        buttonElement.innerHTML = lastButtonElement.text;

        buttonElement.addEventListener("click", () =>
          customOnButtonClick(container, "", lastButtonElement.text)
        );
      } else {
        initialData.forEach(({ text, link }) => {
          var buttonElement = createEl(
            "button",
            { class: "btn-version1" },
            wrapper
          );

          if (link && initialData.length === 1) {
            buttonElement.classList.add("btn-version2");

            const linkElement = createEl(
              "span",
              { class: "button-v2-link" },
              buttonElement
            );
            linkElement.innerHTML = text;

            const noteBlock = createEl(
              "div",
              { class: "button-v2-note-block" },
              container
            );

            const noteText = createEl(
              "span",
              { class: "button-v2-note-text" },
              noteBlock
            );
            noteText.innerHTML =
              "Note: This page will open in a new browser tab";
          } else {
            buttonElement.innerHTML = text;
          }

          buttonElement.addEventListener("click", () =>
            customOnButtonClick(container, link, text)
          );
        });
      }
    }

    function addChatButtonsDefault(chatButtons, index, title) {
      var buttonContainer = createEl("div", {
        class: "ultimate-btn-container ultimate-hidden version-custom-button"
      });

      var info = createEl("div", { class: "info" }, buttonContainer);
      info.innerHTML = title;

      var buttonsWrapper = createEl(
        "div",
        { class: "buttons-wrapper buttons-wrapper-default" },
        buttonContainer
      );

      createCustomButtonElements(
        chatButtons,
        buttonsWrapper,
        undefined,
        buttonContainer
      );
      addElementToMessageArea(
        buttonContainer,
        TYPE_BUTTONS,
        chatButtons,
        index,
        true
      );
    }

    function addChatButtonsVersion1(chatButtons, index, title) {
      var buttonContainer = createEl("div", {
        class: "ultimate-btn-container ultimate-hidden version-custom-button"
      });

      var info = createEl("div", { class: "info" }, buttonContainer);
      info.innerHTML = title || "";

      var buttonsWrapper = createEl(
        "div",
        { class: "buttons-wrapper buttons-wrapper-v1" },
        buttonContainer
      );

      createCustomButtonElements(
        chatButtons,
        buttonsWrapper,
        undefined,
        buttonContainer
      );
      addElementToMessageArea(
        buttonContainer,
        TYPE_BUTTONS,
        chatButtons,
        index,
        true
      );
    }

    function addChatButtonsVersion3(chatButtons, index, title) {
      var buttonContainer = createEl("div", {
        class: "ultimate-btn-container ultimate-hidden version-custom-button"
      });

      var info = createEl("div", { class: "info" }, buttonContainer);
      var rating = createEl("div", { class: "rating-group" }, buttonContainer);
      var buttonsWrapper = createEl(
        "div",
        { class: "buttons-wrapper buttons-wrapper-v3" },
        buttonContainer
      );

      info.innerHTML = title || "";

      createCustomButtonElements(
        chatButtons,
        buttonsWrapper,
        rating,
        buttonContainer
      );
      addElementToMessageArea(
        buttonContainer,
        TYPE_BUTTONS,
        chatButtons,
        index,
        true
      );
    }

    var isMainTab =
      liveAgentAPI &&
      liveAgentAPI.browserSessionInfo &&
      liveAgentAPI.browserSessionInfo.isPrimary;
    var sessionId =
      liveAgentAPI && liveAgentAPI.connection && liveAgentAPI.connection.sid;

    function onCustomData(data, type, title) {
      if (Date.now() - DEBOUNCE_TIME_STAMP < 100) {
        console.error("Event debounced", data);
        return;
      }
      DEBOUNCE_TIME_STAMP = Date.now();
      try {
        const messagesList = document.querySelectorAll(
          ".messageWrapper li.chatMessage.agent"
        );
        const lastMessageItem = messagesList[messagesList.length - 1];
        if (lastMessageItem) {
          lastMessageItem
            .querySelector(".chatContent")
            ?.classList.add("custom-item");
        }
        var eventData = JSON.parse(data);
        if (type === TYPE_BUTTONS) {
          var version = getVersion(eventData.message || "");
          const titleMessage = eventData.message;

          var buttonsRenderers = {
            [IS_VERSION_1]: () =>
              addChatButtonsVersion1(
                eventData.chatButtons,
                undefined,
                titleMessage.replace(VERSION_1_KEY, "")
              ),
            [IS_VERSION_3]: () =>
              addChatButtonsVersion3(
                eventData.chatButtons,
                undefined,
                titleMessage.replace(VERSION_3_KEY, "")
              ),
            default: () =>
              addChatButtonsDefault(
                eventData.chatButtons,
                undefined,
                titleMessage
              )
          };

          buttonsRenderers[version || "default"]();
        } else if (type === TYPE_CAROUSEL) {
          var version = getVersion(eventData.cards[0].title);

          let carouselMesasge = "";
          const messagesList = document.querySelectorAll(
            ".messageWrapper li.chatMessage.agent"
          );
          const lastMessageItem = messagesList[messagesList.length - 1];
          if (lastMessageItem) {
            // Take massage from last chat bot message and put to carousel title
            carouselMesasge =
              lastMessageItem.getElementsByTagName("span")[0]?.innerHTML;

            if (title) {
              carouselMesasge = title;
            }

            if (eventData.cards.length >= 1) {
              var carouselsRenderers = {
                [IS_VERSION_1]: () =>
                  addChatCustomCarousel(1, eventData, carouselMesasge),
                [IS_VERSION_2]: () =>
                  addChatCustomCarousel(2, eventData, carouselMesasge),
                [IS_VERSION_3]: () =>
                  addChatCustomCarousel(3, eventData, carouselMesasge),
                default: () => addChatCarouselDefault(eventData)
              };
              carouselsRenderers[version || "default"]();
            } else {
              addChatCard(eventData.cards[0]);
            }
            lastMessageItem
              .querySelector(".nameAndTimeContent")
              .classList.add("hidden");
            lastMessageItem
              .querySelector(".embeddedServiceLiveAgentStateChatAvatar")
              .classList.add("hidden");
          }
        }
      } catch (err) {
        console.log(err, "err");
        console.error("Failed to parse event data", data);
      }
    }

    function onClickButtonElement(buttonLink, buttonText, cardIndex) {
      if (buttonLink) {
        var newWindow = window.open(buttonLink, "_blank");
        newWindow.focus();
        clearPending();
        return;
      }
      var serializedData = JSON.stringify({
        text: buttonText,
        cardIndex: cardIndex
      });

      onButtonClickInAnyTab(serializedData);
    }

    function addButtonToContainer(container, button, cardIndex) {
      var buttonText = button.text;
      var buttonLink = button.link;
      var buttonElement = createEl("button", {}, container);
      var buttonClass = "ultimate-btn";
      if (buttonLink) {
        buttonClass += " ultimate-btn-link";
        var buttonLinkSvg = createEl(
          "svg",
          {
            viewBox: "0 0 19 18"
          },
          buttonElement,
          true
        );
        createEl(
          "path",
          {
            fill: "#757575",
            d: "M2.5 2V16H16.5V9H18.5V16C18.5 17.1 17.6 18 16.5 18H2.5C1.39 18 0.5 17.1 0.5 16V2C0.5 0.9 1.39 0 2.5 0H9.5V2H2.5ZM11.5 2V0H18.5V7H16.5V3.41L6.67 13.24L5.26 11.83L15.09 2H11.5Z"
          },
          buttonLinkSvg,
          true
        );
      }
      var buttonTextEl = createEl("span", {}, buttonElement);
      buttonTextEl.innerHTML = buttonText;
      buttonElement.setAttribute("class", buttonClass);
      buttonElement.addEventListener("click", function () {
        var element = buttonElement.closest("div.messageArea ul li");
        var lastButtonActive = element.querySelector(".ultimate-btn-active");
        if (lastButtonActive) {
          lastButtonActive.classList.remove("ultimate-btn-active");
        }
        buttonElement.classList.add("ultimate-btn-active");

        var elementIndex = getElementIndex(element);

        if (CUSTOM_ELEMENTS_DATA[elementIndex]) {
          CUSTOM_ELEMENTS_DATA[elementIndex].activeCard = cardIndex;
          CUSTOM_ELEMENTS_DATA[elementIndex].activeButton =
            getElementIndex(buttonElement);
          localStorage.setItem(
            CUSTOM_ELEMENTS_KEY,
            JSON.stringify(CUSTOM_ELEMENTS_DATA)
          );
          broadcastStorageEvent(
            CUSTOM_ELEMENTS_EVENT,
            JSON.stringify({ index: elementIndex })
          );
          if (
            CUSTOM_ELEMENTS_DATA[elementIndex].type === TYPE_BUTTONS &&
            !buttonLink
          ) {
            buttonElement
              .closest(".ultimate-btn-container")
              .classList.add("ultimate-hidden");
            setTimeout(function () {
              onClickButtonElement(buttonLink, buttonText, cardIndex);
            }, 500);
          } else {
            onClickButtonElement(buttonLink, buttonText, cardIndex);
          }
        }
      });
    }

    function addCardToContainer(container, card, cardIndex) {
      var cardElement = createEl(
        "div",
        {
          class: "ultimate-card"
        },
        container
      );
      if (card.imageUrl) {
        createEl(
          "img",
          {
            src: card.imageUrl
          },
          cardElement
        );
      }
      if (card.title) {
        var cardTitle = createEl("h3", {}, cardElement);
        cardTitle.innerText = card.title;
      }
      if (card.description) {
        var cardDescription = createEl("p", {}, cardElement);
        cardDescription.innerText = card.description;
      }
      if (card.buttons && Array.isArray(card.buttons)) {
        var cardButtons = createEl(
          "div",
          {
            class: "ultimate-card-buttons"
          },
          cardElement
        );
        for (var i = 0; i < card.buttons.length; ++i) {
          addButtonToContainer(cardButtons, card.buttons[i], cardIndex);
        }
      }
    }

    function addElementToMessageArea(
      element,
      type,
      data,
      index,
      isVersionElement
    ) {
      var messageArea = document.querySelector("div.messageArea");
      if (messageArea) {
        var messageList = messageArea.querySelector("ul");
        if (messageList) {
          // var isIndexLast = type === TYPE_BUTTONS || typeof index === 'undefined'
          var isIndexLast = typeof index === "undefined";

          var elementIndex = isIndexLast
            ? messageList.children.length
            : parseInt(index);
          element.setAttribute("data-element-index", elementIndex);

          if (data && isIndexLast) {
            CUSTOM_ELEMENTS_DATA[elementIndex] = {
              type: type,
              data: data,
              currentCard: 0,
              activeCard: 0,
              activeButton: -1
            };
            localStorage.setItem(
              CUSTOM_ELEMENTS_KEY,
              JSON.stringify(CUSTOM_ELEMENTS_DATA)
            );
          }

          if (messageList.children.length === elementIndex) {
            if (isVersionElement) {
              var lastMessageItem =
                messageList.children[messageList.children.length - 1];
              if (lastMessageItem) {
                var contentWrapper =
                  lastMessageItem.querySelector(".chatContent");
                contentWrapper.classList.add("chatContent-custom-element");
                if (contentWrapper.children.length) {
                  contentWrapper.removeChild(contentWrapper.children[0]);
                }

                contentWrapper.appendChild(element);
                lastMessageItem
                  .querySelector(".loader")
                  ?.classList.add("hidden");
              }
            } else {
              messageList.appendChild(element);
            }
            var observer = new MutationObserver(function (
              mutationsList,
              observer
            ) {
              var elementIndex = parseInt(element.dataset.elementIndex);
              if (getElementIndex(element) !== elementIndex) {
                observer.disconnect();
                var markerElement =
                  element.parentNode &&
                  element.parentNode.children[elementIndex - 1];
                if (markerElement) {
                  markerElement.insertAdjacentElement("afterend", element);
                }
              }
            });
            observer.observe(messageArea, { childList: true, subtree: true });
          } else {
            messageList.children[elementIndex - 1].insertAdjacentElement(
              "afterend",
              element
            );
          }

          var elementData = CUSTOM_ELEMENTS_DATA[elementIndex];
          var buttonContainer = element;

          if (type === TYPE_CAROUSEL) {
            buttonContainer =
              buttonContainer.querySelectorAll(".ultimate-card")[
                elementData.activeCard
              ];
            var carousel = element.children[0];
            setTimeout(function () {
              carousel.dataset.currentIndex = elementData.currentCard;
              updateSlider(carousel, true);
            });
          }

          if (parseInt(elementData.activeButton) >= 0) {
            buttonContainer
              .querySelectorAll("button")
              [elementData.activeButton].classList.add("ultimate-btn-active");
          }

          setTimeout(function () {
            messageArea.scrollTop = messageArea.scrollHeight;
            element.classList.remove("ultimate-hidden");
          });
        }
      }
    }

    function createEl(tag, attrs, parent, isSvg) {
      var xmlns = "http://www.w3.org/2000/svg";
      var el = isSvg
        ? document.createElementNS(xmlns, tag)
        : document.createElement(tag);
      for (var attrName in attrs) {
        if (attrs.hasOwnProperty(attrName)) {
          el.setAttribute(attrName, attrs[attrName]);
        }
      }
      if (parent) {
        parent.appendChild(el);
      }
      return el;
    }

    function dragStart(event) {
      var e = event || window.event;
      var carousel = e.target.closest(".ultimate-carousel");
      var busy = parseInt(carousel.dataset.busy);
      if (!busy && e.target.tagName !== "BUTTON") {
        var x1 = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
        var y1 = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
        carousel.dataset.x1 = x1;
        carousel.dataset.x2 = x1;
        carousel.dataset.y1 = y1;
        carousel.dataset.y2 = y1;
      }
    }

    function dragMove(event) {
      var e = event || window.event;
      var carousel = e.target.closest(".ultimate-carousel");
      var busy = parseInt(carousel.dataset.busy);
      var x1 = parseInt(carousel.dataset.x1);
      var x2 = e.type == "touchmove" ? e.touches[0].clientX : e.clientX;
      var y1 = parseInt(carousel.dataset.y1);
      var y2 = e.type == "touchmove" ? e.touches[0].clientY : e.clientY;
      var shouldMoveSlider = busy && x1 && y1;
      if (!busy && x1 && y1) {
        var movingVertically =
          Math.abs(Math.abs(x2) - Math.abs(x1)) <
          Math.abs(Math.abs(y2) - Math.abs(y1));
        if (!movingVertically) {
          shouldMoveSlider = true;
        }
      }
      if (shouldMoveSlider) {
        var busyTimer = parseInt(carousel.dataset.busyTimer);
        if (busyTimer) clearTimeout(busyTimer);
        carousel.dataset.busy = 1;
        carousel.dataset.x2 = x2;
        var carouselTrack = carousel.querySelector(".ultimate-carousel-track");
        var currentIndex = parseInt(carousel.dataset.currentIndex);
        var itemsLength = parseInt(carousel.dataset.itemsLength);
        var xDelta = x1 - x2;
        if (
          (x1 < x2 && currentIndex === 0) ||
          (x1 > x2 && currentIndex === itemsLength - 1)
        ) {
          xDelta = xDelta / 3;
        }
        carouselTrack.style =
          "transform: translate3d(" +
          (slideWidth * -currentIndex - xDelta) +
          "px, 0, 0); transition: none;";
      } else {
        carousel.dataset.x1 = 0;
        carousel.dataset.x2 = 0;
        carousel.dataset.y1 = 0;
        carousel.dataset.y2 = 0;
      }
    }

    function dragEnd(event) {
      var e = event || window.event;
      var carousel = e.target.closest(".ultimate-carousel");
      var busy = parseInt(carousel.dataset.busy);
      var x1 = parseInt(carousel.dataset.x1);
      var x2 = parseInt(carousel.dataset.x2);
      if (busy && x1 && x2) {
        var currentIndex = parseInt(carousel.dataset.currentIndex);
        var itemsLength = parseInt(carousel.dataset.itemsLength);
        carousel.dataset.busy = 0;
        carousel.dataset.x1 = 0;
        carousel.dataset.x2 = 0;
        carousel.dataset.y1 = 0;
        carousel.dataset.y2 = 0;
        var keepCurrentIndex = true;
        if (Math.abs(x1 - x2) > slideWidth / 3) {
          if (x1 < x2) {
            if (currentIndex - 1 >= 0) {
              prevSlider({
                target: carousel.querySelector(".ultimate-carousel-list")
              });
              keepCurrentIndex = false;
            }
          } else {
            if (currentIndex + 1 < itemsLength) {
              nextSlider({
                target: carousel.querySelector(".ultimate-carousel-list")
              });
              keepCurrentIndex = false;
            }
          }
        }
        if (keepCurrentIndex) {
          updateSlider(carousel);
        }
      } else {
        carousel.dataset.x1 = 0;
        carousel.dataset.x2 = 0;
        carousel.dataset.y1 = 0;
        carousel.dataset.y2 = 0;
      }
    }

    function updateSlider(carousel, noAnimate) {
      var currentIndex = parseInt(carousel.dataset.currentIndex);
      carousel.dataset.currentIndex = currentIndex + 1;
      prevSlider({
        target: carousel.querySelector(".ultimate-carousel-list"),
        noAnimate: noAnimate
      });
    }

    function moveSlider(buttonEl, isPrev, noAnimate, targetIndex) {
      var carousel = buttonEl.parentNode;

      var slideCicles = carousel.querySelector(".dotsContainer");

      var carouselTrack = carousel.querySelector(".ultimate-carousel-track");
      var currentIndex = parseInt(carousel.dataset.currentIndex);
      var itemsLength = parseInt(carousel.dataset.itemsLength);
      var busy = parseInt(carousel.dataset.busy);
      var busyTimer = parseInt(carousel.dataset.busyTimer);
      if (targetIndex || targetIndex === 0) {
        var goToIndex = isPrev ? currentIndex - 1 : targetIndex;
      } else {
        var goToIndex = isPrev ? currentIndex - 1 : currentIndex + 1;
      }

      if (slideCicles) {
        for (let i = 0; i < slideCicles.children.length; i++) {
          slideCicles.children[i].className = "";
          if (i === goToIndex) {
            slideCicles.children[i].className = "active";
          }
        }
      }

      if (!busy && goToIndex >= 0 && goToIndex < itemsLength) {
        carousel.dataset.busy = 1;
        carousel.dataset.currentIndex = goToIndex;
        carouselTrack.style =
          "transform: translate3d(" +
          slideWidth * -goToIndex +
          "px, 0, 0);" +
          (noAnimate ? " transition: none;" : "");
        var carouselPrev = carousel.querySelector(".ultimate-carousel-prev");
        var carouselNext = carousel.querySelector(".ultimate-carousel-next");

        if (carouselNext && carouselPrev) {
          if (goToIndex === 0) {
            carouselPrev.classList.add("disabled");
          } else {
            carouselPrev.classList.remove("disabled");
          }
          if (goToIndex === itemsLength - 1) {
            carouselNext.classList.add("disabled");
          } else {
            carouselNext.classList.remove("disabled");
          }
        }

        if (busyTimer) clearTimeout(busyTimer);
        carousel.dataset.busyTimer = busyTimer;
        carousel.dataset.busy = 0;

        var elementIndex = parseInt(carousel.parentNode.dataset.elementIndex);
        if (
          parseInt(CUSTOM_ELEMENTS_DATA[elementIndex].currentCard) !== goToIndex
        ) {
          CUSTOM_ELEMENTS_DATA[elementIndex].currentCard = goToIndex;
          localStorage.setItem(
            CUSTOM_ELEMENTS_KEY,
            JSON.stringify(CUSTOM_ELEMENTS_DATA)
          );
          broadcastStorageEvent(
            CUSTOM_ELEMENTS_EVENT,
            JSON.stringify({ index: elementIndex })
          );
        }
      }
    }

    function prevSlider(event) {
      moveSlider(event.target, true, undefined, undefined);
    }

    function nextSlider(event) {
      moveSlider(event.target, false, undefined, undefined);
    }

    function addChatCard(card, index) {
      try {
        var cardContainer = createEl("li", {
          class: "ultimate-card-container ultimate-hidden"
        });
        addCardToContainer(cardContainer, card, 0);
        addElementToMessageArea(cardContainer, TYPE_CARD, card, index);
      } catch (err) {
        console.error("Failed to add card element to the DOM");
        console.error(err);
      }
    }

    function customOnButtonClick(container, link, text) {
      const isDisabled =
        container.querySelector(".button-disabled") ||
        container.querySelector(".star-disabled");
      if (isDisabled) {
        return;
      } else {
        onClickButtonElement(link, text, undefined);

        var starsListNodes = Object.values(container.querySelectorAll("label"));
        const buttonsListNodes = container.querySelectorAll("button");

        const size = text;
        const choosenStars = [];

        for (let i = 0; i < Math.ceil(starsListNodes.length / size); i++) {
          choosenStars[i] = starsListNodes.slice(i * size, i * size + size);
        }

        if (choosenStars.length > 1) {
          for (var i = 0; i < choosenStars[0].length; ++i) {
            choosenStars[0][i].classList.add("star-disabled");
          }

          for (var i = 0; i < choosenStars[1].length; ++i) {
            choosenStars[1][i].classList.add("star-remaining");
          }
        } else if (choosenStars.length) {
          for (var i = 0; i < choosenStars[0].length; ++i) {
            choosenStars[0][i].classList.add("star-disabled");
          }
        } else {
          for (var i = 0; i < starsListNodes.length; ++i) {
            starsListNodes[i].classList.add("star-remaining");
          }
        }

        for (var i = 0; i < buttonsListNodes.length; ++i) {
          buttonsListNodes[i].classList.add("button-disabled");
        }
      }
    }

    function addChatCarouselDefault(carousel, index) {
      try {
        var hasCarouselCards = carousel.cards && Array.isArray(carousel.cards);
        var carouselContainer = createEl("li", {
          class: "ultimate-carousel-container ultimate-hidden"
        });
        var carouselElement = createEl(
          "div",
          {
            class: "ultimate-carousel",
            "data-current-index": 0,
            "data-items-length": hasCarouselCards ? carousel.cards.length : 0
          },
          carouselContainer
        );
        var buttonPrev = createEl(
          "button",
          {
            type: "button",
            class: "ultimate-carousel-button ultimate-carousel-prev disabled"
          },
          carouselElement
        );
        buttonPrev.innerText = "Previous";
        var buttonPrevSvg = createEl(
          "svg",
          {
            viewBox: "0 0 8 13"
          },
          buttonPrev,
          true
        );
        createEl(
          "path",
          {
            fill: "#172d3d",
            d: "m7.7 1.7-4.6 4.6 4.6 4.6-1.4 1.4-6-6 6-6z"
          },
          buttonPrevSvg,
          true
        );
        buttonPrev.addEventListener("click", prevSlider);
        var carouselList = createEl(
          "div",
          {
            class: "ultimate-carousel-list"
          },
          carouselElement
        );
        var carouselTrack = createEl(
          "div",
          { class: "ultimate-carousel-track" },
          carouselList
        );
        if (hasCarouselCards) {
          for (var i = 0; i < carousel.cards.length; ++i) {
            addCardToContainer(carouselTrack, carousel.cards[i], i);
          }
        }
        var buttonNext = createEl(
          "button",
          {
            type: "button",
            class: "ultimate-carousel-button ultimate-carousel-next"
          },
          carouselElement
        );
        buttonNext.innerText = "Next";
        var buttonNextSvg = createEl(
          "svg",
          {
            viewBox: "0 0 8 13"
          },
          buttonNext,
          true
        );
        createEl(
          "path",
          {
            fill: "#172d3d",
            d: "m0.30005 1.7 4.6 4.6-4.6 4.6 1.4 1.4 6-6-6-6-1.4 1.4z"
          },
          buttonNextSvg,
          true
        );
        buttonNext.addEventListener("click", nextSlider);
        addElementToMessageArea(
          carouselContainer,
          TYPE_CAROUSEL,
          carousel,
          index
        );
        // Slider events
        carouselList.addEventListener("mousedown", dragStart);
        carouselList.addEventListener("mousemove", dragMove);
        carouselList.addEventListener("mouseup", dragEnd);
        carouselList.addEventListener("mouseleave", dragEnd);
        carouselList.addEventListener("touchstart", dragStart);
        carouselList.addEventListener("touchmove", dragMove);
        carouselList.addEventListener("touchend", dragEnd);
      } catch (err) {
        console.error("Failed to add carousel element to the DOM");
        console.error(err);
      }
    }

    function addChatCustomCarousel(version, data, message, index) {
      try {
        const parsedData = data.cards.map(({ title, ...rest }) => ({
          ...rest,
          title: title.replace(`&&version${version}&&`, "")
        }));

        var hasCarouselCards = parsedData && Array.isArray(parsedData);
        var carouselContainer = createEl("div", {
          class:
            "ultimate-carousel-container ultimate-custom-carousel-container ultimate-hidden"
        });
        var carouselElement = createEl(
          "div",
          {
            class: `ultimate-carousel ultimate-custom-carousel ultimate-carousel-custom-version${version}`,
            "data-current-index": 0,
            "data-items-length": hasCarouselCards ? parsedData.length : 0
          },
          carouselContainer
        );

        var info = createEl(
          "div",
          { class: "ultimate-carousel-title" },
          carouselElement
        );

        if (message) {
          info.innerHTML = message;
        } else {
          info.innerHTML = "";
        }

        var carouselList = createEl(
          "div",
          {
            class: "ultimate-carousel-list ultimate-carousel-list-version"
          },
          carouselElement
        );

        var contentCard = createEl(
          "div",
          { class: "ultimate-content-card ultimate-carousel-track" },
          carouselList
        );

        var dotsContainer = document.createElement("ul");
        dotsContainer.classList.add("dotsContainer");

        if (hasCarouselCards) {
          for (let i = 0; i < parsedData.length; i++) {
            var cardElement = createEl(
              "div",
              {
                class: "ultimate-card-version"
              },
              contentCard
            );
            if (parsedData[i].imageUrl) {
              var imagesBlock = createEl(
                "div",
                {
                  class: "ultimate-card-images-block"
                },
                cardElement
              );
              var images = parsedData[i].imageUrl.split(",");

              images.forEach((src) => {
                var image = createEl(
                  "div",
                  {
                    class: "ultimate-card-image"
                  },
                  imagesBlock
                );
                image.style.backgroundImage = `url("${src}")`;
              });
            }
            if (parsedData[i].title) {
              var cardTitle = createEl(
                "h4",
                { class: "ultimate-card-title" },
                cardElement
              );
              cardTitle.innerHTML = parsedData[i].title;
            }
            if (parsedData[i].description) {
              var cardDescription = createEl(
                "div",
                { class: "ultimate-custom-card-container" },
                cardElement
              );

              cardDescription.innerHTML = parsedData[i].description;

              var text = cardDescription.querySelector(".brand");
              if (text && text.innerText.length > 53) {
                text.innerText = text.innerText.substring(0, 53) + "...";
              }
            }
            if (parsedData[i].buttons && Array.isArray(parsedData[i].buttons)) {
              var cardButtons = createEl(
                "div",
                {
                  class:
                    "version-custom-button ultimate-custom-card-buttons ultimate-btn-container"
                },
                cardElement
              );

              var buttonElement = createEl(
                "button",
                { class: "btn-version1" },
                cardButtons
              );
              buttonElement.innerHTML = parsedData[i].buttons[0].text;

              let text = parsedData[i].buttons[0].text;
              let link = parsedData[i].buttons[0].link;

              function onButtonClick() {
                const disabledClass = "carousel-disabled";
                if (carouselContainer.classList.contains(disabledClass)) {
                  return;
                } else {
                  onClickButtonElement(link, text, i);
                  carouselContainer.classList.add(disabledClass);
                }
              }

              buttonElement.addEventListener("click", onButtonClick);
            }
            if (i === 0) {
              createEl("li", { class: "active" }, dotsContainer);
            } else {
              createEl("li", {}, dotsContainer);
            }
          }

          carouselList.appendChild(dotsContainer);

          // Slider events
          carouselList.addEventListener("mousedown", dragStart);
          carouselList.addEventListener("mousemove", dragMove);
          carouselList.addEventListener("mouseup", (event) =>
            dragEnd(event, dotsContainer)
          );
          carouselList.addEventListener("mouseleave", (event) =>
            dragEnd(event, dotsContainer)
          );
          carouselList.addEventListener("touchstart", dragStart);
          carouselList.addEventListener("touchmove", dragMove);
          carouselList.addEventListener("touchend", (event) =>
            dragEnd(event, dotsContainer)
          );
        }
        sliderDots(dotsContainer.children);
        addElementToMessageArea(
          carouselContainer,
          TYPE_CAROUSEL,
          parsedData,
          index,
          true
        );
      } catch (err) {
        console.error("Failed to add carousel element to the DOM");
        console.error(err);
      }
    }

    const sliderDots = (slideCicles) => {
      slideCicles = Array.prototype.slice.call(slideCicles);

      slideCicles.forEach((item, index, slideCicles) => {
        item.addEventListener("click", function (event) {
          const parentItem = event.target.parentNode.parentNode;

          moveSlider(parentItem, false, undefined, index, slideCicles);
        });
      });
    };

    function removeCustomElements() {
      var containers = document.querySelectorAll(".ultimate-btn-container");
      for (var i = 0; i < containers.length; ++i) {
        if (!containers[i].classList.contains("version-custom-button")) {
          containers[i].parentNode.removeChild(containers[i]);
        }
      }
    }

    function updateCustomElements(data) {
      CUSTOM_ELEMENTS_DATA =
        JSON.parse(localStorage.getItem(CUSTOM_ELEMENTS_KEY)) || {};
      var index = JSON.parse(data).index;
      var elementData = CUSTOM_ELEMENTS_DATA[index];
      var element = document.querySelectorAll("div.messageArea ul li")[index];
      var buttonContainer = element;
      if (elementData.type === TYPE_CAROUSEL) {
        var carousel = element.children[0];
        carousel.dataset.currentIndex = elementData.currentCard;
        updateSlider(carousel, true);
        buttonContainer =
          element.querySelectorAll(".ultimate-card")[elementData.activeCard];

        const messageWrapper = document.querySelectorAll(
          ".messageWrapper li.chatMessage.agent"
        );
        const lastElement = messageWrapper[messageWrapper.length - 1];
        const loaderElement = lastElement.querySelector(".has-loader");

        loaderElement.classList.remove("has-loader");
      }
      if (elementData.activeButton >= 0) {
        var lastButtonActive = element.querySelector(".ultimate-btn-active");
        if (lastButtonActive) {
          lastButtonActive.classList.remove("ultimate-btn-active");
        }
        var currentButton =
          buttonContainer.querySelectorAll("button")[elementData.activeButton];
        if (currentButton) {
          currentButton.classList.add("ultimate-btn-active");
        }
      }
    }

    function broadcastStorageEvent(eventKey, data) {
      var storageKey = eventKey + TAB_ID + String(Date.now());
      localStorage.setItem(storageKey, data);
      var timer = setTimeout(function () {
        localStorage.removeItem(storageKey);
        clearTimeout(timer);
      }, 2000);
    }

    window.onstorage = function onCrossTabStorageEvent(storageEvent) {
      if (!storageEvent) {
        return;
      }
      var eventData = storageEvent.newValue;
      var eventKey = String(storageEvent.key);
      if (eventData) {
        if (eventKey.indexOf(TAB_ID) > -1) {
          // IE & Safari: ignore events from own tab
          return;
        }
        if (eventKey.indexOf(ADD_BUTTONS_EVENT) > -1) {
          onCustomData(eventData, TYPE_BUTTONS);
        }
        if (eventKey.indexOf(ADD_CAROUSEL_EVENT) > -1) {
          onCustomData(eventData, TYPE_CAROUSEL);
        }
        if (eventKey.indexOf(BUTTON_CLICK_EVENT) > -1) {
          onButtonClickEvent(eventData);
        }
        if (eventKey.indexOf(CUSTOM_ELEMENTS_EVENT) > -1) {
          updateCustomElements(eventData);
        }
      }
    };

    function sendChasitorButtonClickEvent(serializedData) {
      try {
        var data = JSON.parse(serializedData);
        var isCarousel = typeof data.cardIndex !== "undefined";
        // var eventName = isCarousel ? 'CarouselEvent' : 'ButtonClick';
        if (isCarousel) {
          liveAgentAPI.sendCustomEvent("CarouselEvent", serializedData);
        } else {
          var textareaElement = document.querySelector("textarea.chasitorText");
          textareaElement.value = data.text;
          var keydownEvent = document.createEvent("Event");
          keydownEvent.initEvent("keydown");
          keydownEvent.which = keydownEvent.keyCode = 13;
          textareaElement.dispatchEvent(keydownEvent);
        }
      } catch (err) {
        console.error("Failed to send button click message");
      }
    }

    function registerPending(data, type) {
      var payload = JSON.stringify({
        data: data,
        sessionId: sessionId
      });
      if (type === TYPE_BUTTONS) {
        localStorage.setItem(PENDING_BUTTONS_KEY, payload);
      } else if (type === TYPE_CAROUSEL) {
        const messagesList = document.querySelectorAll(
          ".messageWrapper li.chatMessage.agent"
        );
        const lastMessageItem = messagesList[messagesList.length - 1];
        lastMessageItem.classList.add("custom-item");

        var payloadTitle = lastMessageItem.getElementsByClassName(
          "ultimate-carousel-title"
        )[0]?.innerHTML;

        localStorage.setItem(PENDING_CAROUSELS_KEY, payload);

        if (payloadTitle) {
          localStorage.setItem(PENDING_CAROUSEL_TITLE, payloadTitle);
        }
      }
    }

    const webviewButtonEventListener = (container, title) => {
      container.style.display = "none";
      var textareaElement = document.querySelector("textarea.chasitorText");
      textareaElement.value = title;
      var keydownEvent = document.createEvent("Event");
      keydownEvent.initEvent("keydown");
      keydownEvent.which = keydownEvent.keyCode = 13;
      textareaElement.dispatchEvent(keydownEvent);
    };

    function addWebview(parent, url) {
      let container = createEl("div", {
        class: "webviewOverlay"
      });

      let wrapper = createEl("div", { class: "webviewWrapper" }, container);

      let header = createEl("div", { class: "webviewHeader" }, wrapper);
      let closeBtn = createEl("div", { class: "webviewBtn" }, header);
      closeBtn.addEventListener("click", () =>
        webviewButtonEventListener(container, "Webview closed")
      );

      createEl(
        "iframe",
        {
          src: url,
          class: "webview",
          title: "Datepicker"
        },
        wrapper
      );

      // let returnBtn = createEl("div", { class: "webviewReturnBtn" }, wrapper);
      // returnBtn.innerHTML = "Return to Chat bot";
      // returnBtn.addEventListener("click", () =>
      //   webviewButtonEventListener(container, "Returned to chat bot")
      // );
      parent.appendChild(container);
    }

    function registerAllMessages() {
      const payloadMessages = Array.from(
        document.getElementsByClassName("chatMessage")
      );

      payloadMessages.forEach((message, index) => {
        ////check if message contains webview version and create webview element
        const messageParent = message.getElementsByTagName("span")[0];
        const parentText = messageParent?.textContent;
        let version = getVersion(parentText || "");
        const isWebviewVersion = version === IS_WEBVIEW_VERSION;

        MESSAGES_COUNT = payloadMessages.length;
        localStorage.setItem(PENDING_MESSAGE + index, message.innerHTML);
        localStorage.setItem(
          PENDING_MESSAGES_COUNT,
          JSON.stringify(MESSAGES_COUNT)
        );
        if (isWebviewVersion) messageParent.textContent = "Choose date";

        if (isWebviewVersion && index === payloadMessages.length - 1) {
          const regex = /&&webview:([^&]+)&&/;
          let match = parentText.match(regex);
          const url = match[1];
          addWebview(messageParent, url);
        }
        if (index !== payloadMessages.length - 1 && messageParent) {
          let container =
            messageParent.getElementsByClassName("webviewOverlay")[0];
          if (container) container.style.display = "none";
        }
      });
    }

    function clearPending() {
      localStorage.removeItem(PENDING_BUTTONS_KEY);
      localStorage.removeItem(PENDING_CAROUSELS_KEY);
      localStorage.removeItem(PENDING_CAROUSEL_TITLE);
    }

    function checkPendingAgentMessages() {
      var serializedPendingMessagesCount = localStorage.getItem(
        PENDING_MESSAGES_COUNT
      );

      var serializedPendingMessages = [];
      for (let i = 0; i < serializedPendingMessagesCount; i++) {
        serializedPendingMessages.push(
          localStorage.getItem(PENDING_MESSAGE + i)
        );
      }

      var messages = Array.from(document.getElementsByClassName("chatMessage"));
      for (let i = 0; i < messages.length; i++) {
        if (serializedPendingMessages[i]) {
          messages[i].innerHTML = serializedPendingMessages[i];
        }
      }
    }

    function checkPending() {
      var serializedPendingButtons = localStorage.getItem(PENDING_BUTTONS_KEY);
      var serializedPendingCarousels = localStorage.getItem(
        PENDING_CAROUSELS_KEY
      );

      checkPendingAgentMessages();

      try {
        if (serializedPendingButtons) {
          var payload = JSON.parse(serializedPendingButtons);
          if (payload) {
            restoreCustom(payload, TYPE_BUTTONS);
          }
        } else if (serializedPendingCarousels) {
          var payload = JSON.parse(serializedPendingCarousels);
          var title = localStorage.getItem(PENDING_CAROUSEL_TITLE);
          if (payload) {
            restoreCustom(payload, TYPE_CAROUSEL, title);
          }
        }
      } catch (err) {
        console.error("Failed to parse restored custom elements");
      }
    }

    function restoreCustom(payload, type, title) {
      if (sessionId === payload.sessionId) {
        onCustomData(payload.data, type, title);
      }
    }

    function onButtonClickEvent(serializedData) {
      if (isMainTab) {
        sendChasitorButtonClickEvent(serializedData);
      }
      removeCustomElements();
      clearPending();
    }

    function onButtonClickInAnyTab(serializedData) {
      broadcastStorageEvent(BUTTON_CLICK_EVENT, serializedData);
      onButtonClickEvent(serializedData);
    }

    function onCustomEventInMain(result, elementType) {
      var type = result && result.type;
      if (type !== elementType) {
        return;
      }
      const messagesList = document.querySelectorAll(
        ".messageWrapper li.chatMessage.agent"
      );
      const lastMessageItem = messagesList[messagesList.length - 1];
      lastMessageItem.classList.add("custom-item");

      var data = result && result.data;
      if (!data) {
        console.error("Custom event payload error", result);
        return;
      }
      const eventKey =
        elementType === TYPE_CAROUSEL ? ADD_CAROUSEL_EVENT : ADD_BUTTONS_EVENT;
      broadcastStorageEvent(eventKey, data);
      onCustomData(data, elementType);
      registerPending(data, elementType);
    }

    function attachChasitorCustomEventListener() {
      try {
        liveAgentAPI.addCustomEventListener(TYPE_BUTTONS, (result) =>
          onCustomEventInMain(result, TYPE_BUTTONS)
        );
        liveAgentAPI.addCustomEventListener(TYPE_CAROUSEL, (result) =>
          onCustomEventInMain(result, TYPE_CAROUSEL)
        );
      } catch (err) {
        console.error("Failed to attach listeners");
      }
    }

    function initCustomElements() {
      CUSTOM_ELEMENTS_DATA =
        JSON.parse(localStorage.getItem(CUSTOM_ELEMENTS_KEY)) || {};
      for (var index in CUSTOM_ELEMENTS_DATA) {
        if (CUSTOM_ELEMENTS_DATA.hasOwnProperty(index)) {
          var element = CUSTOM_ELEMENTS_DATA[index];
          if (element.type === TYPE_BUTTONS) {
            // Not needed, restoring buttons like before carousel
            // addChatButtons(element.data, index);
          } else if (element.type === TYPE_CARD) {
            addChatCard(element.data, index);
          } else if (element.type === TYPE_CAROUSEL) {
            addChatCarouselDefault(element.data, index);
          }
        }
      }
    }

    var isMessageArea = true;
    function checkMessageArea() {
      var sidebarBody = document.querySelector(
        ".embeddedServiceSidebar .sidebarBody"
      );
      var observer = new MutationObserver(function (mutationsList, observer) {
        var isMessageAreaNew = !!sidebarBody.querySelector(".messageArea");
        if (!isMessageArea && isMessageAreaNew) {
          initCustomElements();
        }
        isMessageArea = isMessageAreaNew;
      });
      observer.observe(sidebarBody, { childList: true, subtree: true });
    }

    function onChasitorClientLoad() {
      CUSTOM_ELEMENTS_DATA =
        JSON.parse(localStorage.getItem(CUSTOM_ELEMENTS_KEY)) || {};
      // If this is the main tab where the chat was initiated.
      // Do not clear pending because we want to restore pending buttons after page reload.
      // Do not attach listerners is it's main tab because the events are communitated through `window.onstorage`.
      if (isMainTab) {
        // clearPending();
        attachChasitorCustomEventListener();
      }

      // If there's no other tabs opened with the chat open.
      if (liveAgentAPI.browserSessionInfo.activeChatSessions === 1) {
        localStorage.removeItem(CUSTOM_ELEMENTS_KEY);
        CUSTOM_ELEMENTS_DATA = {};
      } else {
        // If there's more than one chats/tabs open
        initCustomElements();
      }
      checkPending();
      checkMessageArea();
    }

    // Remove custom elements when messages are received [Samppa]
    function onMessageReceivedUser() {
      removeCustomElements();
    }

    function handleStopLoader(lastElement) {
      setTimeout(() => {
        const isCustomElement = lastElement.classList.contains("custom-item");

        if (!isCustomElement) {
          const loaderElement = lastElement.querySelector(".loader");

          loaderElement?.classList.add("hidden");
          lastElement.classList.add("visible");
        }
        var messageArea = document.querySelector("div.messageArea");
        messageArea.scrollTop = messageArea.scrollHeight;
      }, 2000);
    }

    // Handle if bot message is not custom element and disable loader
    function onMessageSendAgent() {
      setTimeout(() => {
        const messagesList = document.querySelectorAll(
          ".messageWrapper li.chatMessage.agent"
        );
        const agentMessagesCount = messagesList.length;
        const agentMessageCountStorage =
          localStorage.getItem("agentMessagesCount") || 0;

        if (agentMessagesCount > agentMessageCountStorage) {
          handleStopLoader(messagesList[agentMessagesCount - 1]);
        }
        localStorage.setItem("agentMessagesCount", agentMessagesCount);
        registerAllMessages();
      }, 100);
    }

    // Listener is removed when chat ends, reattach listener when chat is connected [Samppa]
    function onChatRequestSuccess() {
      clearPending();
      attachChasitorCustomEventListener();
    }

    window.embedded_svc.addEventHandler(
      "onChasitorMessage",
      onMessageReceivedUser
    );
    window.embedded_svc.addEventHandler("onAgentMessage", onMessageSendAgent);
    window.embedded_svc.addEventHandler(
      "onChatRequestSuccess",
      onChatRequestSuccess
    );

    onChasitorClientLoad();
  })(window.embedded_svc.liveAgentAPI);
})(window);
