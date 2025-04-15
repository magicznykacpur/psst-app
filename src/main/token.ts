import { homedir } from "os";
import { promises } from "fs";
import { logError } from "./errors";

export let userToken: string | undefined = undefined;

export const loadUserToken = async (): Promise<string> => {
  const configPath = `${homedir()}/.psst.config.json`;

  try {
    const file = await promises.readFile(configPath, "utf-8");
    userToken = file.split(":")[1].replaceAll("}", "").replaceAll('"', "");

    return userToken;
  } catch (e) {
    if ((e as Error).message.includes("no such file or directory")) {
      console.warn("Config file not detected, creating a new one...");

      await promises.writeFile(
        configPath,
        JSON.stringify({ token: "" }),
        "utf-8"
      );
    } else logError(e);

    return "";
  }
};

export const checkTokenValidity = async (
  tokenString: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.API_URL}/validity`, {
      method: "POST",
      body: JSON.stringify({ token: tokenString }),
    });
    return response.status === 200;
  } catch (e) {
    logError(e);
    return false;
  }
};

export const saveUserToken = async (token: string): Promise<void> => {
  const configPath = `${homedir()}/.psst.config.json`;
  const stringifiedConfig = JSON.stringify({ token: token });

  try {
    await promises.writeFile(configPath, stringifiedConfig);
  } catch (e) {
    logError(e);
  }
};

export const clearUserToken = async (): Promise<void> => {
  const configPath = `${homedir()}/.psst.config.json`;
  const stringifiedConfig = JSON.stringify({ token: "" });

  try {
    await promises.writeFile(configPath, stringifiedConfig);
  } catch (e) {
    logError(e);
  }
};
