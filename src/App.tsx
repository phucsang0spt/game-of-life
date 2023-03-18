import "react-square-div/lib/styles.css";
import { StatusBar, Style } from "@capacitor/status-bar";
import { GameContainer } from "./game-container";
import { Capacitor } from "@capacitor/core";

if (Capacitor.isPluginAvailable("StatusBar")) {
  StatusBar.setStyle({ style: Style.Dark });
}

const App: React.FC = () => <GameContainer />;

export default App;
