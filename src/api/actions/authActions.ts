import { axiosInstance } from "@/services/axiosService";

export interface CreateEndUserSessionResponse {
  sessionId: string;
}

const getCorrelationId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createEndUserSessionAction =
  async (): Promise<CreateEndUserSessionResponse> => {
    try {
      const response = await axiosInstance.get<CreateEndUserSessionResponse>(
        "end-user/session",
        {
          headers: {
            "x-correlation-id": getCorrelationId(),
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw error.response?.data ?? error;
    }
  };
