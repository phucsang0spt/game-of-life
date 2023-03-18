import { Filesystem, Directory } from "@capacitor/filesystem";
import { isPlatform } from "@ionic/react";
import { tick } from "react-simple-game-engine/lib/utils";
import { genId } from "utils";
import {
  NativeSettings,
  AndroidSettings,
  IOSSettings,
} from "capacitor-native-settings";

export async function downloadFile(filename: string, src: string) {
  const isAndroidOrIos = isPlatform("android") || isPlatform("ios");
  if (isAndroidOrIos) {
    const result = await Filesystem.writeFile({
      path: `${genId()}-${filename}`,
      data: src,
      directory: Directory.Documents,
    }).catch((err) => {
      return null;
    });
    if (result) {
      await tick(1000);
      return true;
    } else {
      alert("Please goto settings enabled access files");
      openAppSettings();
      return false;
    }
  } else {
    const a = document.createElement("a");
    a.href = src;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(src);

    document.body.removeChild(a);
    return true;
  }
}

export async function permissionWriteFile() {
  const status = await Filesystem.checkPermissions();
  if (status.publicStorage === "denied") {
    alert("Please goto settings enabled access files");
    return false;
  }
  return true;
}

export function openAppSettings() {
  NativeSettings.open({
    optionAndroid: AndroidSettings.ApplicationDetails,
    optionIOS: IOSSettings.App,
  });
}
