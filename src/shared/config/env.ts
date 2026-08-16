export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  appBaseUrl: process.env.NEXT_PUBLIC_APP_BASE_URL ?? "",
  assetBaseUrl: process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "",
  cognitoDomain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "",
  cognitoClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "",
  cognitoRedirectUri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ?? "",
  point3Origin: process.env.NEXT_PUBLIC_POINT3_ORIGIN ?? "",
  mswEnabled: process.env.NEXT_PUBLIC_MSW_ENABLED === "true",
};
