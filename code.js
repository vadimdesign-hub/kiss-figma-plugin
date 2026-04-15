// ============================
// ГЛАВНЫЙ SWITCH — выбор команды плагина
// ============================
let keepAlive = false;
let pendingTranslations = 0;
let lastAddedNode = null;
let prevSelectionIds = new Set();
function tryClose() { if (!keepAlive) figma.closePlugin(); }

function checkFrameSelected() {
  const sel = figma.currentPage.selection;
  const hasFrame = sel.length === 1 && (sel[0].type === "FRAME" || sel[0].type === "COMPONENT" || sel[0].type === "INSTANCE") && sel[0].parent && sel[0].parent.type === "SECTION";
  figma.ui.postMessage({ type: "frameSelected", value: hasFrame });
}

figma.on("selectionchange", () => {
  if (!keepAlive) return;
  const sel = figma.currentPage.selection;
  const curIds = new Set(sel.map(n => n.id));

  // Находим новые элементы (которых не было в предыдущем выделении)
  const newNodes = sel.filter(n => !prevSelectionIds.has(n.id));
  if (newNodes.length === 1) {
    lastAddedNode = newNodes[0];
  } else if (sel.length === 1) {
    lastAddedNode = sel[0];
  }

  prevSelectionIds = curIds;
  checkFrameSelected();
});

switch (figma.command) {

  // 🔄 Заменяет выделенные объекты на соответствующие Instance
  case "replace":
    replaceWithInstance();
    break;

  // 📐 Выравнивает фреймы внутри секции или создает секцию, если выделены фреймы
  case "autosection":
    autoSectionAlign();
    break;

  // 🗂️ Оборачивает выделенные фреймы в новую секцию и выравнивает их в один ряд
  case "wrap":
    wrapOrAlignSectionClean();
    break;

  // ↔️ Увеличивает ширину выбранной секции на 540 px и сдвигает секции правее
  case "expandSection":
    expandSection();
    break;

  // ⬅️ Расширяет секцию влево (добавляет место перед первым фреймом)
  case "expandSectionLeft":
    expandSectionLeft();
    break;


  // ✂️ Нарезка / обработка объектов для 1px
  case "slice":
    wrapObjectsInSection();
    break;

  // ✂️ Сервер / нарезка в 3 размерах
  case "server":
    createServerIcons();
    break;

  // 🖼️ Изменяет размеры текстовых объектов в артборде
  case "art":
    artTextResize();
    break;

  // ⚡ Выровнять все секции
  case "alignAllSections":
    alignAllSections();
    break;

  // 🟠 Создаёт плавающий тег с иконкой и текстом
  case "floatingTag":
    createMediumTag();
    break;

  // 🛑 Создаёт срочный тег с иконкой и текстом
  case "urgentTag":
    createUrgentTag();
    break;

 // ✅ Создаёт тег "Задача выполнена"
case "doneTag":
  createDoneTag();
  break;

  // 🔵 Создаёт тег "На ревью"
  case "reviewTag":
    createReviewTag();
    break;

  // 🚀 Ready for Dev
  case "readyForDev":
    readyForDevSection();
    break;

  // 🔍 Находит все объекты с таким же именем и размером
  case "findSimilar":
    findSimilar();
    break;

  // 🌐 Перевод
  case "translate":
    keepAlive = true;
    figma.showUI(__html__, { width: 1, height: 1 });
    translateFrames();
    break;

  // ❓ FAQ — открывает окно с описанием всех функций
  case "faq":
    figma.showUI(__html__, { width: 860, height: 610, title: "FAQ" });
    (async () => {
      const savedIconStyle = await figma.clientStorage.getAsync("iconStyle");
      const savedTheme = await figma.clientStorage.getAsync("theme");
      figma.ui.postMessage({ type: "showFaq", savedIconStyle: savedIconStyle || "svg", savedTheme: savedTheme || "light" });
    })();
    break;

  // 🎛️ UI — плавающая панель с кнопками
  case "ui":
    keepAlive = true;
    (async () => {
      const savedOrder = await figma.clientStorage.getAsync("toolOrder");
      const savedIconStyle = await figma.clientStorage.getAsync("iconStyle");
      const savedTheme = await figma.clientStorage.getAsync("theme");
      const savedExpandChkR = await figma.clientStorage.getAsync("expandChkR");
      const savedExpandChkL = await figma.clientStorage.getAsync("expandChkL");
      const savedDynamic = await figma.clientStorage.getAsync("dynamicToolbar");
      const initHeight = savedDynamic === "dynamic" ? 33 : 58;
      figma.showUI(__html__, { width: 320, height: initHeight, title: "Kiss" });
      figma.ui.postMessage({ type: "toolbar", savedOrder: savedOrder || null, savedIconStyle: savedIconStyle || null, savedTheme: savedTheme || null, savedExpandChkR: savedExpandChkR !== undefined ? savedExpandChkR : null, savedExpandChkL: savedExpandChkL !== undefined ? savedExpandChkL : null, savedDynamic: savedDynamic || "normal" });
      checkFrameSelected();
    })();
    break;

  // ⚙️ Настройки
  case "settings":
    figma.showUI(__html__, { width: 360, height: 430, title: "Настройки" });
    (async () => {
      const savedIconStyle = await figma.clientStorage.getAsync("iconStyle");
      const savedTheme = await figma.clientStorage.getAsync("theme");
      const savedDynamic = await figma.clientStorage.getAsync("dynamicToolbar");
      figma.ui.postMessage({ type: "showSettings", savedIconStyle: savedIconStyle || "svg", savedTheme: savedTheme || "light", savedDynamic: savedDynamic || "normal" });
    })();
    break;

  default:
    tryClose();
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === "resize") {
    figma.ui.resize(msg.width, msg.height || 58);
    return;
  }
  if (msg.type === "openFaq") {
    figma.ui.resize(860, 610);
    (async () => {
      const savedIconStyle = await figma.clientStorage.getAsync("iconStyle");
      const savedTheme = await figma.clientStorage.getAsync("theme");
      figma.ui.postMessage({ type: "showFaq", savedIconStyle: savedIconStyle || "svg", savedTheme: savedTheme || "light" });
    })();
    return;
  }
  if (msg.type === "clipboardDone") {
    figma.notify("🔗 Ссылка скопирована ✅");
    return;
  }
  if (msg.type === "clipboardFail") {
    figma.notify("⚠️ Не удалось получить ключ файла");
    return;
  }
  if (msg.type === "saveOrder") {
    await figma.clientStorage.setAsync("toolOrder", msg.order);
    return;
  }
  if (msg.type === "saveIconStyle") {
    await figma.clientStorage.setAsync("iconStyle", msg.style);
    return;
  }
  if (msg.type === "saveTheme") {
    await figma.clientStorage.setAsync("theme", msg.theme);
    return;
  }
  if (msg.type === "saveDynamic") {
    await figma.clientStorage.setAsync("dynamicToolbar", msg.value);
    return;
  }
  if (msg.type === "saveExpandCheck") {
    const key = msg.command === "expandSection" ? "expandChkR" : "expandChkL";
    await figma.clientStorage.setAsync(key, msg.checked);
    return;
  }
  if (msg.type === "settingsDone") {
    figma.notify("Настройки применены ✅");
    // Reopen toolbar
    const savedOrder = await figma.clientStorage.getAsync("toolOrder");
    const savedIconStyle = await figma.clientStorage.getAsync("iconStyle");
    const savedTheme = await figma.clientStorage.getAsync("theme");
    const savedExpandChkR = await figma.clientStorage.getAsync("expandChkR");
    const savedExpandChkL = await figma.clientStorage.getAsync("expandChkL");
    const savedDynamic = await figma.clientStorage.getAsync("dynamicToolbar");
    const initHeight = savedDynamic === "dynamic" ? 33 : 58;
    figma.showUI(__html__, { width: 320, height: initHeight, title: "Kiss" });
    figma.ui.postMessage({ type: "toolbar", savedOrder: savedOrder || null, savedIconStyle: savedIconStyle || null, savedTheme: savedTheme || null, savedExpandChkR: savedExpandChkR !== undefined ? savedExpandChkR : null, savedExpandChkL: savedExpandChkL !== undefined ? savedExpandChkL : null, savedDynamic: savedDynamic || "normal" });
    return;
  }
  if (msg.type === "translationResult") {
    const { ids, translations } = msg;
    for (let i = 0; i < ids.length; i++) {
      const node = figma.getNodeById(ids[i]);
      if (node && node.type === "TEXT") {
        if (node.fontName === figma.mixed) {
          const len = node.characters.length;
          for (let j = 0; j < len; j++) {
            await figma.loadFontAsync(node.getRangeFontName(j, j + 1));
          }
        } else {
          await figma.loadFontAsync(node.fontName);
        }
        node.characters = translations[i];
      }
    }
    pendingTranslations--;
    if (pendingTranslations <= 0) {
      figma.notify("Перевод завершён ✅");
    }
    return;
  }
  if (msg.type !== "run") return;
  switch (msg.command) {
    case "alignAllSections": alignAllSections(); break;
    case "expandSection":    expandSection(msg.duplicate !== false);       break;
    case "expandSectionLeft": expandSectionLeft(msg.duplicate !== false);  break;
    case "autosection":      await autoSectionAlign(msg.withKeyboard); break;
    case "wrap":             wrapOrAlignSectionClean(); break;
    case "replace":          replaceWithInstance(); break;
    case "slice":
      if (msg.product) createServerIcons();
      else if (msg.scale267) scaleSelection267();
      else wrapObjectsInSection();
      break;
    case "art":              artTextResize(); break;
    case "findSimilar":      findSimilar(msg.sectionOnly); break;
    case "floatingTag":      createMediumTag(); break;
    case "urgentTag":        createUrgentTag(); break;
    case "doneTag":          createDoneTag(); break;
    case "reviewTag":        createReviewTag(); break;
    case "readyForDev":      readyForDevSection(); break;
    case "copyLink":         copyLinkToSelection(); break;
    case "translate":        translateFrames(); break;
  }
};



