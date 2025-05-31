import Component from "@ember/component";
import { fn } from "@ember/helper";
import { on } from "@ember/modifier";
import { action, computed } from "@ember/object";
import { schedule } from "@ember/runloop";
import icon from "discourse/helpers/d-icon";
import routeAction from "discourse/helpers/route-action";
import discourseComputed, { bind } from "discourse/lib/decorators";
import I18n, { i18n } from "discourse-i18n";

export default class LocalizedHeader extends Component {
  @computed
  get parsedSetting() {
    return JSON.parse(settings.nav_links);
  }

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
    filteredLocale[0]?.links.forEach((link, index) => {
      link.link_class = `localized-header-link-${index}`;
    });

    return filteredLocale[0];
  }

  _cleanUp() {
    document
      .querySelectorAll(".localized-header-nav-parent > ul")
      .forEach((element) => element.classList.add("hidden"));

    document
      .querySelectorAll(`.localized-header-nav-parent`)
      .forEach((element) => element.classList.remove("localized-nav-open"));

    document
      .querySelector(".localized-header-connector")
      .classList.remove("submenu-active");
  }

  didInsertElement() {
    super.didInsertElement(...arguments);
    this.appEvents.on("page:changed", this, "_cleanUp");
    schedule("afterRender", () => {
      document.addEventListener("click", this.outsideClick);
    });
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);
    this.appEvents.off("page:changed", this, "_cleanUp");
    document.removeEventListener("click", this.outsideClick);
  }

  @bind
  outsideClick(e) {
    let menus = document.querySelector(".localized-header-nav");
    if (menus && !menus.contains(e.target)) {
      this._cleanUp();
    }
  }

  @action
  toggleHelp(link, event) {
    event.preventDefault();

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

    document
      .querySelector(".localized-header-connector")
      .classList.add("submenu-active");

    document.querySelector(buildClass).classList.toggle("hidden");
  }

  @action
  showLogin(event) {
    event.preventDefault();
    routeAction("showLogin");
  }

  <template>
    <ul class="localized-header-nav">
      {{#each this.foundLocale.links as |l|}}
        <li
          data-divider={{settings.nav_divider}}
          class="{{if l.sublinks 'localized-header-nav-parent'}}
            {{l.link_class}}"
        >
          <a
            {{(if l.sublinks (modifier on "click" (fn this.toggleHelp l)))}}
            href={{unless l.sublinks l.link}}
          >
            {{l.link_text}}
            {{#if l.sublinks}}
              {{icon "chevron-up" class="localized-header-menu-opened"}}
              {{icon "chevron-down" class="localized-header-menu-closed"}}
            {{/if}}
          </a>

          {{#if l.sublinks}}
            <ul class="hidden">
              {{#each l.sublinks as |sl|}}
                <li>
                  <a href={{sl.link}}>
                    {{sl.link_text}}
                  </a>
                </li>
              {{/each}}
            </ul>
          {{/if}}
        </li>
      {{/each}}

      <li class="localized-header-nav-parent global-menu">
        <a href {{on "click" (fn this.toggleHelp "global-menu")}}>
          {{icon settings.global_icon}}
          {{icon "chevron-up" class="localized-header-menu-opened"}}
          {{icon "chevron-down" class="localized-header-menu-closed"}}
        </a>

        <ul class="hidden">
          <li>
            {{#if this.currentUser}}
              <a href={{settings.logged_in_url}}>
                {{icon settings.logged_in_icon}}
                {{i18n (themePrefix "logged_in_message")}}
              </a>
            {{else}}
              {{#if settings.logged_out_url}}
                <a href={{settings.logged_out_url}}>
                  {{icon settings.logged_out_icon}}
                  {{i18n (themePrefix "logged_out_message")}}
                </a>
              {{else}}
                <a href {{on "click" this.showLogin}}>
                  {{icon settings.logged_out_icon}}
                  {{i18n (themePrefix "logged_out_message")}}
                </a>
              {{/if}}
            {{/if}}
          </li>
        </ul>
      </li>
    </ul>
  </template>
}
