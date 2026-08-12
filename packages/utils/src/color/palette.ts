import BlueDark from "./dark/blue.json";
import GreenDark from "./dark/green.json";
import NavyBlueDark from "./dark/navyblue.json";
import NeutralDark from "./dark/neutral.json";
import PurpleDark from "./dark/purple.json";
import RedDark from "./dark/red.json";
import SapphireDark from "./dark/sapphire.json";
import SemanticDark from "./dark/semantic.json";
import TealDark from "./dark/teal.json";
import VioletDark from "./dark/violet.json";
import YellowGreenDark from "./dark/yellow-green.json";
import YellowDark from "./dark/yellow.json";
import BlueLight from "./light/blue.json";
import GreenLight from "./light/green.json";
import NavyBlueLight from "./light/navyblue.json";
import NeutralLight from "./light/neutral.json";
import PurpleLight from "./light/purple.json";
import RedLight from "./light/red.json";
import SapphireLight from "./light/sapphire.json";
import SemanticLight from "./light/semantic.json";
import TealLight from "./light/teal.json";
import VioletLight from "./light/violet.json";
import YellowGreenLight from "./light/yellow-green.json";
import YellowLight from "./light/yellow.json";

export default {
  light: {
    blue: BlueLight,
    green: GreenLight,
    navyblue: NavyBlueLight,
    sapphire: SapphireLight,
    purple: PurpleLight,
    red: RedLight,
    teal: TealLight,
    violet: VioletLight,
    yellow: YellowLight,
    "yellow-green": YellowGreenLight,
    neutral: NeutralLight,
    semantic: SemanticLight,
  },
  dark: {
    blue: BlueDark,
    green: GreenDark,
    navyblue: NavyBlueDark,
    sapphire: SapphireDark,
    purple: PurpleDark,
    red: RedDark,
    teal: TealDark,
    violet: VioletDark,
    yellow: YellowDark,
    "yellow-green": YellowGreenDark,
    neutral: NeutralDark,
    semantic: SemanticDark,
  },
};