// ============================
// Replace With Any Object
// ============================
async function replaceWithInstance() {

  const selection = figma.currentPage.selection;

  if (selection.length < 2) {
    figma.notify("Выдели объекты и ПОСЛЕДНИМ — эталонный");
    tryClose();
    return;
  }

  const waitNotify = figma.notify("⏳ Пожалуйста, подождите...", { timeout: Infinity });
  await new Promise(r => setTimeout(r, 100));

  // Последний добавленный в выделение — источник (эталон)
  const source = lastAddedNode && selection.find(n => n.id === lastAddedNode.id)
    ? lastAddedNode
    : selection[selection.length - 1];

  // Все остальные — цели
  const targets = selection.filter(n => n.id !== source.id);

  let replacedCount = 0;

  targets.forEach(target => {

    const parent = target.parent;
    if (!parent) return;

    const x = target.x;
    const y = target.y;
    const width = target.width;
    const height = target.height;
    const constraints = "constraints" in target ? target.constraints : null;

    const index = parent.children.indexOf(target);

    const newNode = source.clone();

    parent.insertChild(index, newNode);

    newNode.x = x;
    newNode.y = y;

    if ("resize" in newNode) {
      try {
        newNode.resize(width, height);
      } catch (e) {}
    }

    if (constraints && "constraints" in newNode) {
      newNode.constraints = constraints;
    }

    target.remove();
    replacedCount++;

  });

  waitNotify.cancel();
  figma.notify(`Заменено объектов: ${replacedCount} 🚀`);
  tryClose();
}


// ============================
// 2️⃣ Auto Section Align (БЕЗ изменения порядка слоёв)
// ============================
async function autoSectionAlign(withKeyboard = false) {
  const GAP = 80;
  const PADDING = 100;
  const SECOND_ROW_OFFSET = 160;
  const EXTRA = 300;

  const sel = figma.currentPage.selection;
  let message = "";
  let waitNotify = null;
  if (withKeyboard) {
    waitNotify = figma.notify("⏳ Пожалуйста, подождите...", { timeout: Infinity });
    await new Promise(r => setTimeout(r, 100));
  }

  function getFrames(nodes) {
    return nodes.filter(
      c => c.type === "FRAME" ||
           c.type === "INSTANCE" ||
           c.type === "COMPONENT"
    );
  }

  function removeSecondRow(section, topRowMaxY) {
    section.children
      .filter(c =>
        (c.type === "FRAME" || c.type === "INSTANCE" || c.type === "COMPONENT") &&
        c.y > topRowMaxY
      )
      .forEach(c => c.remove());
  }

  function alignTopRow(frames) {
    if (frames.length === 0) return;

    // ВАЖНО: сортируем только копию массива
    const sorted = [...frames].sort((a, b) => a.x - b.x);

    let currentX = PADDING;

    sorted.forEach(frame => {
      frame.x = currentX;
      frame.y = PADDING;
      currentX += frame.width + GAP;
    });
  }

  async function duplicateSecondRow(frames, parent) {
    if (frames.length === 0) return [];

    const maxHeight = Math.max(...frames.map(f => f.height));
    const clones = [];

    function findBoundVariableId(node, depth) {
      if (depth > 3) return null;
      if (node.boundVariables) {
        var keys = Object.keys(node.boundVariables);
        if (keys.length > 0) {
          var val = node.boundVariables[keys[0]];
          return Array.isArray(val) ? val[0].id : val.id;
        }
      }
      if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
          var found = findBoundVariableId(node.children[i], depth + 1);
          if (found) return found;
        }
      }
      return null;
    }

    var kissCollection = null;
    var darkMode = null;

    var varId = findBoundVariableId(frames[0], 0);
    if (varId) {
      var variable = await figma.variables.getVariableByIdAsync(varId);
      if (variable) {
        var collection = await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
        if (collection) {
          kissCollection = collection;
          darkMode = collection.modes.find(m => m.name === "Dark");
        }
      }
    }

    function switchKeyboardsToDark(node) {
      if (node.type === "INSTANCE" && node.name.toLowerCase().includes("keyboard")) {
        try {
          const props = node.componentProperties;
          const propKey = Object.keys(props).find(k =>
            k.startsWith("Property 2") &&
            props[k].type === "VARIANT" &&
            props[k].value === "Light"
          );
          if (propKey) {
            node.setProperties({ [propKey]: "Dark" });
          }
        } catch (e) {}
      }
      if ("children" in node) {
        node.children.forEach(child => switchKeyboardsToDark(child));
      }
    }

    frames.forEach(frame => {
      const clone = frame.clone();
      clone.x = frame.x;
      clone.y = frame.y + maxHeight + SECOND_ROW_OFFSET;
      parent.appendChild(clone);
      if (kissCollection && darkMode) {
        clone.setExplicitVariableModeForCollection(kissCollection, darkMode.modeId);
      }
      if (withKeyboard) switchKeyboardsToDark(clone);
      clones.push(clone);
    });

    return clones;
  }

  function resizeSection(section) {
    const frames = getFrames(section.children);
    if (frames.length === 0) return;

    const minX = Math.min(...frames.map(f => f.x));
    const minY = Math.min(...frames.map(f => f.y));
    const maxX = Math.max(...frames.map(f => f.x + f.width));
    const maxY = Math.max(...frames.map(f => f.y + f.height));

    section.resizeWithoutConstraints(
      maxX - minX + PADDING * 2,
      maxY - minY + PADDING * 2
    );
  }

  if (sel.length === 1 && sel[0].type === "SECTION") {

    const section = sel[0];
    const allFrames = getFrames(section.children);

    if (allFrames.length === 0) {
      message = "В секции нет фреймов";
    } else {

      const minY = Math.min(...allFrames.map(f => f.y));
      const maxHeight = Math.max(...allFrames.map(f => f.height));

      const topRowFrames = allFrames.filter(
        f => f.y <= minY + maxHeight / 2
      );

      const topMaxHeight = Math.max(...topRowFrames.map(f => f.height));

      removeSecondRow(section, minY + topMaxHeight + 1);

      section.resizeWithoutConstraints(
        section.width + EXTRA,
        section.height + EXTRA
      );

      alignTopRow(topRowFrames);

      let secondRow = [];

      if (topMaxHeight > 960) {
        secondRow = await duplicateSecondRow(topRowFrames, section);
      }

      resizeSection(section);

      message = secondRow.length > 0 ? "Готово ✅" : "Фреймы выровнены ✅";
    }

  } else if (sel.length > 0) {

    const framesToWrap = getFrames(sel);

    if (framesToWrap.length === 0) {
      message = "Выделите хотя бы один фрейм";
    } else {

      const newSection = figma.createSection();
      newSection.name = "Экраны";
      figma.currentPage.appendChild(newSection);

      newSection.x = Math.min(...framesToWrap.map(f => f.x)) - PADDING;
      newSection.y = Math.min(...framesToWrap.map(f => f.y)) - PADDING;

      framesToWrap.forEach(f => newSection.appendChild(f));

      alignTopRow(framesToWrap);

      const topMaxHeight = Math.max(...framesToWrap.map(f => f.height));

      let secondRow = [];

      if (topMaxHeight > 960) {
        secondRow = await duplicateSecondRow(framesToWrap, newSection);
      }

      resizeSection(newSection);

      message = secondRow.length > 0 ? "Готово ✅" : "Секция создана и выровнена ✅";
    }

  } else {
    message = "Выделите секцию или фреймы";
  }

  if (waitNotify) waitNotify.cancel();
  figma.notify(message);
  tryClose();
}

