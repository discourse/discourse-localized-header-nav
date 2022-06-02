import Component from "@ember/component";
import discourseComputed, { bind } from "discourse-common/utils/decorators";
import { action, computed } from "@ember/object";
import { schedule } from "@ember/runloop";
import { dasherize } from "@ember/string";
import I18n from "I18n";

export default Component.extend({
  parsedSetting: computed(function () {
    return JSON.parse(settings.nav_links);
  }),

  @discourseComputed
  foundLocale() {
    let filteredLocale = this.parsedSetting.filter(
      (obj) => obj.locale === I18n.currentLocale()
    );

    if (!filteredLocale.length) {
      // default to language if no locale set
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
  toggleHelp(link) {
    let dashClass;

    if (link !== "global-menu") {
      dashClass = dasherize(link.link_text);
      if (!link.sublinks.length) {
        return;
      }
    } else {
      dashClass = "global-menu";
    }

    document
      .querySelectorAll(`.localized-header-nav-parent:not(.${dashClass})`)
      .forEach((element) => element.classList.remove("localized-nav-open"));

    document
      .querySelectorAll(`.localized-header-nav-parent:not(.${dashClass}) > ul`)
      .forEach((element) => element.classList.add("hidden"));

    let buildClass = `.localized-header-nav-parent.${dashClass} > ul`;

    document
      .querySelector(`.localized-header-nav-parent.${dashClass}`)
      .classList.toggle("localized-nav-open");

    document.querySelector(buildClass).classList.toggle("hidden");
  },
});
