import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
import { bind } from "discourse-common/utils/decorators";
import EmberObject, { action, computed } from "@ember/object";
import { schedule } from "@ember/runloop";

export default Component.extend({
  parsedSetting: computed(function () {
    return JSON.parse(settings.nav_links);
  }),

  @discourseComputed
  foundLocale() {
    let filteredLocale = this.parsedSetting.filter(
      (obj) => obj.locale === I18n.currentLocale()
    );

    if (!filteredLocale) {
      // default to languge if no locale set
      filteredLocale = this.parsedSetting.filter(
        (obj) => obj.locale === settings.fallback_language
      );
    }

    return filteredLocale[0];
  },

  _cleanUp() {
    document
      .querySelectorAll(".localized-header-nav-parent > ul")
      .forEach((element) => element.classList.add("hidden"));

    document
      .querySelectorAll(`.localized-header-nav-parent`)
      .forEach((element) => element.classList.remove("localized-nav-open"));
  },

  didInsertElement() {
    this.appEvents.on("page:changed", this, "_cleanUp");
    schedule("afterRender", () => {
      document.addEventListener("click", this.outsideClick);
    });
  },

  willDestroyElement() {
    this.appEvents.off("page:changed", this, "_cleanUp");
    document.removeEventListener("click", this.outsideClick);
  },

  @bind
  outsideClick(e) {
    let menus = document.querySelector(".localized-header-nav");
    if (menus && !menus.contains(e.target)) {
      this._cleanUp();
    }
  },

  @action
  toggleHelp(className) {
    document
      .querySelectorAll(`.localized-header-nav-parent:not(.${className})`)
      .forEach((element) => element.classList.remove("localized-nav-open"));

    document
      .querySelectorAll(`.localized-header-nav-parent:not(.${className}) > ul`)
      .forEach((element) => element.classList.add("hidden"));

    let buildClass = `.localized-header-nav-parent.${className} > ul`;

    document
      .querySelector(`.localized-header-nav-parent.${className}`)
      .classList.toggle("localized-nav-open");

    document.querySelector(buildClass).classList.toggle("hidden");
  },
});
