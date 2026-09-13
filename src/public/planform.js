const scheduleList = document.querySelector("[data-schedule-list]");
const scheduleTemplate = document.querySelector("#scheduleTemplate");
const addScheduleButton = document.querySelector("[data-add-schedule]");

function nextScheduleIndex() {
  return document.querySelectorAll("[data-schedule-editor]").length + 1;
}

if (scheduleList && scheduleTemplate && addScheduleButton) {
  addScheduleButton.addEventListener("click", () => {
    const index = nextScheduleIndex();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = scheduleTemplate.innerHTML.replaceAll("__INDEX__", String(index)).trim();
    scheduleList.append(...Array.from(wrapper.children));
  });
}