// ============================
// 3️⃣ Wrap Objects in Section
// ============================
function wrapObjectsInSection() {
  const INNER_PADDING = 1;
  const GAP = 80;
  const SECTION_PADDING = 100;

  const selection = figma.currentPage.selection;

  if (!selection || selection.length === 0) {
    figma.notify("Выделите хотя бы один объект");
    tryClose();
    return;
  }

  const verticalWrapper = figma.createFrame();
  verticalWrapper.name = 'Vertical Auto-layout Wrapper';
  verticalWrapper.fills = [];
  verticalWrapper.clipsContent = false;

  verticalWrapper.layoutMode = 'VERTICAL';
  verticalWrapper.primaryAxisSizingMode = 'AUTO';
  verticalWrapper.counterAxisSizingMode = 'AUTO';
  verticalWrapper.itemSpacing = GAP;
  verticalWrapper.paddingTop = INNER_PADDING;
  verticalWrapper.paddingBottom = INNER_PADDING;
  verticalWrapper.paddingLeft = INNER_PADDING;
  verticalWrapper.paddingRight = INNER_PADDING;

  figma.currentPage.appendChild(verticalWrapper);

  selection.forEach(node => {
    const isRotated = Math.abs(node.rotation) > 0.01;

    // Сохраняем данные ДО перемещения в wrapper
    const bbox  = node.absoluteBoundingBox;
    const absT  = node.absoluteTransform;
    const nodeW = isRotated ? Math.round(bbox.width)  : node.width;
    const nodeH = isRotated ? Math.round(bbox.height) : node.height;

    // Смещение: transform origin относительно левого верхнего угла bounding box
    const offsetX = isRotated ? absT[0][2] - bbox.x : 0;
    const offsetY = isRotated ? absT[1][2] - bbox.y : 0;

    const wrapper = figma.createFrame();
    wrapper.name = node.name;
    wrapper.fills = [];
    wrapper.clipsContent = false;
    wrapper.resize(nodeW + INNER_PADDING * 2, nodeH + INNER_PADDING * 2);
    wrapper.appendChild(node);

    // Для повёрнутых: ставим origin так, чтобы visual bbox начался в (INNER_PADDING, INNER_PADDING)
    node.x = INNER_PADDING + offsetX;
    node.y = INNER_PADDING + offsetY;

    verticalWrapper.appendChild(wrapper);
  });

  const wrappers = [...verticalWrapper.children];
  wrappers.forEach(wrapper => {
    const abs = wrapper.absoluteTransform;
    wrapper.x = abs[0][2];
    wrapper.y = abs[1][2];
    figma.currentPage.appendChild(wrapper);
  });
  verticalWrapper.remove();

  const section = figma.createSection();
  section.name = "Нарезка";
  figma.currentPage.appendChild(section);

  let currentY = SECTION_PADDING;
  let maxWidth = 0;

  wrappers.forEach(wrapper => {
    section.appendChild(wrapper);
    wrapper.x = SECTION_PADDING;
    wrapper.y = currentY;

    currentY += wrapper.height + GAP;
    maxWidth = Math.max(maxWidth, wrapper.width);
  });

  section.resizeWithoutConstraints(maxWidth + SECTION_PADDING * 2, currentY - GAP + SECTION_PADDING);

  figma.viewport.scrollAndZoomIntoView([section]);
  figma.notify("Нарезка завершена ✅");
  tryClose();
}

// ============================
// ✂️ Нарезка с масштабом 2.67 (округление до чётных)
// ============================
function scaleSelection267() {
  const GAP = 80;
  const SECTION_PADDING = 100;
  const SCALE = 2.67;

  const selection = figma.currentPage.selection;
  if (!selection || selection.length === 0) {
    figma.notify("Выделите хотя бы один объект");
    tryClose();
    return;
  }

  function roundEven(val) {
    return Math.round(val / 2) * 2;
  }

  selection.forEach(node => {
    node.rescale(SCALE);
    const evenW = roundEven(node.width);
    const evenH = roundEven(node.height);
    node.resize(evenW, evenH);
  });

  const section = figma.createSection();
  section.name = "Нарезка / Сервер";
  figma.currentPage.appendChild(section);

  let currentY = SECTION_PADDING;
  let maxWidth = 0;

  const nodes = [...selection];
  nodes.forEach(node => {
    section.appendChild(node);
    node.x = SECTION_PADDING;
    node.y = currentY;
    currentY += node.height + GAP;
    maxWidth = Math.max(maxWidth, node.width);
  });

  section.resizeWithoutConstraints(maxWidth + SECTION_PADDING * 2, currentY - GAP + SECTION_PADDING);

  figma.viewport.scrollAndZoomIntoView([section]);
  figma.notify("Нарезка 2.67 завершена ✅");
  tryClose();
}

// ============================
// ✂️ Server Icons — нарезка в 3 размерах
// ============================
function createServerIcons() {
  const INNER_PADDING = 1;
  const GAP = 40;
  const SECTION_PADDING = 100;
  const SIZES = [80, 120, 240];

  const selection = figma.currentPage.selection;
  if (!selection || selection.length === 0) {
    figma.notify("Выделите хотя бы один объект");
    tryClose();
    return;
  }

  const section = figma.createSection();
  section.name = "Нарезка / Продукт";
  figma.currentPage.appendChild(section);

  let currentY = SECTION_PADDING;
  let maxRowWidth = 0;

  selection.forEach(node => {
    const isRotated = Math.abs(node.rotation) > 0.01;
    const bbox  = node.absoluteBoundingBox;
    const nodeW = isRotated ? Math.round(bbox.width)  : node.width;
    const nodeH = isRotated ? Math.round(bbox.height) : node.height;
    const offsetX = isRotated ? node.absoluteTransform[0][2] - bbox.x : 0;
    const offsetY = isRotated ? node.absoluteTransform[1][2] - bbox.y : 0;

    // Обёртка с отступом 1px
    const wrapper = figma.createFrame();
    wrapper.name = node.name;
    wrapper.fills = [];
    wrapper.clipsContent = false;
    wrapper.resize(nodeW + INNER_PADDING * 2, nodeH + INNER_PADDING * 2);
    wrapper.appendChild(node);
    node.x = INNER_PADDING + offsetX;
    node.y = INNER_PADDING + offsetY;
    figma.currentPage.appendChild(wrapper);

    // Создаём 3 копии в нужных размерах
    let currentX = SECTION_PADDING;
    let rowHeight = 0;

    SIZES.forEach(size => {
      const clone = wrapper.clone();
      const scale = size / Math.max(clone.width, clone.height);
      clone.rescale(scale);
      section.appendChild(clone);
      clone.x = currentX;
      clone.y = currentY;
      currentX += clone.width + GAP;
      rowHeight = Math.max(rowHeight, clone.height);
    });

    maxRowWidth = Math.max(maxRowWidth, currentX - GAP);
    currentY += rowHeight + GAP;

    // Удаляем исходную обёртку (вместе с оригинальным объектом)
    wrapper.remove();
  });

  section.resizeWithoutConstraints(
    maxRowWidth + SECTION_PADDING * 2,
    currentY - GAP + SECTION_PADDING
  );

  figma.viewport.scrollAndZoomIntoView([section]);
  figma.notify("Готово ✅");
  tryClose();
}

