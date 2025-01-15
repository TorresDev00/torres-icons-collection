import { openModal, closeModal } from "free-astro-components";

document.addEventListener("DOMContentLoaded", function () {
  // Botones de selección de iconos
  const buttons = document.querySelectorAll(".buttonIcon");
  // Modal y botones de estilo
  let modal = document.getElementById("modal-id");
  let colorInput = document.getElementById("hs-color-input");
  let rangeSlider = document.getElementById("rangeSlider");
  let rangeValue = document.getElementById("rangeValue");
  // Botones de cierre y exportación
  const closeButton = modal?.querySelector(".close");
  const closeModalButton = modal?.querySelector(".ac-modal-close");
  // Botones de exportación y copiar svg
  const exportButton = modal?.querySelector(".export-button");
  const exportPNGButton = modal?.querySelector(".export-png-button");
  const copyIndicator = document.getElementById("copyIndicator");

  const defaultColor = "#ffffff";
  const defaultSize = 100;

  function resetModalValues() {
    colorInput.value = defaultColor;
    rangeSlider.value = defaultSize;
    rangeValue.textContent = `${defaultSize}px`;

    const svgContainer = modal.querySelector(".iconPreview");
    const svgElement = svgContainer?.querySelector("svg");

    if (svgElement) {
      svgElement.style.fill = defaultColor;
      svgElement.style.width = `${defaultSize}px`;
      svgElement.style.height = `${defaultSize}px`;
    }
  }

  // Función para cargar y renderizar el ícono en el modal
  async function loadIcon(iconUrl, svgContainer) {
    svgContainer.innerHTML = `
      <div
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
        role="status">
        <span
          class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
          >Loading...</span>
      </div>
    `;
    try {
      const response = await fetch(iconUrl);
      const svg = await response.text();
      svgContainer.innerHTML = svg;

      let svgElement = svgContainer.querySelector("svg");
      if (svgElement) {
        svgElement.classList.add("fill-black", "dark:fill-white");
        svgElement.style.width = `${rangeSlider.value}px`;
        svgElement.style.height = `${rangeSlider.value}px`;
      }
    } catch (error) {
      console.error("Error loading icon:", error);
      svgContainer.innerHTML = `<div class="text-red-500">Error loading icon</div>`;
    }
  }

  // Funcion para actualizar color del SVG
  function updateIconColor(svgContainer) {
    let svgElment = svgContainer.querySelector("svg");
    if (svgElment) {
      svgElment.style.fill = colorInput.value;
    }
  }

  // Función para actualizar el valor del tamaño del icono
  function updateIconSize(svgContainer) {
    let svgElment = svgContainer.querySelector("svg");
    if (svgElment) {
      svgElment.style.width = `${rangeSlider.value}px`;
      svgElment.style.height = `${rangeSlider.value}px`;
    }
    rangeValue.textContent = `${rangeSlider.value}px`;
  }

  function convertStylesToAttributes(element) {
    const style = element.getAttribute("style");
    if (style) {
      const styleProperties = style.split(";").map((s) => s.trim());
      styleProperties.forEach((property) => {
        const [key, value] = property.split(":").map((p) => p.trim());
        if (key && value) {
          switch (key) {
            case "fill":
            case "stroke":
            case "width":
            case "height":
            case "stroke-width":
              element.setAttribute(key, value);
              break;
            // Agrega más propiedades según las necesidades
          }
        }
      });
      element.removeAttribute("style"); // Eliminar el atributo `style`
    }
  }

  function exportSVG() {
    const svgContainer = modal.querySelector(".iconPreview");
    const svgElement = svgContainer?.querySelector("svg");
    const iconName = document.querySelector(".titleModal")?.textContent;

    if (svgElement) {
      // 1. Eliminar las clases
      svgElement.removeAttribute("class");
      svgElement.querySelectorAll("*").forEach((child) => {
        child.removeAttribute("class");
      });

      convertStylesToAttributes(svgElement);
      svgElement.querySelectorAll("*").forEach(convertStylesToAttributes);

      // 3. Serializar y exportar el SVG
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${iconName}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      console.error("No SVG element found for export.");
    }
  }

  function exportPNG(svgElement, filename, scale = 3) {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

    // Escalar dimensiones para alta resolución
    const originalWidth = svgElement.viewBox.baseVal.width || svgElement.clientWidth;
    const originalHeight = svgElement.viewBox.baseVal.height || svgElement.clientHeight;

    const width = originalWidth * scale;
    const height = originalHeight * scale;

    canvas.width = width;
    canvas.height = height;

    // Ajustar calidad de renderizado
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.png`;
        link.click();

        URL.revokeObjectURL(svgUrl);
      }, "image/png");
    };

    // Manejar errores
    img.onerror = () => {
      console.error("Error al cargar el SVG para exportar.");
    };

    // Configurar la URL del SVG como fuente de la imagen
    img.src = svgUrl;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", async function () {
      const iconName = button.getAttribute("data-icon-name");
      const iconDescription = button.getAttribute("data-icon-description");
      const iconUrl = button.getAttribute("data-icon-url");

      modal.querySelector(".titleModal").textContent = iconName;
      modal.querySelector(".descriptionModal").textContent = iconDescription;

      const svgContainer = modal.querySelector(".iconPreview");
      if (svgContainer && iconUrl) {
        await loadIcon(iconUrl, svgContainer);
        colorInput?.addEventListener("input", () => {
          updateIconColor(svgContainer);
        });
        rangeSlider?.addEventListener("input", () => {
          updateIconSize(svgContainer);
        });
      }
      openModal(modal);
    });
  });

  function showLoaderAndCheck() {
    // Mostrar loader
    copyIndicator.innerHTML = `
      <div
        class="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-gray-500 motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
        role="status">
        <span
          class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
        >Loading...</span>
      </div>
    `;

    // Después de 1.5 segundos, mostrar el check
    setTimeout(() => {
      copyIndicator.innerHTML = `
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-green-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 16.2l-4.2-4.2L3 13.8l6 6 12-12-1.4-1.4L9 16.2z"
          />
        </svg>
      `;

      // Después de 1.5 segundos adicionales, restaurar el ícono de copiar
      setTimeout(() => {
        copyIndicator.innerHTML = `
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zM20 5H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h12v14z"
            />
          </svg>
        `;

        // Seleccionar el botón nuevamente y reasignar el evento
        copyIndicator.querySelector("svg").addEventListener("click", copySVG);
      }, 1500); // Duración del check antes de restaurar
    }, 1500); // Duración del loader
  }

  function copySVG() {
    const svgContainer = modal.querySelector(".iconPreview");
    const svgElement = svgContainer?.querySelector("svg");

    if (svgElement) {
      
      const svgClone = svgElement.cloneNode(true);

      convertStylesToAttributes(svgClone);
      svgClone.querySelectorAll("*").forEach(convertStylesToAttributes);

      const svgData = new XMLSerializer().serializeToString(svgClone);

      navigator.clipboard
        .writeText(svgData)
        .then(() => {
          showLoaderAndCheck();
        })
        .catch((err) => {
          console.error("Error copiando SVG:", err);
        });
    } else {
      console.error("No SVG element found for copy.");
    }
  }

  // Delegación de eventos al inicializar el DOM
  copyIndicator.addEventListener("click", (event) => {
    if (event.target.closest("svg")) {
      copySVG();
    }
  });

  exportButton?.addEventListener("click", exportSVG);

  exportPNGButton?.addEventListener("click", () => {
    const svgContainer = modal.querySelector(".iconPreview");
    const svgElement = svgContainer?.querySelector("svg");
    const iconName = document.querySelector(".titleModal")?.textContent;

    if (svgElement) {
      exportPNG(svgElement, iconName, 10);
    } else {
      console.error("No se encontró ningún SVG para exportar.");
    }
  });

  // Eventos para cerrar el modal y restaurar valores
  closeButton?.addEventListener("click", () => {
    resetModalValues();
    closeModal(modal);
  });

  closeModalButton?.addEventListener("click", () => {
    resetModalValues();
    closeModal(modal);
  });
});
