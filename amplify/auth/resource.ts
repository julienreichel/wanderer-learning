import { defineAuth, secret } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Welcome to my app!",
      verificationEmailBody: (createCode) =>
        `Use this code to confirm your account: ${createCode()}`,
    },
    phone: true,
    externalProviders: {
      google: {
        clientId: secret("GOOGLE_CLIENT_ID"),
        clientSecret: secret("GOOGLE_CLIENT_SECRET"),
        scopes: ["email"],
      },
      callbackUrls: [
        "http://localhost:9000/login",
        "https://wandererlearning.com/login",
        "https://beta.wandererlearning.com/login",
      ],
      logoutUrls: [
        "http://localhost:9000/login",
        "https://wandererlearning.com/login",
        "https://wandererlearning.com/login",
      ],
    },
  },

  multifactor: {
    mode: "OPTIONAL",
    totp: true,
  },

  userAttributes: {
    fullname: {
      mutable: true,
      required: false,
    },
    profilePicture: {
      mutable: true,
      required: false,
    },
    phoneNumber: {
      mutable: true,
      required: false,
    },
    address: {
      mutable: true,
      required: false,
    },
  },
  groups: ["admin", "teacher", "student"],
});