// ============================
// 4️⃣ Art Text Resize (MULTI)
// ============================

function roundToEvenDown(num) {
  let rounded = Math.floor(num);
  if (rounded % 2 !== 0) rounded += 1;
  return rounded;
}

async function artTextResize() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify("Сначала выдели картинку/арт, потом первый размер, потом второй");
    tryClose();
    return;
  }

  const objects = selection.filter(node => node.type !== "TEXT");
  const texts = selection.filter(node => node.type === "TEXT");

  if (objects.length === 0) {
    figma.notify("Нет объектов для расчёта");
    tryClose();
    return;
  }

  if (texts.length !== objects.length * 2) {
    figma.notify("На каждый объект должно быть 2 текстовых слоя");
    tryClose();
    return;
  }

  const templates = [160, 320, 540];

  for (let i = 0; i < objects.length; i++) {

    const objectNode = objects[i];
    const textNode1 = texts[i * 2];
    const textNode2 = texts[i * 2 + 1];

    await figma.loadFontAsync(textNode1.fontName);
    await figma.loadFontAsync(textNode2.fontName);

    const width = objectNode.width;
    const height = objectNode.height;

    // ----------------------------
    // 1️⃣ Первый текст — реальные размеры
    // ----------------------------
    textNode1.characters =
      Math.round(width) + "x" + Math.round(height) + "px";

    // ----------------------------
    // 2️⃣ Расчёт размеров для Арта
    // ----------------------------
    let targetWidth;
    let targetHeight;
    let scaleMultiplier = 3;

    // 🔥 НОВАЯ ЛОГИКА:
    // объект маленький ТОЛЬКО если обе стороны <= 160
    if (width <= 160 && height <= 160) {
      targetWidth = 160;
      targetHeight = (height / width) * 160;

    } else {
      // Выбираем ближайший template
      targetWidth = templates[templates.length - 1];

      for (let j = 0; j < templates.length; j++) {
        if (width <= templates[j]) {
          targetWidth = templates[j];
          break;
        }
      }

      const scale = targetWidth / width;
      targetHeight = height * scale;
    }

    const finalWidth = roundToEvenDown(targetWidth * scaleMultiplier);
    const finalHeight = roundToEvenDown(targetHeight * scaleMultiplier);

    // ----------------------------
    // 3️⃣ Второй текст — размеры для Арта
    // ----------------------------
    textNode2.characters =
      finalWidth + "x" + finalHeight + "px";
  }

  figma.notify("Все размеры проставлены ✅");
  tryClose();
}



// ============================
// Обернуть или выровнять секцию (без дублей)
// ============================
function wrapOrAlignSectionClean() {
  const GAP = 80;
  const PADDING = 100;

  const sel = figma.currentPage.selection;
  if (!sel.length) {
    figma.notify("Выделите секцию или фреймы");
    tryClose();
    return;
  }

  function getFrames(nodes) {
    return nodes.filter(n => "x" in n && "y" in n && "width" in n && "height" in n);
  }

  // Выравнивание по принципу твоей alignRow
  function alignRowUniversal(frames, orientation) {
    if (!frames.length) return;

    let sorted;
    if (orientation === "vertical") {
      sorted = [...frames].sort((a, b) => a.y - b.y); // сортируем по Y
      let currentY = PADDING;
      sorted.forEach(f => {
        f.x = PADDING; // левый край
        f.y = currentY;
        currentY += f.height + GAP;
      });
    } else {
      sorted = [...frames].sort((a, b) => a.x - b.x); // сортируем по X
      let currentX = PADDING;
      sorted.forEach(f => {
        f.x = currentX;
        f.y = PADDING; // верхний край
        currentX += f.width + GAP;
      });
    }
  }

  function resizeSection(section) {
    const frames = getFrames(section.children);
    if (!frames.length) return;

    const minX = Math.min(...frames.map(f => f.x));
    const minY = Math.min(...frames.map(f => f.y));
    const maxX = Math.max(...frames.map(f => f.x + f.width));
    const maxY = Math.max(...frames.map(f => f.y + f.height));

    section.resizeWithoutConstraints(
      maxX - minX + PADDING * 2,
      maxY - minY + PADDING * 2
    );
  }

  // === Если выделена секция ===
  if (sel.length === 1 && sel[0].type === "SECTION") {
    const section = sel[0];
    const frames = getFrames(section.children);
    if (!frames.length) {
      figma.notify("В секции нет фреймов");
    } else {
      const orientation = section.width >= section.height ? "horizontal" : "vertical";
      alignRowUniversal(frames, orientation); // принцип alignRow
      resizeSection(section);
      figma.notify(`Секция выровнена ${orientation} ✅`);
    }
  } 
  // === Если выделены фреймы ===
  else {
    const framesToWrap = getFrames(sel);
    if (!framesToWrap.length) {
      figma.notify("Выделите хотя бы один фрейм");
      tryClose();
      return;
    }

    // Определяем ориентацию по разбросу центров фреймов ДО перемещения в секцию
    const centersX = framesToWrap.map(f => f.x + f.width / 2);
    const centersY = framesToWrap.map(f => f.y + f.height / 2);
    const spreadX = Math.max(...centersX) - Math.min(...centersX);
    const spreadY = Math.max(...centersY) - Math.min(...centersY);
    const orientation = spreadX >= spreadY ? "horizontal" : "vertical";

    const section = figma.createSection();
    section.name = "Экраны";
    figma.currentPage.appendChild(section);
    section.x = Math.min(...framesToWrap.map(f => f.x)) - PADDING;
    section.y = Math.min(...framesToWrap.map(f => f.y)) - PADDING;

    // Перемещаем фреймы в секцию без сортировки — порядок сохраняется
    framesToWrap.forEach(f => section.appendChild(f));

    alignRowUniversal(framesToWrap, orientation); // принцип alignRow
    resizeSection(section);

    figma.currentPage.selection = [section];
    figma.notify(`Секция создана и выровнена ${orientation} ✅`);
  }

  tryClose();
}

