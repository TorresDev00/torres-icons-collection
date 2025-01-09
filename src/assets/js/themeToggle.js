let toggleTheme = () => {
    const theme = localStorage.theme;
    if (theme === "light") {
      localStorage.theme = "dark";
      document.documentElement.classList.add("dark");
    } else {
      localStorage.theme = "light";
      document.documentElement.classList.remove("dark");
    }
  };
  
  const $switch = document.querySelector("#theme-switch");
  $switch.addEventListener("click", function () {
    toggleTheme();
  });