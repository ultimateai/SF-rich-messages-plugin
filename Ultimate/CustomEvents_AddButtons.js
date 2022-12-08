/**
 * Last edited: 18.03.2022 12h
 */
(function (window) {
  if (!window.embedded_svc || !window.embedded_svc.liveAgentAPI) {
    return;
  }

  var link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute(
    "href",
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto+Mono&display=swap"
  );
  document.head.appendChild(link);

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

  //VERSIONS
  var IS_VERSION_1 = "isVersion1";
  var IS_VERSION_2 = "isVersion2";
  var IS_VERSION_3 = "isVersion3";
  var IS_VERSION_4 = "isversion4";
  var IS_VERSION_5 = "isversion5";

  var VERSION_1_KEY = "&&version1&&";
  var VERSION_2_KEY = "&&version2&&";
  var VERSION_3_KEY = "&&version3&&";
  var VERSION_4_KEY = "&&version4&&";
  var VERSION_5_KEY = "&&version5&&";

  //PENDINGS
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

  // SLIDER
  var SLIDE_WIDTH_CAROUSEL_V1 = 260 + 8; // slider cards v1 (width + margin)
  var SLIDE_WIDTH_CAROUSEL_V2 = 320 + 8; // slider cards v2 (width + margin)
  var SLIDE_WIDTH_CAROUSEL_V3 = 206 + 8; // slider cards v3 (width + margin)

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

    if (message.includes(VERSION_1_KEY)) {
      value = IS_VERSION_1;
    } else if (message.includes(VERSION_2_KEY)) {
      value = IS_VERSION_2;
    } else if (message.includes(VERSION_3_KEY)) {
      value = IS_VERSION_3;
    } else if (message.includes(VERSION_4_KEY)) {
      value = IS_VERSION_4;
    } else if (message.includes(VERSION_5_KEY)) {
      value = IS_VERSION_5;
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
      container,
      version
    ) {
      if (rating) {
        addChatButtonRating(initialData, wrapper, rating, container, version);
      } else {
        initialData.forEach(({ text, link }) => {
          var buttonElement;

          if (link && initialData.length === 1) {
            buttonElement = createEl(
              "button",
              { class: `button-link-wrapper button-link-wrapper-v${version}` },
              wrapper
            );

            const linkElement = createEl(
              "span",
              { class: "button-link" },
              buttonElement
            );
            linkElement.innerHTML = text;

            createSvg(
              buttonElement,
              "0 0 16 16",
              "#5D5ADC",
              "M3.33333 3.33333V12.6667H12.6667V8H14V12.6667C14 13.4 13.4 14 12.6667 14H3.33333C2.59333 14 2 13.4 2 12.6667V3.33333C2 2.6 2.59333 2 3.33333 2H8V3.33333H3.33333ZM9.33333 3.33333V2H14V6.66667H12.6667V4.27333L6.11333 10.8267L5.17333 9.88667L11.7267 3.33333H9.33333Z"
            );

            const noteBlock = createEl(
              "div",
              { class: "button-note-block" },
              container
            );

            const noteText = createEl(
              "span",
              { class: "button-note-text" },
              noteBlock
            );
            noteText.innerHTML =
              "Note: This page will open in a new browser tab";
          } else {
            buttonElement = createEl(
              "button",
              { class: "btn-default" },
              wrapper
            );
            buttonElement.innerHTML = text;
          }

          buttonElement.addEventListener("click", () =>
            customOnButtonClick(container, link, text)
          );
        });
      }
    }

    function addChatButtonsDefault(version, chatButtons, index, title) {
      var buttonContainer = createEl("div", {
        class: `ultimate-btn-container ultimate-hidden version-custom-button btn-container-v${version}`,
      });

      var info = createEl(
        "div",
        { class: `info info-v${version}` },
        buttonContainer
      );

      if (title) {
        info.innerHTML = title;
      }

      let rating;
      if ((version === 3) | (version === 5)) {
        info.classList.add("info-rating");
        rating = createEl("div", { class: "rating-group" }, buttonContainer);
      }

      var buttonsWrapper = createEl(
        "div",
        { class: `buttons-wrapper buttons-wrapper-v${version}` },
        buttonContainer
      );

      createCustomButtonElements(
        chatButtons,
        buttonsWrapper,
        rating,
        buttonContainer,
        version
      );
      addElementToMessageArea(
        buttonContainer,
        TYPE_BUTTONS,
        chatButtons,
        index,
        true
      );
    }

    function addChatButtonRating(
      initialData,
      wrapper,
      rating,
      container,
      version
    ) {
      var lastButtonElement = initialData.pop();
      var starsBlock = createEl(
        "div",
        { class: `starsBlock starsBlock-v${version}` },
        rating
      );
      if (version === 5) {
        initialData.forEach(({ text }) => {
          const ratingButton = createEl(
            "div",
            { class: "rating-v2-button" },
            starsBlock
          );
          ratingButton.innerHTML = text;
          ratingButton.addEventListener("click", () =>
            customOnButtonClick(container, "", text)
          );
        });
      } else {
        createEl(
          "input",
          {
            class: "rating__input rating__input--none",
            name: "rating3",
            id: "rating3-none",
            value: "0",
            type: "radio",
            disabled: "disabled",
            checked: "checked",
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
              for: `rating${index + specialId}`,
            },
            starsBlock
          );

          createSvg(
            starLabel,
            "0 0 22 22",
            undefined,
            "M12.1017 1.69434C11.9064 1.26465 11.4767 0.991211 11.008 0.991211C10.5001 0.991211 10.0705 1.26465 9.87514 1.69434L7.37514 6.88965L1.75014 7.70996C1.28139 7.78809 0.890767 8.10059 0.734517 8.56934C0.617329 8.99902 0.734517 9.50684 1.04702 9.81934L5.10952 13.8428L4.17202 19.5459C4.09389 20.0146 4.2892 20.4834 4.67983 20.7568C5.07045 21.0693 5.57827 21.0693 5.96889 20.874L11.008 18.1787L16.008 20.874C16.4376 21.0693 16.9455 21.0693 17.3361 20.7568C17.7267 20.4834 17.922 20.0146 17.8439 19.5459L16.8673 13.8428L20.9298 9.81934C21.2814 9.50684 21.3986 8.99902 21.2423 8.56934C21.0861 8.10059 20.6955 7.78809 20.2267 7.70996L14.6408 6.88965L12.1017 1.69434Z",
            "#5D5ADC",
            "2"
          );

          createEl(
            "input",
            {
              class: "rating__input",
              name: "rating3",
              id: `rating${index + specialId}`,
              type: "radio",
              value: "1",
            },
            starsBlock
          );

          starLabel.addEventListener("click", () =>
            customOnButtonClick(container, "", text)
          );
        });
      }

      var buttonElement = createEl("button", { class: "btn-rating" }, wrapper);
      buttonElement.innerHTML = lastButtonElement.text;

      buttonElement.addEventListener("click", () =>
        customOnButtonClick(container, "", lastButtonElement.text)
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
              addChatButtonsDefault(
                1,
                eventData.chatButtons,
                undefined,
                titleMessage.replace(VERSION_1_KEY, "")
              ),
            [IS_VERSION_2]: () =>
              addChatButtonsDefault(
                2,
                eventData.chatButtons,
                undefined,
                titleMessage.replace(VERSION_2_KEY, "")
              ),
            [IS_VERSION_3]: () =>
              addChatButtonsDefault(
                3,
                eventData.chatButtons,
                undefined,
                titleMessage.replace(VERSION_3_KEY, "")
              ),
            [IS_VERSION_5]: () =>
              addChatButtonsDefault(
                5,
                eventData.chatButtons,
                undefined,
                titleMessage.replace(VERSION_5_KEY, "")
              ),
            default: () =>
              addChatButtonsDefault(
                0,
                eventData.chatButtons,
                undefined,
                titleMessage
              ),
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
                  addChatCarousel(1, eventData, carouselMesasge),
                [IS_VERSION_2]: () =>
                  addChatCarousel(2, eventData, carouselMesasge),
                [IS_VERSION_3]: () =>
                  addChatCarousel(3, eventData, carouselMesasge),
                default: () => addChatCarousel(0, eventData, carouselMesasge),
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
        cardIndex: cardIndex,
      });

      onButtonClickInAnyTab(serializedData);
    }

    function createSvg(container, viewBox, fill, path, stroke, strokeWidth) {
      var externalLinkSvg = createEl(
        "svg",
        {
          viewBox,
        },
        container,
        true
      );

      createEl(
        "path",
        {
          fill,
          d: path,
          stroke,
          "stroke-width": strokeWidth,
        },
        externalLinkSvg,
        true
      );
    }

    function addButtonToContainer(container, button, carouselContainer, index) {
      var buttonText = button.text;
      var buttonLink = button.link;
      var buttonElement = createEl(
        "button",
        { class: "ultimate-card-button" },
        container
      );

      if (buttonLink) {
        buttonElement.classList.add("ultimate-card-link-wrapper");

        const buttonTextEl = createEl(
          "span",
          { class: "button-link" },
          buttonElement
        );
        buttonTextEl.innerHTML = buttonText;

        createSvg(
          buttonElement,
          "0 0 16 16",
          "#FFFFFF",
          "M3.33333 3.33333V12.6667H12.6667V8H14V12.6667C14 13.4 13.4 14 12.6667 14H3.33333C2.59333 14 2 13.4 2 12.6667V3.33333C2 2.6 2.59333 2 3.33333 2H8V3.33333H3.33333ZM9.33333 3.33333V2H14V6.66667H12.6667V4.27333L6.11333 10.8267L5.17333 9.88667L11.7267 3.33333H9.33333Z"
        );
      } else {
        buttonElement.innerHTML = buttonText;
      }

      function onButtonClick() {
        const disabledClass = "carousel-disabled";
        if (carouselContainer.classList.contains(disabledClass)) {
          if (buttonElement.classList.contains("ultimate-card-link-wrapper")) {
            onClickButtonElement(buttonLink, buttonText, index);
          } else {
            return;
          }
        } else {
          onClickButtonElement(buttonLink, buttonText, index);
          if (!buttonLink) {
            carouselContainer.classList.add(disabledClass);
          }
        }
      }

      buttonElement.addEventListener("click", onButtonClick);
    }

    function addCardToContainer(container, card, cardIndex) {
      var cardElement = createEl(
        "div",
        {
          class: "ultimate-card",
        },
        container
      );
      if (card.imageUrl) {
        createEl(
          "img",
          {
            src: card.imageUrl,
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
            class: "ultimate-card-buttons",
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
              activeButton: -1,
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

    function dragMove(event, slideWidth) {
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

    function dragEnd(event, slideWidth) {
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
              prevSlider(
                {
                  target: carousel.querySelector(".ultimate-carousel-list"),
                },
                slideWidth
              );
              keepCurrentIndex = false;
            }
          } else {
            if (currentIndex + 1 < itemsLength) {
              nextSlider(
                {
                  target: carousel.querySelector(".ultimate-carousel-list"),
                },
                slideWidth
              );
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
        noAnimate: noAnimate,
      });
    }

    function moveSlider(buttonEl, isPrev, noAnimate, targetIndex, slideWidth) {
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

    function prevSlider(event, slideWidth) {
      moveSlider(event.target, true, undefined, undefined, slideWidth);
    }

    function nextSlider(event, slideWidth) {
      moveSlider(event.target, false, undefined, undefined, slideWidth);
    }

    function addChatCard(card, index) {
      try {
        var cardContainer = createEl("li", {
          class: "ultimate-card-container ultimate-hidden",
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
        const buttonsRating = container.querySelectorAll(".rating-v2-button");

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
        if (!link) {
          for (var i = 0; i < buttonsListNodes.length; ++i) {
            buttonsListNodes[i].classList.add("button-disabled");
          }
          if (buttonsRating.length) {
            for (var i = 0; i < buttonsRating.length; ++i) {
              buttonsRating[i].classList.add("button-disabled");
            }
          }
        }
      }
    }

    const setSlideWidth = (version) => {
      switch (version) {
        case 0:
          return SLIDE_WIDTH_CAROUSEL_V1;
        case 2:
          return SLIDE_WIDTH_CAROUSEL_V2;
        case 3:
          return SLIDE_WIDTH_CAROUSEL_V3;
        default:
          break;
      }
    };

    function addChatCarousel(version, data, message, index) {
      try {
        const slideWidth = setSlideWidth(version);
        let parsedData = data.cards;
        if (version) {
          parsedData = data.cards.map(({ title, ...rest }) => ({
            ...rest,
            title: title.replace(`&&version${version}&&`, ""),
          }));
        }
        var hasCarouselCards = parsedData && Array.isArray(parsedData);
        var carouselContainer = createEl("div", {
          class:
            "ultimate-carousel-container ultimate-custom-carousel-container ultimate-hidden",
        });

        var carouselElement = createEl(
          "div",
          {
            class: `ultimate-carousel ultimate-carousel-custom-version${version}`,
            "data-current-index": 0,
            "data-items-length": hasCarouselCards ? parsedData.length : 0,
          },
          carouselContainer
        );

        var buttonPrev = createEl(
          "button",
          {
            type: "button",
            class: "ultimate-carousel-button ultimate-carousel-prev disabled",
          },
          carouselElement
        );

        buttonPrev.innerText = "Previous";

        createSvg(
          buttonPrev,
          "0 0 14 12",
          "#15142D",
          "M13.7601 6.00008C13.7601 6.39119 13.4401 6.71119 13.049 6.71119H2.6668L5.88458 9.94675C6.16902 10.2312 6.16902 10.6756 5.88458 10.9601C5.74236 11.1023 5.56458 11.1734 5.3868 11.1734C5.20902 11.1734 5.01347 11.1023 4.88902 10.9601L0.462359 6.51564C0.177915 6.23119 0.177915 5.78675 0.462359 5.52008L4.88902 1.07564C5.17347 0.791191 5.61791 0.791191 5.90235 1.07564C6.1868 1.36008 6.1868 1.80453 5.90235 2.08897L2.6668 5.28897H13.049C13.4401 5.28897 13.7601 5.60897 13.7601 6.00008Z"
        );

        buttonPrev.addEventListener("click", (e) => prevSlider(e, slideWidth));

        if (message) {
          var title = createEl(
            "div",
            { class: "ultimate-carousel-title" },
            carouselElement
          );
          title.innerHTML = message;
        }

        var carouselList = createEl(
          "div",
          {
            class: "ultimate-carousel-list ultimate-carousel-list-version",
          },
          carouselElement
        );

        var contentCard = createEl(
          "div",
          { class: "ultimate-content-card ultimate-carousel-track" },
          carouselList
        );

        if (hasCarouselCards) {
          for (let i = 0; i < parsedData.length; i++) {
            var cardElement = createEl(
              "div",
              {
                class: `ultimate-card ultimate-card-v${version}`,
              },
              contentCard
            );
            if (parsedData[i].imageUrl) {
              var imagesBlock = createEl(
                "div",
                {
                  class: "ultimate-card-images-block",
                },
                cardElement
              );
              var images = parsedData[i].imageUrl.split(",");

              images.forEach((src) => {
                var image = createEl(
                  "div",
                  {
                    class: "ultimate-card-image",
                  },
                  imagesBlock
                );
                image.style.backgroundImage = `url("${src}")`;
              });
            }
            var infoContainer = createEl(
              "div",
              {
                class: `ultimate-card-info-block ultimate-card-info-block-v${version}`,
              },
              cardElement
            );

            if (parsedData[i].title) {
              var cardTitle = createEl(
                "h4",
                { class: "ultimate-card-title" },
                infoContainer
              );
              cardTitle.innerHTML = parsedData[i].title;
            }
            if (parsedData[i].description) {
              var cardDescription = createEl(
                "div",
                { class: "ultimate-custom-card-container" },
                infoContainer
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
                  class: "ultimate-custom-card-buttons ultimate-btn-container",
                },
                infoContainer
              );

              parsedData[i].buttons.forEach((button) => {
                addButtonToContainer(cardButtons, button, carouselContainer, i);
              });
            }
          }
          // Slider events
          carouselList.addEventListener("mousedown", dragStart);
          carouselList.addEventListener("mousemove", (e) =>
            dragMove(e, slideWidth)
          );
          carouselList.addEventListener("mouseup", (e) =>
            dragEnd(e, slideWidth)
          );
          carouselList.addEventListener("mouseleave", (e) =>
            dragEnd(e, slideWidth)
          );
          carouselList.addEventListener("touchstart", dragStart);
          carouselList.addEventListener("touchmove", (e) =>
            dragMove(e, slideWidth)
          );
          carouselList.addEventListener("touchend", (e) =>
            dragEnd(e, slideWidth)
          );
        }

        var buttonNext = createEl(
          "button",
          {
            type: "button",
            class: "ultimate-carousel-button ultimate-carousel-next",
          },
          carouselElement
        );
        buttonNext.innerText = "Next";

        createSvg(
          buttonNext,
          "0 0 14 12",
          "#15142D",
          "M13.5468 6.49778L9.12014 10.9422C8.97792 11.0844 8.80013 11.1556 8.62235 11.1556C8.44457 11.1556 8.2668 11.0844 8.12458 10.9422C7.84013 10.6578 7.84013 10.2133 8.12458 9.92889L11.3424 6.69334H0.960135C0.569023 6.69334 0.249023 6.37334 0.249023 5.98223C0.249023 5.59112 0.569023 5.27112 0.960135 5.27112H11.3424L8.12458 2.03557C7.84013 1.75112 7.84013 1.30668 8.12458 1.02223C8.40902 0.737788 8.85347 0.737788 9.13791 1.02223L13.5646 5.46668C13.8312 5.7689 13.8312 6.23112 13.5468 6.49778Z"
        );

        buttonNext.addEventListener("click", (e) => nextSlider(e, slideWidth));

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

    function removeCustomElements() {
      var containers = document.querySelectorAll(".ultimate-btn-container");
      for (var i = 0; i < containers.length; ++i) {
        if (
          !containers[i].classList.contains("version-custom-button") &&
          !containers[i].classList.contains("ultimate-custom-card-buttons")
        ) {
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
        sessionId: sessionId,
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

    function registerAllMessages() {
      const payloadMessages = Array.from(
        document.getElementsByClassName("chatMessage")
      );

      payloadMessages.forEach((message, index) => {
        MESSAGES_COUNT = payloadMessages.length;
        localStorage.setItem(PENDING_MESSAGE + index, message.innerHTML);
        localStorage.setItem(
          PENDING_MESSAGES_COUNT,
          JSON.stringify(MESSAGES_COUNT)
        );
      });
    }

    function clearPending() {
      localStorage.removeItem(PENDING_BUTTONS_KEY);
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
            addChatCarousel(0, element.data, index);
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
