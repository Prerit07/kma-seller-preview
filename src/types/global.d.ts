export {};

declare global {
  interface Window {
    DigiboostSdk?: (config: {
      gateway: string;
      token: string;
      selector: string;
      style?: {
        backgroundColor?: string;
        color?: string;
        padding?: string;
        borderRadius?: string;
        cursor?: string;
      };
      onSuccess?: (data: unknown) => void;
      onFailure?: (error: unknown) => void;
    }) => void;
  }
}