// ============================================
// ⚡ ВЫРОВНЯТЬ ВСЕ СЕКЦИИ С КОМПОНЕНТОМ В СВОЕМ РЯДУ
// ============================================
function alignAllSections() {
  const SECTION_GAP = 240;
  const ROW_GAP = 240;

  function isVisible(n) { return n && n.visible !== false; }
  function isUnlocked(n) { return n && !n.locked; }

  // 1️⃣ Берём только корневые секции
  const sections = figma.currentPage.children.filter(
    n => n.type === "SECTION" && isVisible(n) && isUnlocked(n)
  );

  if (sections.length === 0) {
    figma.notify("Нет доступных секций для выравнивания");
    tryClose();
    return;
  }

  // 2️⃣ Выделяем секцию компонентов
  const componentNames = [
    "Компоненты", "Components", "Local Components",
    "Локальные Компоненты", "Локальные компоненты", "Local сomponents"
  ];

  let componentSection = null;
  const otherSections = [];

  for (const s of sections) {
    if (componentNames.includes(s.name)) {
      componentSection = s;
    } else {
      otherSections.push(s);
    }
  }

  // 3️⃣ Создаём proxy для остальных секций
  const proxies = otherSections.map(section => {
    const proxy = figma.createFrame();
    proxy.name = "__proxy__";
    proxy.layoutMode = "NONE";
    proxy.resize(section.width, section.height);
    proxy.x = section.x;
    proxy.y = section.y;
    return { section, proxy };
  });

  // 4️⃣ Группируем секции по рядам (F-паттерн)
  function groupByRows(items) {
    const rows = [];
    items.sort((a, b) => a.proxy.y - b.proxy.y);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (i === 0) {
        rows.push({ items: [item], anchorY: item.proxy.y });
        continue;
      }
      const prevRow = rows[rows.length - 1];
      const prevItem = prevRow.items[prevRow.items.length - 1];
      if (item.proxy.y - prevItem.proxy.y > prevItem.proxy.height / 2) {
        rows.push({ items: [item], anchorY: item.proxy.y });
      } else {
        prevRow.items.push(item);
      }
    }
    return rows;
  }

  const rows = groupByRows(proxies);

  // 5️⃣ Вычисляем позиции по F-паттерну
  function layoutRow(row, startY) {
    row.sort((a, b) => a.proxy.x - b.proxy.x);
    let currentX = 0;
    let maxHeight = 0;
    for (const item of row) {
      item.proxy.x = currentX;
      item.proxy.y = startY;
      currentX += item.proxy.width + SECTION_GAP;
      maxHeight = Math.max(maxHeight, item.proxy.height);
    }
    return maxHeight;
  }

  let currentY = rows.length ? rows[0].anchorY : 0;
  for (const row of rows) {
    const h = layoutRow(row.items, currentY);
    currentY += h + ROW_GAP;
  }

  // 6️⃣ Применяем позиции к секциям
  for (const { section, proxy } of proxies) {
    section.x = proxy.x;
    section.y = proxy.y;
  }

  // 7️⃣ Удаляем proxy
  for (const { proxy } of proxies) {
    proxy.remove();
  }

  // 8️⃣ Вставляем секцию компонентов в её ряд
  if (componentSection) {
    // Найти ряд, к которому относится компонент-секция
    // Берём все секции и ищем ближайшую по Y
    const nearestRow = otherSections.reduce((nearest, s) => {
      const distance = Math.abs(s.y - componentSection.y);
      if (!nearest || distance < nearest.distance) {
        return { section: s, distance };
      }
      return nearest;
    }, null);

    // Если есть хотя бы одна секция в ряду, выравниваем компонент левее всех в этом ряду
    if (nearestRow) {
      // Составляем все секции в том же ряду (по близости Y)
      const rowSections = otherSections.filter(s =>
        Math.abs(s.y - nearestRow.section.y) <= nearestRow.section.height / 2
      );

      const minX = Math.min(...rowSections.map(s => s.x));
      componentSection.x = minX - componentSection.width - SECTION_GAP;
      componentSection.y = nearestRow.section.y; // выравниваем по верхнему краю ряда
    }
  }

  figma.notify(`⚡ Готово! Перестроено секций: ${sections.length}`);
  tryClose();
}
// ============================
// Создать тег "Средний приоритет"
// ============================
async function createMediumTag() {
  try {
    const selection = figma.currentPage.selection;

    if (!selection || selection.length === 0) {
      figma.notify("⚠️ Выделите объект");
      tryClose();
      return;
    }

    const target = selection[0];

    // ============================
    // ЕСЛИ ЭТО УЖЕ ОДИН ИЗ НАШИХ ТЕГОВ
    // ============================
    if (
      target.name === "FloatingNote" ||
      target.name === "FloatingUrgent" ||
      target.name === "FloatingDone" ||
      target.name === "FloatingReview"
    ) {

      const iconFrame = target.children[0];
      const textFrame = target.children[1];

      if (!iconFrame || !textFrame) {
        figma.notify("⚠️ Неверная структура тега");
        tryClose();
        return;
      }

      const iconText = iconFrame.children[0];
      const labelText = textFrame.children[0];

      await figma.loadFontAsync({ family: "Montserrat", style: "Bold" });

      const orange = { r: 1, g: 0.694, b: 0.325 };

      // --- иконка ---
      iconFrame.fills = [{ type: "SOLID", color: orange, opacity: 0.2 }];
      iconText.characters = "⚠️";
      iconText.fills = [{ type: "SOLID", color: { r: 0.341, g: 0.137, b: 0 } }];

      // --- текстовый блок ---
      textFrame.fills = [{ type: "SOLID", color: orange }];
      labelText.fills = [{ type: "SOLID", color: { r: 0.341, g: 0.137, b: 0 } }];

      target.name = "FloatingNote";

      figma.notify("✅ Приоритет обновлён");

      tryClose();
      return;
    }

    // ============================
    // ИНАЧЕ СОЗДАЁМ НОВЫЙ ТЕГ
    // ============================

    const posX = target.x;
    const posY = target.y;

    if (target.remove) {
      target.remove();
    }

    await figma.loadFontAsync({ family: "Montserrat", style: "Bold" });

    const orange = { r: 1, g: 0.694, b: 0.325 };

    const parent = figma.createFrame();
    parent.name = "FloatingNote";
    parent.layoutMode = "HORIZONTAL";
    parent.primaryAxisSizingMode = "AUTO";
    parent.counterAxisSizingMode = "AUTO";
    parent.itemSpacing = 24;
    parent.fills = [];
    parent.x = posX;
    parent.y = posY;

    const iconFrame = figma.createFrame();
    iconFrame.layoutMode = "HORIZONTAL";
    iconFrame.resize(164, 164);
    iconFrame.cornerRadius = 24;
    iconFrame.fills = [{ type: "SOLID", color: orange, opacity: 0.2 }];
    iconFrame.primaryAxisAlignItems = "CENTER";
    iconFrame.counterAxisAlignItems = "CENTER";

    const iconText = figma.createText();
    iconText.fontName = { family: "Montserrat", style: "Bold" };
    iconText.fontSize = 96;
    iconText.characters = "⚠️";
    iconText.fills = [{ type: "SOLID", color: { r: 0.341, g: 0.137, b: 0 } }];

    iconFrame.appendChild(iconText);

    const textFrame = figma.createFrame();
    textFrame.layoutMode = "HORIZONTAL";
    textFrame.primaryAxisSizingMode = "AUTO";
    textFrame.counterAxisSizingMode = "AUTO";
    textFrame.paddingLeft = 48;
    textFrame.paddingRight = 48;
    textFrame.paddingTop = 48;
    textFrame.paddingBottom = 48;
    textFrame.cornerRadius = 24;
    textFrame.fills = [{ type: "SOLID", color: orange }];

    const labelText = figma.createText();
    labelText.fontName = { family: "Montserrat", style: "Bold" };
    labelText.fontSize = 56;
    labelText.characters = "Средний приоритет";
    labelText.fills = [{ type: "SOLID", color: { r: 0.341, g: 0.137, b: 0 } }];

    textFrame.appendChild(labelText);
    textFrame.layoutGrow = 1;

    parent.appendChild(iconFrame);
    parent.appendChild(textFrame);

    figma.currentPage.appendChild(parent);
    parent.resize(920, parent.height);

    figma.currentPage.selection = [labelText];

    figma.notify("✅ Тег добавлен");

    tryClose();

  } catch (err) {
    figma.notify("❌ Ошибка: " + (err.message || err));
    tryClose();
  }
}
// ============================
// Создать Срочный тег с иконкой и текстом
// ============================
async function createUrgentTag() {
  try {
    const selection = figma.currentPage.selection;

    if (!selection || selection.length === 0) {
      figma.notify("⚠️ Выделите объект");
      tryClose();
      return;
    }

    const target = selection[0];

    // ============================
    // ЕСЛИ ЭТО УЖЕ ОДИН ИЗ НАШИХ ТЕГОВ
    // ============================
    if (
      target.name === "FloatingNote" ||
      target.name === "FloatingUrgent" ||
      target.name === "FloatingDone" ||
      target.name === "FloatingReview"
    ) {

      const iconFrame = target.children[0];
      const textFrame = target.children[1];

      if (!iconFrame || !textFrame) {
        figma.notify("⚠️ Неверная структура тега");
        tryClose();
        return;
      }

      const iconText = iconFrame.children[0];
      const labelText = textFrame.children[0];

      await figma.loadFontAsync({ family: "Montserrat", style: "Bold" });

      const red = { r: 1, g: 0.165, b: 0 };

      iconFrame.fills = [{ type: "SOLID", color: red, opacity: 0.2 }];
      iconText.characters = "⏰";
      iconText.fills = [{ type: "SOLID", color: red }];

      textFrame.fills = [{ type: "SOLID", color: red }];
      labelText.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];

      target.name = "FloatingUrgent";

      figma.notify("✅ Приоритет обновлён");

      tryClose();
      return;
    }

    const posX = target.x;
    const posY = target.y;

    if (target.remove) {
      target.remove();
    }

    await figma.loadFontAsync({ family: "Montserrat", style: "Bold" });

    const red = { r: 1, g: 0.165, b: 0 };

    const parent = figma.createFrame();
    parent.name = "FloatingUrgent";
    parent.layoutMode = "HORIZONTAL";
    parent.primaryAxisSizingMode = "AUTO";
    parent.counterAxisSizingMode = "AUTO";
    parent.itemSpacing = 24;
    parent.fills = [];
    parent.x = posX;
    parent.y = posY;

    const iconFrame = figma.createFrame();
    iconFrame.layoutMode = "HORIZONTAL";
    iconFrame.resize(164, 164);
    iconFrame.cornerRadius = 24;
    iconFrame.fills = [{ type: "SOLID", color: red, opacity: 0.2 }];
    iconFrame.primaryAxisAlignItems = "CENTER";
    iconFrame.counterAxisAlignItems = "CENTER";

    const iconText = figma.createText();
    iconText.fontName = { family: "Montserrat", style: "Bold" };
    iconText.fontSize = 96;
    iconText.characters = "⏰";
    iconText.fills = [{ type: "SOLID", color: red }];

    iconFrame.appendChild(iconText);

    const textFrame = figma.createFrame();
    textFrame.layoutMode = "HORIZONTAL";
    textFrame.primaryAxisSizingMode = "AUTO";
    textFrame.counterAxisSizingMode = "AUTO";
    textFrame.paddingLeft = 48;
    textFrame.paddingRight = 48;
    textFrame.paddingTop = 48;
    textFrame.paddingBottom = 48;
    textFrame.cornerRadius = 24;
    textFrame.fills = [{ type: "SOLID", color: red }];

    const labelText = figma.createText();
    labelText.fontName = { family: "Montserrat", style: "Bold" };
    labelText.fontSize = 56;
    labelText.characters = "Высокий приоритет";
    labelText.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];

    textFrame.appendChild(labelText);
    textFrame.layoutGrow = 1;

    parent.appendChild(iconFrame);
    parent.appendChild(textFrame);

    figma.currentPage.appendChild(parent);
    parent.resize(920, parent.height);

    figma.currentPage.selection = [labelText];

    figma.notify("✅ Срочный тег добавлен");

    tryClose();

  } catch (err) {
    figma.notify("❌ Ошибка: " + (err.message || err));
    tryClose();
  }
}
// ============================
// Создать или обновить тег "Задача выполнена"
// ============================
async function createDoneTag() {
  try {

    const selection = figma.currentPage.selection;

    if (!selection || selection.length === 0) {
      figma.notify("⚠️ Выделите объект");
      tryClose();
      return;
    }

    const target = selection[0];

    const frameColor = { r: 0.0157, g: 1, b: 0 };   // #04FF00
    const textColor = { r: 0.078, g: 0.733, b: 0.067 }; // #14BB11

    await figma.loadFontAsync({ family: "Montserrat", style: "Bold" });

    // ============================
    // ЕСЛИ ВЫДЕЛЕН УЖЕ ТЕГ
    // ============================
    if (
      target.name === "FloatingNote" ||
      target.name === "FloatingUrgent" ||
      target.name === "FloatingDone" ||
      target.name === "FloatingReview"
    ) {

      const iconFrame = target.children[0];
      const textFrame = target.children[1];

      if (!iconFrame || !textFrame) {
        figma.notify("⚠️ Неверная структура тега");
        tryClose();
        return;
      }

      const iconText = iconFrame.children[0];
      const labelText = textFrame.children[0];

      // иконка
      iconFrame.fills = [{
        type: "SOLID",
        color: frameColor,
        opacity: 0.15
      }];

      iconText.characters = "✅";
      iconText.fills = [{ type: "SOLID", color: textColor }];

      // текстовый блок
      textFrame.fills = [{
        type: "SOLID",
        color: frameColor,
        opacity: 0.15
      }];

      // текст НЕ меняем
      labelText.fills = [{ type: "SOLID", color: textColor }];

      target.name = "FloatingDone";

      figma.notify("✅ Тег обновлён");

      tryClose();
      return;
    }

    // ============================
    // СОЗДАНИЕ НОВОГО ТЕГА
    // ============================

    const posX = target.x;
    const posY = target.y;

    if (target.remove) {
      target.remove();
    }

    const parent = figma.createFrame();
    parent.name = "FloatingDone";
    parent.layoutMode = "HORIZONTAL";
    parent.primaryAxisSizingMode = "AUTO";
    parent.counterAxisSizingMode = "AUTO";
    parent.itemSpacing = 24;
    parent.fills = [];
    parent.x = posX;
    parent.y = posY;

    // --- FRAME ИКОНКИ ---

    const iconFrame = figma.createFrame();
    iconFrame.layoutMode = "HORIZONTAL";
    iconFrame.resize(164, 164);
    iconFrame.cornerRadius = 24;

    iconFrame.fills = [{
      type: "SOLID",
      color: frameColor,
      opacity: 0.15
    }];

    iconFrame.primaryAxisAlignItems = "CENTER";
    iconFrame.counterAxisAlignItems = "CENTER";

    const iconText = figma.createText();
    iconText.fontName = { family: "Montserrat", style: "Bold" };
    iconText.fontSize = 96;
    iconText.characters = "✅";
    iconText.fills = [{ type: "SOLID", color: textColor }];

    iconFrame.appendChild(iconText);

    // --- FRAME ТЕКСТА ---

    const textFrame = figma.createFrame();
    textFrame.layoutMode = "HORIZONTAL";
    textFrame.primaryAxisSizingMode = "AUTO";
    textFrame.counterAxisSizingMode = "AUTO";

    textFrame.paddingLeft = 48;
    textFrame.paddingRight = 48;
    textFrame.paddingTop = 48;
    textFrame.paddingBottom = 48;

    textFrame.cornerRadius = 24;

    textFrame.fills = [{
      type: "SOLID",
      color: frameColor,
      opacity: 0.15
    }];

    const labelText = figma.createText();
    labelText.fontName = { family: "Montserrat", style: "Bold" };
    labelText.fontSize = 56;
    labelText.characters = "Задача выполнена";
    labelText.fills = [{ type: "SOLID", color: textColor }];

    textFrame.appendChild(labelText);
    textFrame.layoutGrow = 1;

    parent.appendChild(iconFrame);
    parent.appendChild(textFrame);

    figma.currentPage.appendChild(parent);
    parent.resize(920, parent.height);

    figma.currentPage.selection = [labelText];

    figma.notify("✅ Тег добавлен");

    tryClose();

  } catch (err) {
    figma.notify("❌ Ошибка: " + (err.message || err));
    tryClose();
  }
}


