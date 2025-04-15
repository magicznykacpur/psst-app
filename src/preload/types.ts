export type Api = {
  goToSignup: () => void;
  goToLogin: () => void;
  goToDashboard: (token: string) => void;
  saveUserToken: (token: string) => void;
  signOutUser: () => void;
  request: (path: string, options: RequestInit) => Promise<any | void>;
  requestWithBody: (path: string, options: RequestInit) => Promise<any | void>;
};
