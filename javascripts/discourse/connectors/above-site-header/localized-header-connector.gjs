import Component from "@ember/component";
import { classNames } from "@ember-decorators/component";
import LocalizedHeader from "../../components/localized-header";

@classNames("above-site-header-outlet", "localized-header-connector")
export default class LocalizedHeaderConnector extends Component {
  <template><LocalizedHeader /></template>
}