// ============================
// Создать или обновить тег "На ревью"
// ============================
async function createReviewTag() {
  try {
    const selection = figma.currentPage.selection;

    if (!selection || selection.length === 0) {
      figma.notify("⚠️ Выделите объект");
      tryClose();
      return;
    }

    const target = selection[0];

    const blue      = { r: 0.427, g: 0.588, b: 1.0   }; // #6D96FF
    const textColor = { r: 0.098, g: 0.188, b: 0.416 }; // #19306A

    await figma.loadFontAsync({ family: "Montserrat", style: "Bold" });

    if (
      target.name === "FloatingNote" ||
      target.name === "FloatingUrgent" ||
      target.name === "FloatingDone" ||
      target.name === "FloatingReview"
    ) {
      const iconFrame = target.children[0];
      const textFrame = target.children[1];

      if (!iconFrame || !textFrame) {
        figma.notify("⚠️ Неверная структура тега");
        tryClose();
        return;
      }

      const iconText  = iconFrame.children[0];
      const labelText = textFrame.children[0];

      iconFrame.fills = [{ type: "SOLID", color: blue, opacity: 0.2 }];
      iconText.characters = "⚙️";
      iconText.fills = [{ type: "SOLID", color: textColor }];

      textFrame.fills = [{ type: "SOLID", color: blue }];
      labelText.characters = "На ревью";
      labelText.fills = [{ type: "SOLID", color: textColor }];

      target.name = "FloatingReview";
      figma.notify("✅ Тег обновлён");
      tryClose();
      return;
    }

    const posX = target.x;
    const posY = target.y;

    if (target.remove) target.remove();

    const parent = figma.createFrame();
    parent.name = "FloatingReview";
    parent.layoutMode = "HORIZONTAL";
    parent.primaryAxisSizingMode = "AUTO";
    parent.counterAxisSizingMode = "AUTO";
    parent.itemSpacing = 24;
    parent.fills = [];
    parent.x = posX;
    parent.y = posY;

    const iconFrame = figma.createFrame();
    iconFrame.layoutMode = "HORIZONTAL";
    iconFrame.resize(164, 164);
    iconFrame.cornerRadius = 24;
    iconFrame.fills = [{ type: "SOLID", color: blue, opacity: 0.2 }];
    iconFrame.primaryAxisAlignItems = "CENTER";
    iconFrame.counterAxisAlignItems = "CENTER";

    const iconText = figma.createText();
    iconText.fontName = { family: "Montserrat", style: "Bold" };
    iconText.fontSize = 96;
    iconText.characters = "⚙️";
    iconText.fills = [{ type: "SOLID", color: textColor }];
    iconFrame.appendChild(iconText);

    const textFrame = figma.createFrame();
    textFrame.layoutMode = "HORIZONTAL";
    textFrame.primaryAxisSizingMode = "AUTO";
    textFrame.counterAxisSizingMode = "AUTO";
    textFrame.paddingLeft = 48;
    textFrame.paddingRight = 48;
    textFrame.paddingTop = 48;
    textFrame.paddingBottom = 48;
    textFrame.cornerRadius = 24;
    textFrame.fills = [{ type: "SOLID", color: blue }];

    const labelText = figma.createText();
    labelText.fontName = { family: "Montserrat", style: "Bold" };
    labelText.fontSize = 56;
    labelText.characters = "На ревью";
    labelText.fills = [{ type: "SOLID", color: textColor }];

    textFrame.appendChild(labelText);
    textFrame.layoutGrow = 1;

    parent.appendChild(iconFrame);
    parent.appendChild(textFrame);

    figma.currentPage.appendChild(parent);
    parent.resize(920, parent.height);

    figma.currentPage.selection = [labelText];
    figma.notify("✅ Тег добавлен");
    tryClose();

  } catch (err) {
    figma.notify("❌ Ошибка: " + (err.message || err));
    tryClose();
  }
}

