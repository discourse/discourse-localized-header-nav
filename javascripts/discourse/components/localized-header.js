import Component from "@ember/component";
import discourseComputed, { bind } from "discourse-common/utils/decorators";
import { action, computed } from "@ember/object";
import { schedule } from "@ember/runloop";
import I18n from "I18n";

export default Component.extend({
  parsedSetting: computed(function () {
    return JSON.parse(settings.nav_links);
  }),

  @discourseComputed
  foundLocale() {
    let filteredLocale = this.parsedSetting.filter(
      (obj) => obj.locale === I18n.currentLocale().replace(/_/g, "-")
    );

    if (!filteredLocale.length) {
      // default to language if no locale set
      filteredLocale = this.parsedSetting.filter(
        (obj) => obj.locale === settings.fallback_language
      );
    }

    // index-based parent link class
    filteredLocale[0].links.forEach((link, index) => {
      link.link_class = `localized-header-link-${index}`;
    });

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
    let linkClass;

    if (link !== "global-menu") {
      linkClass = link.link_class;
      if (!link.sublinks.length) {
        return;
      }
    } else {
      linkClass = "global-menu";
    }

    document
      .querySelectorAll(`.localized-header-nav-parent:not(.${linkClass})`)
      .forEach((element) => element.classList.remove("localized-nav-open"));

    document
      .querySelectorAll(`.localized-header-nav-parent:not(.${linkClass}) > ul`)
      .forEach((element) => element.classList.add("hidden"));

    let buildClass = `.localized-header-nav-parent.${linkClass} > ul`;

    document
      .querySelector(`.localized-header-nav-parent.${linkClass}`)
      .classList.toggle("localized-nav-open");

    document.querySelector(buildClass).classList.toggle("hidden");
  },
});
