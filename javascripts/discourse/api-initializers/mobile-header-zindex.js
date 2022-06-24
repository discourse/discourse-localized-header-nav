// For mobile, we need to alter the z-index of the header when the menus are open
// otherwise the custom menu will appear above the menus

import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "mobile-header-zindex",
  initialize() {
      withPluginApi("0.8", (api) => {
        api.decorateWidget('header:after', helper => {
          if (helper.widget.site.mobileView) {
            if (helper.state.hamburgerVisible || helper.state.searchVisible || helper.state.userVisible ) {
            document.querySelector(".d-header-wrap").classList.add("custom-menu-open");
            } else {
            document.querySelector(".d-header-wrap").classList.remove("custom-menu-open");
            }
          }
        });
      });
  },
};