// ============================
// Find Similar — Найти похожие
// ============================
function findSimilar(sectionOnly) {
  const selection = figma.currentPage.selection;

  if (selection.length !== 1) {
    figma.notify("Выдели один объект");
    tryClose();
    return;
  }

  const target = selection[0];
  const targetName = target.name;
  const targetWidth = Math.round(target.width);
  const targetHeight = Math.round(target.height);

  // Если sectionOnly — ищем родительскую секцию
  let searchRoot = figma.currentPage;
  if (sectionOnly) {
    let parent = target.parent;
    while (parent && parent.type !== "SECTION") parent = parent.parent;
    if (parent && parent.type === "SECTION") {
      searchRoot = parent;
    } else {
      figma.notify("Объект не внутри секции");
      tryClose();
      return;
    }
  }

  const searchNotify = figma.notify("Идет поиск, подождите...", { timeout: Infinity });

  setTimeout(() => {
    searchNotify.cancel();
    const candidates = searchRoot.findAllWithCriteria({ types: [target.type] });

    const matches = candidates.filter(node =>
      node.name === targetName &&
      Math.round(node.width) === targetWidth &&
      Math.round(node.height) === targetHeight
    );

    if (matches.length <= 1) {
      figma.notify("Похожих объектов не найдено");
      tryClose();
      return;
    }

    figma.currentPage.selection = matches;
    figma.viewport.scrollAndZoomIntoView(matches);
    figma.notify(`Найдено ${matches.length} похожих объектов`);
    tryClose();
  }, 50);
}



// ============================
// Expand Section — Увеличить секцию
// ============================
function expandSection(duplicate = true) {
  const selection = figma.currentPage.selection;

  if (selection.length !== 1) {
    figma.notify("Выдели одну секцию или фрейм");
    tryClose();
    return;
  }

  const node = selection[0];

  // Если выделен фрейм внутри секции — дублируем вправо
  if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE") {
    const frame = node;
    const section = frame.parent;

    if (!section || section.type !== "SECTION") {
      figma.notify("Фрейм должен быть внутри секции");
      tryClose();
      return;
    }

    const GAP = 80;
    const expandBy = frame.width + GAP;
    const originalRight = section.x + section.width;

    section.resizeWithoutConstraints(section.width + expandBy, section.height);

    section.children
      .filter(c =>
        (c.type === "FRAME" || c.type === "COMPONENT" || c.type === "INSTANCE") &&
        c.id !== frame.id &&
        c.x > frame.x
      )
      .forEach(c => { c.x += expandBy; });

    if (duplicate) {
      const clone = frame.clone();
      clone.x = frame.x + frame.width + GAP;
      clone.y = frame.y;
      section.appendChild(clone);
      figma.currentPage.selection = [clone];
    } else {
      figma.currentPage.selection = [section];
    }

    figma.currentPage.children
      .filter(s =>
        s.type === "SECTION" &&
        s.id !== section.id &&
        s.x >= originalRight &&
        s.y < section.y + section.height &&
        s.y + s.height > section.y
      )
      .forEach(s => { s.x += expandBy; });

    figma.notify("Готово ✅");
    tryClose();
    return;
  }

  // Если выделена секция — расширяем вправо на 620 px
  if (node.type !== "SECTION") {
    figma.notify("Выдели одну секцию или фрейм");
    tryClose();
    return;
  }

  const section = node;
  const originalRight = section.x + section.width;

  section.resizeWithoutConstraints(section.width + 620, section.height);

  figma.currentPage.children
    .filter(s =>
      s.type === "SECTION" &&
      s.id !== section.id &&
      s.x >= originalRight &&
      s.y < section.y + section.height &&
      s.y + s.height > section.y
    )
    .forEach(s => { s.x += 620; });

  figma.notify("Секция расширена ✅");
  tryClose();
}

// ============================
// Расширить секцию влево
// ============================
function expandSectionLeft(duplicate = true) {
  const selection = figma.currentPage.selection;

  if (selection.length !== 1) {
    figma.notify("Выдели одну секцию или фрейм");
    tryClose();
    return;
  }

  const node = selection[0];

  // Если выделен фрейм внутри секции — дублируем влево
  if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE") {
    const frame = node;
    const section = frame.parent;

    if (!section || section.type !== "SECTION") {
      figma.notify("Фрейм должен быть внутри секции");
      tryClose();
      return;
    }

    const GAP = 80;
    const expandBy = frame.width + GAP;
    const originalFrameX = frame.x;
    const originalFrameY = frame.y;
    const originalRight = section.x + section.width;

    // Расширяем секцию вправо (левый край не трогаем — правые секции сдвинутся)
    section.resizeWithoutConstraints(section.width + expandBy, section.height);

    // Сдвигаем выделенный фрейм и все правее него вправо
    section.children
      .filter(c =>
        (c.type === "FRAME" || c.type === "COMPONENT" || c.type === "INSTANCE") &&
        c.x >= originalFrameX
      )
      .forEach(c => { c.x += expandBy; });

    if (duplicate) {
      // Клон встаёт на место оригинала — слева от сдвинутого фрейма
      const clone = frame.clone();
      clone.x = originalFrameX;
      clone.y = originalFrameY;
      section.appendChild(clone);
      figma.currentPage.selection = [clone];
    } else {
      figma.currentPage.selection = [section];
    }

    // Сдвигаем секции того же ряда, которые стоят правее (как при расширении вправо)
    figma.currentPage.children
      .filter(s =>
        s.type === "SECTION" &&
        s.id !== section.id &&
        s.x >= originalRight &&
        s.y < section.y + section.height &&
        s.y + s.height > section.y
      )
      .forEach(s => { s.x += expandBy; });

    figma.notify("Готово ✅");
    tryClose();
    return;
  }

  // Если выделена секция — расширяем влево на 620 px
  if (node.type !== "SECTION") {
    figma.notify("Выдели одну секцию или фрейм");
    tryClose();
    return;
  }

  const section = node;
  const originalRight = section.x + section.width;

  section.resizeWithoutConstraints(section.width + 620, section.height);

  section.children.forEach(child => { child.x += 620; });

  figma.currentPage.children
    .filter(s =>
      s.type === "SECTION" &&
      s.id !== section.id &&
      s.x >= originalRight &&
      s.y < section.y + section.height &&
      s.y + s.height > section.y
    )
    .forEach(s => { s.x += 620; });

  figma.notify("Секция расширена ✅");
  tryClose();
}


// ============================
// Ready for Dev
// ============================
function readyForDevSection() {
  const selection = figma.currentPage.selection;
  const allSections = figma.currentPage.children.filter(n => n.type === "SECTION");

  if (allSections.length === 0) {
    figma.notify("Нет секций на странице");
    tryClose();
    return;
  }

  // Если выделены секции — переключаем только их
  const selectedSections = selection.filter(n => n.type === "SECTION");
  if (selectedSections.length > 0) {
    const allReady = selectedSections.every(s => s.devStatus && s.devStatus.type === "READY_FOR_DEV");
    if (allReady) {
      selectedSections.forEach(s => { s.devStatus = null; });
      figma.notify(`Ready for Dev снят (${selectedSections.length}) ✅`);
    } else {
      selectedSections.forEach(s => { s.devStatus = { type: "READY_FOR_DEV" }; });
      figma.notify(`Ready for Dev (${selectedSections.length}) ✅`);
    }
    tryClose();
    return;
  }

  // Ничего не выделено — работаем со всеми секциями
  const allReady = allSections.every(s => s.devStatus && s.devStatus.type === "READY_FOR_DEV");

  if (allReady) {
    allSections.forEach(s => { s.devStatus = null; });
    figma.notify("Ready for Dev снят со всех секций ✅");
  } else {
    allSections.forEach(s => { s.devStatus = { type: "READY_FOR_DEV" }; });
    figma.notify("Все секции — Ready for Dev ✅");
  }

  tryClose();
}

// ============================
// Копировать ссылку на выделение
// ============================
function copyLinkToSelection() {
  const selection = figma.currentPage.selection;

  if (!selection || selection.length === 0) {
    figma.notify("⚠️ Выделите объект");
    tryClose();
    return;
  }

  const nodeId = selection[0].id.replace(":", "-");
  const fileKey = figma.fileKey;

  // Передаём nodeId и fileKey (если есть) в UI — UI достанет fileKey из referrer если нужно
  figma.ui.postMessage({ type: "requestCopyLink", nodeId, fileKey: fileKey || null });
}

// ============================
// Перевод фреймов
// ============================
function translateFrames() {
  const sel = figma.currentPage.selection;
  const frames = sel.filter(n => ["FRAME", "COMPONENT", "INSTANCE"].includes(n.type));
  if (frames.length === 0) {
    figma.notify("Выдели один или несколько фреймов");
    tryClose();
    return;
  }

  // Сортируем по X чтобы порядок был предсказуемым
  frames.sort((a, b) => a.x - b.x || a.y - b.y);

  const SECTION_GAP = 240;
  const GAP = 80;
  const ROW_GAP = 80;
  const PADDING = 100;
  const langs = [
    { name: "Английский", code: "en" },
    { name: "Немецкий", code: "de" },
    { name: "Арабский", code: "ar" }
  ];

  // Найти правый край всех секций
  const sections = figma.currentPage.children.filter(c => c.type === "SECTION");
  const maxRight = sections.length > 0
    ? Math.max(...sections.map(s => s.x + s.width))
    : 0;

  // Создать секцию
  const section = figma.createSection();
  section.name = "Адаптация для разных языков";
  figma.currentPage.appendChild(section);
  section.x = maxRight + SECTION_GAP;
  section.y = sections.length > 0 ? Math.min(...sections.map(s => s.y)) : 0;

  // Клонировать фреймы — каждый фрейм = ряд, 3 языка = колонки
  const clones = [];
  let currentY = PADDING;
  let maxRowW = 0;

  for (let row = 0; row < frames.length; row++) {
    const frame = frames[row];
    const rowW = langs.length * frame.width + (langs.length - 1) * GAP;
    if (rowW > maxRowW) maxRowW = rowW;

    for (let col = 0; col < langs.length; col++) {
      const clone = frame.clone();
      clone.name = langs[col].name;
      section.appendChild(clone);
      clone.x = PADDING + col * (frame.width + GAP);
      clone.y = currentY;
      clones.push({ node: clone, lang: langs[col].code });
    }
    currentY += frame.height + ROW_GAP;
  }

  // Размер секции
  const totalW = PADDING * 2 + maxRowW;
  const totalH = currentY - ROW_GAP + PADDING;
  section.resizeWithoutConstraints(totalW, totalH);

  // Собрать текстовые слои из каждого клона и отправить на перевод
  pendingTranslations = clones.length;

  function collectTexts(n) {
    if (n.name === "Keyboard") return [];
    const result = [];
    if (n.type === "TEXT") result.push(n);
    if ("children" in n) n.children.forEach(c => result.push(...collectTexts(c)));
    return result;
  }

  for (const { node, lang } of clones) {
    const textNodes = collectTexts(node);
    const texts = textNodes.map(t => t.characters);
    const ids = textNodes.map(t => t.id);
    if (texts.length === 0) {
      pendingTranslations--;
      continue;
    }
    figma.ui.postMessage({ type: "translateTexts", texts, ids, lang });
  }

  figma.currentPage.selection = [section];
  figma.viewport.scrollAndZoomIntoView([section]);

  if (pendingTranslations <= 0) {
    figma.notify("Нет текстовых слоёв для перевода");
  } else {
    figma.notify("Переводим...");
  }
}
